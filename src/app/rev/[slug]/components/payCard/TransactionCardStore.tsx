//  Transaction Card Store
//  Follows the same Zustand + React Context pattern as RevnetDataContext
//  READ MORE: https://tkdodo.eu/blog/zustand-and-react-context
//
//  What lives here (and why):
//  - Shared card state: active tab, selected payment token + token list, start-time clock.
//    These are computed in TransactionCard and re-computed / prop-drilled into PayTab,
//    PayActionButton etc. One source of truth removes the duplicated `hasStarted` logic.
//  - Form inputs per tab (pay / withdraw / loan). Tabs are conditionally rendered so
//    local useState is wiped on every tab switch; in the store the inputs survive.
//  - Transaction progress (step status, approvals) that is prop-drilled into the
//    Pay/Loan steppers.
//  - Reclaimable surpluses: fetched once per card rather than on every WithdrawTab mount.
//
//  What does NOT live here (intentionally):
//  - Async/server data already cached by react-query/wagmi (balances, previewPayFor,
//    borrowableAmountFrom, reclaimable amounts). Copying it into zustand just adds sync bugs.
//  - Purely presentational, single-component state (dialog open/close, dialog stage,
//    terms checkbox). Keep those local unless a second component needs them.

"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { createStore, StoreApi, useStore } from "zustand";
import {
  JBChainId,
  useBendystrawQuery,
  useJBContractContext,
} from "@bananapus/nana-sdk-react";
import { JBVersion, USDC_ADDRESSES } from "@bananapus/nana-sdk-core";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { useRulesetData } from "@/hooks/useRulesetData";
import { getTokensForChain, Token } from "@/lib/token";
import {
  getProjectsReclaimableSurplus,
  Surplus,
} from "@/lib/reclaimableSurplus";
import { SuckerGroupDocument } from "@/generated/graphql";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

export type TransactionTabType = "buy" | "withdraw" | "loan";

// Source of truth for payV2 (PayActionButton / PayStepper)
export type PaymentStatusType =
  | ""
  | "signing-approval"
  | "rejected-approval"
  | "signing-pay"
  | "rejected-pay"
  | "success";

// Mirrors loanTab/LoanActionButton -> move the source of truth here when implementing
export type BorrowStatus =
  | ""
  | "signing-permission"
  | "rejected-permission"
  | "signing-borrow"
  | "rejected-borrow"
  | "success";

const DEFAULT_PREPAID_PERCENT = 2.5;
const COUNTDOWN_WINDOW_SECONDS = 24 * 60 * 60;

interface TransactionCardStore {
  // --- Card State ---
  activeTab: TransactionTabType;
  setActiveTab: (tab: TransactionTabType) => void;

  // Clock used for the "Token Sale Starts in" countdown + hasStarted checks
  now: number; // unix seconds
  startDate: number | undefined; // unix seconds, first ruleset start
  setNow: (now: number) => void;
  setStartDate: (startDate: number | undefined) => void;

  // --- Token Selection (Buy) ---
  tokens: Token[];
  selectedToken: Token | undefined;
  setSelectedToken: (token: Token) => void;
  // Recomputes token list for a chain and keeps the same "kind" of token
  // selected (native -> native, USDC -> USDC). Replaces PayTab.handleChainChange token logic.
  syncTokensForChain: (chainId: JBChainId, version: JBVersion) => void;

  // --- Pay Form ---
  payAmount: string; // amountA
  receiveAmountBigInt: bigint; // amountB (v4/v5 local quote path)
  memo: string;
  setPayAmount: (amount: string) => void;
  setReceiveAmountBigInt: (amount: bigint) => void;
  setMemo: (memo: string) => void;

  // --- Pay Transaction ---
  paymentStatus: PaymentStatusType;
  userHasApproved: boolean;
  isPaying: boolean;
  setPaymentStatus: (status: PaymentStatusType) => void;
  setUserHasApproved: (approved: boolean) => void;
  setIsPaying: (isPaying: boolean) => void;

  // --- Withdraw Form ---
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  surpluses: Surplus[] | null;
  setSurpluses: (surpluses: Surplus[]) => void;

