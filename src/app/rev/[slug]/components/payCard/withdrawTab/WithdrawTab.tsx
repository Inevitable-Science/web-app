import Image from "next/image";
import {
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "@bananapus/nana-sdk-react";
import { truncateNumber } from "@/lib/utils";
import { WithdrawActionButton } from "./WithdrawActionButton";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { WithdrawSelector } from "./WithdrawSelector";
import { ChainLogo } from "@/components/ChainLogo";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { Button } from "@/components/ui/button";
import { PayInput } from "@/components/PayInput";
import { formatUnits, parseUnits } from "viem";
import { 
  getJBContractAddress, 
  JB_TOKEN_DECIMALS, 
  JBCoreContracts, 
  jbMultiTerminalAbi 
} from "@bananapus/nana-sdk-core";
import { cashOutProtocolFee } from "@bananapus/nana-sdk-core/v6/cash-out";
import { useDebounce } from "use-debounce";
import {
  selectSurplusForChain,
  useTransactionCardStore,
} from "../TransactionCardStore";
import { useAccount, useReadContract } from "wagmi";


export function WithdrawTab() {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const { peerChainId: selectedChain, projectId: activeProjectId } =
    selectedSucker;

  const withdrawAmount = useTransactionCardStore((state) => state.withdrawAmount);
  const setWithdrawAmount = useTransactionCardStore((state) => state.setWithdrawAmount);
  const [debouncedWithdrawAmount] = useDebounce(withdrawAmount, 600);

  // Surpluses are fetched once in TransactionCardProvider
  const surplus = useTransactionCardStore(selectSurplusForChain(selectedChain));

  const { address } = useAccount();

  const { version } = useJBContractContext();
  const { token } = useJBTokenContext();
  const baseToken = useProjectBaseToken();

  // Token Balances
  const { 
    data: balances, 
    isLoading: isBalancesLoading
  } = useSuckersUserTokenBalance();
  const currentChainBalOBJ = balances?.find((token) => token.chainId === selectedChain)
    ?.balance;
  const currentChainBalanceBigInt = currentChainBalOBJ?.value ?? 0n;

  const projectTokenDecimals = token?.data?.decimals || JB_TOKEN_DECIMALS;
  const withdrawAmountBigInt = parseUnits(withdrawAmount, projectTokenDecimals); // preserve for instant UI changes

  const withdrawAmountBigIntDB = parseUnits(
    debouncedWithdrawAmount,
    projectTokenDecimals
  ); // use only for state within hook
  const isDebouncing = debouncedWithdrawAmount !== withdrawAmount;

  const zeroSurplusValue = Number(surplus?.value ?? 0) == 0;

  const receiveTokenAddress = baseToken.tokenMap[selectedChain].token;

  const quoteCashOutCount =
    withdrawAmountBigIntDB > currentChainBalanceBigInt
      ? currentChainBalanceBigInt
      : withdrawAmountBigIntDB;

  const { data: cashOutPreview, isLoading: isCashOutPreviewLoading } = useReadContract({
    abi: jbMultiTerminalAbi,
    address: getJBContractAddress(JBCoreContracts.JBMultiTerminal, version, selectedChain), // must match handleWithdraw
    chainId: selectedChain,
    functionName: "previewCashOutFrom",
    args: address && quoteCashOutCount
      ? [
          address,             // holder
          activeProjectId,     // projectId
          quoteCashOutCount,   // cashOutCount
          receiveTokenAddress, // tokenToReclaim
          address,             // beneficiary
          "0x0",               // metadata (must match handleWithdraw)
        ]
      : undefined,
    query: {
      enabled: !!address && !!quoteCashOutCount,
      refetchInterval: 40_000, // refetch every 40 seconds
    },
  });

  // outputs: [ruleset, reclaimAmount, cashOutTaxRate, hookSpecifications]
  const previewReclaimAmount = cashOutPreview?.[1] ?? 0n;
  const previewCashOutTaxRate = cashOutPreview?.[2] ?? 0n; // of 10_000

  // Fees: the REV fee (2.5% of tokens) is handled by the revnet data hook, so it is
  // already reflected in the preview. previewCashOutFrom is gross of the JB terminal
  // fee, so deduct it here with the exact contract math (reclaimAmount / 40 when taxed).
  // feeFreeSurplus omitted -> untaxed cash outs are quoted fee-free.
  const cashOutQuoteBigInt =
    previewReclaimAmount -
    cashOutProtocolFee({
      reclaimAmount: previewReclaimAmount,
      cashOutTaxRate: previewCashOutTaxRate,
    });

  // Account for slippage (1%)
  const SLIPPAGE_BPS = 100n; // 1%
  const BPS_DENOMINATOR = 10_000n;

  const cashOutQuoteMinBigInt = (cashOutQuoteBigInt * (BPS_DENOMINATOR - SLIPPAGE_BPS)) / BPS_DENOMINATOR;
  
  // Final quote: REV Fee + JB Protocol Fee + Slippage
  const cashOutQuoteString = truncateNumber(
    formatUnits(cashOutQuoteMinBigInt, baseToken.decimals)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {/* WITHDRAW INPUT */}
        <div className="background-color grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">
              YOU WITHDRAW
            </p>
            <PayInput
              value={withdrawAmount}
              onChangeFunction={(value) => {
                if (value.startsWith("-")) {
                  setWithdrawAmount("0");
                  return;
                }

                setWithdrawAmount(value);
                return;
              }}
              disabled={zeroSurplusValue || currentChainBalanceBigInt === 0n}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <WithdrawSelector suckersBalance={balances} />
            <div className="text-muted-foreground flex w-[130px] items-center justify-end gap-1 text-right text-sm font-light text-nowrap select-none">
              Balance:{" "}
              {isBalancesLoading ? (
                <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
              ) : (
                truncateNumber(currentChainBalOBJ?.format() ?? 0, true)
              )}
            </div>
          </div>
        </div>

        {/* RECEIVE INPUT */}
        <div className="background-color grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light select-none">
              YOU RECEIVE{" "}
              {withdrawAmountBigInt > currentChainBalanceBigInt && "MAX"}
            </p>
            {(isCashOutPreviewLoading || isDebouncing) && Number(withdrawAmount) ? ( // Prevents skeleton when withdrawAmount is falsy (0)
              <div className="activeSkeleton mt-[2px] h-[30px] w-[130px] rounded-lg opacity-30" />
            ) : (
              // show placeholder "0.00" when no withdraw amount is inputted
              <PayInput
                value={withdrawAmount ? cashOutQuoteString : ""}
                disabled
              />
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="bg-grey-450 flex w-fit min-w-fit items-center justify-end gap-1 rounded-full py-1 pr-2 pl-1.5">
              <div className="flex items-end">
                {baseToken.isNative ? (
                  <ChainLogo chainId={1} height={24} width={24} />
                ) : (
                  <Image
                    className="min-h-[24px] min-w-[24px] rounded-full"
                    src={
                      "https://cdn.inevitable.science/static/img/logo/usdc.svg"
                    }
                    alt={`USDC Token Logo`}
                    width={24}
                    height={24}
                    style={{
                      minWidth: 24,
                      minHeight: 24,
                      flexShrink: 0,
                    }}
                  />
                )}

                <div className="border-grey-450 bg-grey-450 -mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] shadow-md">
                  <ChainLogo chainId={selectedChain} height={16} width={16} />
                </div>
              </div>
              <p className="text-lg font-light">{baseToken.symbol}</p>
            </div>

            <div className="text-muted-foreground flex w-[130px] items-center justify-end gap-1 text-right text-sm font-light text-nowrap select-none">
              Slippage: 1%
            </div>
          </div>
        </div>
      </div>

      <div className="background-color hidden grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 rounded-xl p-1 sm:grid [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
        {[10, 25, 50, 100].map((percent) => (
          <Button
            key={percent}
            className="h-[28px] rounded-xs"
            onClick={() => {
              const withdrawAmount =
                (currentChainBalanceBigInt * BigInt(percent)) / 100n;
              const withdrawAmountString = truncateNumber(
                formatUnits(withdrawAmount, projectTokenDecimals)
              );

              setWithdrawAmount(withdrawAmountString);
            }}
            disabled={zeroSurplusValue || currentChainBalanceBigInt === 0n}
          >
            {percent === 100 ? "MAX" : `${percent}%`}
          </Button>
        ))}
      </div>

      <WithdrawActionButton
        minTokensReturned={cashOutQuoteMinBigInt}
        disabled={isDebouncing || isCashOutPreviewLoading}
      />
    </div>
  );
}