  // --- Loan Form ---
  collateralAmount: string;
  prepaidPercent: number;
  setCollateralAmount: (amount: string) => void;
  setPrepaidPercent: (percent: number) => void;

  // --- Loan Transaction ---
  borrowStatus: BorrowStatus;
  userHasBorrowPerm: boolean;
  isBorrowing: boolean;
  setBorrowStatus: (status: BorrowStatus) => void;
  setUserHasBorrowPerm: (hasPerm: boolean) => void;
  setIsBorrowing: (isBorrowing: boolean) => void;

  // --- Resets ---
  resetPayTransaction: () => void; // e.g. on token change / successful pay
  resetLoanTransaction: () => void;
  resetForms: () => void; // e.g. on chain change
}

/* -------------------------------------------------------------------------- */
/*                                Initial State                               */
/* -------------------------------------------------------------------------- */

const initialPayTransaction = {
  paymentStatus: "" as PaymentStatusType,
  userHasApproved: false,
  isPaying: false,
};

const initialLoanTransaction = {
  borrowStatus: "" as BorrowStatus,
  isBorrowing: false,
  // userHasBorrowPerm is chain/account dependent and synced from useHasBorrowPermission,
  // so it is intentionally not reset here.
};

const initialForms = {
  payAmount: "",
  receiveAmountBigInt: 0n,
  memo: "",
  withdrawAmount: "",
  collateralAmount: "",
  prepaidPercent: DEFAULT_PREPAID_PERCENT,
};

// Prevents negative input values, shared by every amount input in the card
const sanitizeAmount = (value: string) => (value.startsWith("-") ? "0" : value);

/* -------------------------------------------------------------------------- */
/*                                   Context                                  */
/* -------------------------------------------------------------------------- */

const TransactionCardContext = createContext<
  StoreApi<TransactionCardStore> | undefined
>(undefined);

interface ContextPropType {
  children: ReactNode;
  initialTab?: TransactionTabType;
}

// Must be rendered inside RevnetDataProvider + the JB contexts.
// Tip: wrap BOTH <TransactionCard /> instances in layout.tsx (mobile + desktop)
// with a single provider so inputs survive breakpoint changes.
export const TransactionCardProvider = ({
  children,
  initialTab = "buy",
}: ContextPropType) => {
  // Foundational Hooks
  const project = useRevnetDataStore((state) => state.project);
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const peerChainId = selectedSucker?.peerChainId;

  const { version } = useJBContractContext();
  const { allRulesets } = useRulesetData({ projectId: project.projectId });
  const startDate = allRulesets?.[0]?.start;

  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: project.suckerGroupId ?? "" },
    { enabled: !!project.suckerGroupId }
  );

  const [store] = useState(() => {
    const initialTokens = getTokensForChain(peerChainId, version);

    return createStore<TransactionCardStore>((set, get) => ({
      // Card State
      activeTab: initialTab,
      setActiveTab: (tab) => set({ activeTab: tab }),

      now: Math.floor(Date.now() / 1000),
      startDate,
      setNow: (now) => set({ now }),
      setStartDate: (startDate) => set({ startDate }),

      // Token Selection
      tokens: initialTokens,
      selectedToken: initialTokens[0],
      setSelectedToken: (token) => {
        if (token.address === get().selectedToken?.address) return;
        set({ selectedToken: token, ...initialPayTransaction });
      },
      syncTokensForChain: (chainId, version) => {
        const tokens = getTokensForChain(chainId, version);
        const current = get().selectedToken;

        const usdc = USDC_ADDRESSES[chainId]?.toLowerCase();
        const matched = !current
          ? undefined
          : current.isNative
            ? tokens.find((t) => t.isNative)
            : tokens.find((t) => t.address.toLowerCase() === usdc);

        set({
          tokens,
          selectedToken: matched ?? tokens[0],
          ...initialPayTransaction,
        });
      },

      // Pay Form
      payAmount: initialForms.payAmount,
      receiveAmountBigInt: initialForms.receiveAmountBigInt,
      memo: initialForms.memo,
      setPayAmount: (amount) => set({ payAmount: sanitizeAmount(amount) }),
      setReceiveAmountBigInt: (amount) =>
        set({ receiveAmountBigInt: amount }),
      setMemo: (memo) => set({ memo }),

      // Pay Transaction
      ...initialPayTransaction,
      setPaymentStatus: (status) => set({ paymentStatus: status }),
      setUserHasApproved: (approved) => set({ userHasApproved: approved }),
      setIsPaying: (isPaying) => set({ isPaying }),

      // Withdraw Form
      withdrawAmount: initialForms.withdrawAmount,
      setWithdrawAmount: (amount) =>
        set({ withdrawAmount: sanitizeAmount(amount) }),
      surpluses: null,
      setSurpluses: (surpluses) => set({ surpluses }),

      // Loan Form
      collateralAmount: initialForms.collateralAmount,
      prepaidPercent: initialForms.prepaidPercent,
      setCollateralAmount: (amount) =>
        set({ collateralAmount: sanitizeAmount(amount) }),
      setPrepaidPercent: (percent) => set({ prepaidPercent: percent }),

      // Loan Transaction
      ...initialLoanTransaction,
      userHasBorrowPerm: false,
      setBorrowStatus: (status) => set({ borrowStatus: status }),
      setUserHasBorrowPerm: (hasPerm) => set({ userHasBorrowPerm: hasPerm }),
      setIsBorrowing: (isBorrowing) => set({ isBorrowing }),

      // Resets
      resetPayTransaction: () => set({ ...initialPayTransaction }),
      resetLoanTransaction: () => set({ ...initialLoanTransaction }),
      resetForms: () =>
        set({
          ...initialForms,
          ...initialPayTransaction,
          ...initialLoanTransaction,
        }),
    }));
  });

  // Keep token list + selected token in sync with the selected sucker.
  // Covers chain changes from ANY selector (Pay, Withdraw, Loan), which
  // previously left selectedToken pointing at the old chain's token.
  useEffect(() => {
    if (!peerChainId) return;
    store.getState().syncTokensForChain(peerChainId, version);
  }, [peerChainId, version, store]);

  // Keep start date in sync once rulesets load
  useEffect(() => {
    store.getState().setStartDate(startDate);
  }, [startDate, store]);

  // Countdown ticker - only ticks when the sale hasn't started and starts in < 24h.
  // (Depends on startDate so it starts once rulesets load, unlike the old [] effect.)
  useEffect(() => {
    if (!startDate) return;

    const timeUntilStart = startDate - Math.floor(Date.now() / 1000);
    if (timeUntilStart <= 0 || timeUntilStart > COUNTDOWN_WINDOW_SECONDS) return;

    const id = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      store.getState().setNow(now);
      if (now >= startDate) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, [startDate, store]);

  // Fetch reclaimable surpluses once the sucker group has loaded
  useEffect(() => {
    const projects = suckerGroupData?.suckerGroup?.projects?.items;
    if (!projects?.length) return;

    let cancelled = false;
    getProjectsReclaimableSurplus(projects).then((surpluses) => {
      if (!cancelled) store.getState().setSurpluses(surpluses);
    });

    return () => {
      cancelled = true;
    };
  }, [suckerGroupData, store]);

  return (
    <TransactionCardContext.Provider value={store}>
      {children}
    </TransactionCardContext.Provider>
  );
};

export function useTransactionCardStore<T>(
  selector: (state: TransactionCardStore) => T
) {
  const context = useContext(TransactionCardContext);

  if (!context) {
    throw new Error("TransactionCardContext Provider is missing");
  }

  return useStore(context, selector);
}

/* -------------------------------------------------------------------------- */
/*                              Derived Selectors                             */
/* -------------------------------------------------------------------------- */
//  Usage: const hasStarted = useTransactionCardStore(selectHasStarted);
//  Derived values stay as selectors (not stored) so they can never go stale.

export const selectTimeUntilStart = (state: TransactionCardStore) =>
  state.startDate ? state.startDate - state.now : 0;

export const selectHasStarted = (state: TransactionCardStore) =>
  selectTimeUntilStart(state) <= 0;

export const selectSurplusForChain =
  (chainId: JBChainId | undefined) => (state: TransactionCardStore) =>
    state.surpluses?.find((s) => s.chainId === chainId) ?? null;
