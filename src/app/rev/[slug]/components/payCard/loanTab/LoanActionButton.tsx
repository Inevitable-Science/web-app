"use client";
import * as Sentry from "@sentry/nextjs";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { formatNumber, formatWalletError, truncateNumber } from "@/lib/utils";
import {
  JB_CHAINS,
  JB_TOKEN_DECIMALS,
  JBChainId,
  jbPermissionsAbi,
  revLoansAbi,
} from "@bananapus/nana-sdk-core";
import {
  getBorrowableAmount,
  loanOpeningAmounts,
  MAX_PREPAID_FEE_PERCENT,
  MIN_PREPAID_FEE_PERCENT,
  REVLOANS_BURN_PERMISSION_ID,
} from "@bananapus/nana-sdk-core/v6";
import { useJBContractContext, useJBTokenContext } from "@bananapus/nana-sdk-react";
import { useEffect, useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogClose,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoanFeeChart } from "./LoanFeeChart";
import { generateFeeData } from "@/lib/feeHelpers";
import { LoanStepper } from "./LoanStepper";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { useLoanFeeData } from "@/hooks/useLoanFeeData";
import { ConnectKitButton } from "connectkit";
import { primaryPayButtonClass } from "../payTab/PayActionButton";
import { useTransactionCardStore } from "../TransactionCardStore";
import { ExternalLink } from "lucide-react";
import EtherscanLink from "@/components/EtherscanLink";

// Max drop from the quoted gross debt we accept before borrowFrom reverts (1%).
const LOAN_SLIPPAGE_BPS = 100n;


export function LoanActionButton({
  loanAmount,
  projectTokenBalance,
  isLoanAmountLoading,
}: {
  loanAmount: bigint | undefined;
  projectTokenBalance: bigint;
  isLoanAmountLoading: boolean;
}) {
  const {
    peerChainId: activeChainId,
    projectId: activeProjectId
  } = useRevnetDataStore((state) => state.selectedSucker);

  const collateralAmount = useTransactionCardStore((s) => s.collateralAmount);
  const prepaidPercent = useTransactionCardStore((s) => s.prepaidPercent);
  const setPrepaidPercent = useTransactionCardStore((s) => s.setPrepaidPercent);
  const borrowStatus = useTransactionCardStore((s) => s.borrowStatus);
  const setBorrowStatus = useTransactionCardStore((s) => s.setBorrowStatus);
  const isBorrowing = useTransactionCardStore((s) => s.isBorrowing);
  const setIsBorrowing = useTransactionCardStore((s) => s.setIsBorrowing);
  const userHasBorrowPerm = useTransactionCardStore((s) => s.userHasBorrowPerm);
  const setUserHasBorrowPerm = useTransactionCardStore(
    (s) => s.setUserHasBorrowPerm
  );

  const [loanTxHash, setLoanTxHash] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogStage, setDialogStage] = useState<
    "acknowledgement" | "feeStructure" | "transactions"
  >("acknowledgement");

  // JB Hooks
  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { token } = useJBTokenContext();
  const baseToken = useProjectBaseToken();

  // Client Hooks
  const publicClient = usePublicClient({ chainId: activeChainId });
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  // Sucker Derived Values
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;
  const baseTokenAddress = baseToken.tokenMap[activeChainId].token;
  // v6 currency ids differ per chain, so use the selected chain's token info.
  const chainTokenDecimals =
    baseToken.tokenMap[activeChainId]?.decimals ?? baseToken.decimals;
  const chainTokenCurrency =
    baseToken.tokenMap[activeChainId]?.currency ?? baseToken.currency;

  const { revLoansContractAddress, resolvedPermissionsAddress } =
    useLoanFeeData(activeChainId);

  const userHasPermission = useHasBorrowPermission({
    address: address as `0x${string}`,
    projectId: activeProjectId,
    chainId: activeChainId,
    resolvedPermissionsAddress: resolvedPermissionsAddress as `0x${string}`,
    skip: false,
  });

  useEffect(() => {
    if (userHasPermission === userHasBorrowPerm) return;

    if (userHasPermission !== undefined) {
      setUserHasBorrowPerm(userHasPermission);
    }
  }, [userHasPermission]);

  // Prepaid source fee, out of 1,000 (25 = 2.5% ... 500 = 50%)
  const feeBasisPoints = Math.round(prepaidPercent * 10);
  const prepaidFeePercent = BigInt(feeBasisPoints);
  const prepaidFeeInRange =
    prepaidFeePercent >= MIN_PREPAID_FEE_PERCENT &&
    prepaidFeePercent <= MAX_PREPAID_FEE_PERCENT;

  // v6 opening fees, using the contracts' floor-rounded math: 2.5% protocol
  // fee + 1% $REV fee + the prepaid source fee, all taken from the gross debt.
  const openingAmounts = loanOpeningAmounts({
    grossBorrowAmount: loanAmount ?? 0n,
    prepaidSourceFeePercent: prepaidFeeInRange
      ? prepaidFeePercent
      : MIN_PREPAID_FEE_PERCENT,
  });
  const fixedFeeRatio = loanAmount
    ? Number(openingAmounts.protocolFee + openingAmounts.revFee) /
      Number(loanAmount)
    : undefined;

  const loanAmountNum = loanAmount
    ? Number(formatUnits(loanAmount, chainTokenDecimals))
    : 0;
  const amountToWallet = Number(
    formatUnits(openingAmounts.netBorrowAmount, chainTokenDecimals)
  );

  const feeData = generateFeeData({
    grossBorrowedEth: loanAmountNum,
    prepaidPercent,
    fixedLoanFee: fixedFeeRatio,
  });

  const amountToWalletFormatted =
    amountToWallet < 1
      ? truncateNumber(amountToWallet)
      : formatNumber(amountToWallet, false);

  const collateralBigInt = parseUnits(collateralAmount, projectTokenDecimals);
  const lessThanMinCollateral =
    collateralBigInt < parseUnits("0.001", projectTokenDecimals);

  // Chart Vars
  const monthsToPrepay = (prepaidPercent / 50) * 120;
  const prepaidMonths = monthsToPrepay;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  // 1% slippage
  const minBorrowAmount =
    ((loanAmount ?? 0n) * (10_000n - LOAN_SLIPPAGE_BPS)) / 10_000n;

  // Slippage does not account for fees. Account for them...
  const minReceivedString = formatUnits(
    loanOpeningAmounts({
      grossBorrowAmount: minBorrowAmount,
      prepaidSourceFeePercent: prepaidFeeInRange
        ? prepaidFeePercent
        : MIN_PREPAID_FEE_PERCENT,
    }).netBorrowAmount,
    chainTokenDecimals
  );

  const handleBorrow = async () => {
    try {
      if (
        !publicClient ||
        !primaryNativeTerminal?.data ||
        !address ||
        !resolvedPermissionsAddress ||
        !loanAmount ||
        !prepaidFeeInRange
      ) {
        toast({
          variant: "destructive",
          title: "Client Error",
          description:
            "Couldn't start the borrow process, please refresh and try again.",
        });
        return;
      }

      setIsBorrowing(true);

      if (!userHasBorrowPerm) {
        setBorrowStatus("signing-permission");
        try {
          const txHash = await writeContractAsync({
            address: resolvedPermissionsAddress,
            abi: jbPermissionsAbi,
            functionName: "setPermissionsFor",
            chainId: activeChainId,
            args: [
              address,
              {
                operator: revLoansContractAddress,
                projectId: activeProjectId,
                // BURN_TOKENS only. Never ROOT (1): it gives REVLoans full
                // operator power over the holder.
                permissionIds: [REVLOANS_BURN_PERMISSION_ID],
              },
            ],
          });
          const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

          if (txReceipt.status === "reverted") {
            setBorrowStatus("rejected-permission");
            toast({
              variant: "destructive",
              title: "Transaction Reverted",
              description: "Loan creation reverted on chain",
            });
            return;
          }

          setBorrowStatus("");
          setUserHasBorrowPerm(true);
        } catch (err) {
          setBorrowStatus("rejected-permission");
          return;
        }
      }

      // Re-read the borrowable amount onchain right before signing.
      const { borrowableNow } = await getBorrowableAmount(publicClient, {
        chainId: activeChainId,
        revnetId: activeProjectId,
        collateralCount: collateralBigInt,
        decimals: BigInt(chainTokenDecimals),
        currency: BigInt(chainTokenCurrency),
      });

      if (borrowableNow < minBorrowAmount) {
        setBorrowStatus("rejected-borrow");
        toast({
          variant: "destructive",
          title: "Quote Changed",
          description:
            "The amount you can borrow dropped since your quote. Please review the new amount and try again.",
        });
        return;
      }

      try {
        setBorrowStatus("signing-borrow");
        const txHash = await writeContractAsync({
          abi: revLoansAbi,
          functionName: "borrowFrom",
          address: revLoansContractAddress,
          chainId: Number(activeChainId) as JBChainId,
          args: [
            activeProjectId,
            /*{ v6 INTEGRATION remove
              token: baseTokenAddress,
              terminal: primaryNativeTerminal.data,
            },*/
            baseTokenAddress,
            minBorrowAmount,
            collateralBigInt,
            address,
            prepaidFeePercent,
            address
          ],
        });

        const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

        if (txReceipt.status === 'reverted') {
          setBorrowStatus("rejected-borrow");
          toast({
            variant: "destructive",
            title: "Transaction Reverted",
            description: "Loan creation reverted on chain",
          });
        }

        setLoanTxHash(txHash);
        setBorrowStatus("success");
        toast({
          title: "Loan Created",
          description: "Loan was successfully created",
        });
        return;
        
      } catch (err) {
        setBorrowStatus("rejected-borrow");
        toast({
          variant: "destructive",
          title: "Transaction Cancelled",
          description: "Loan creation was cancelled by user",
        });
        return;
      }
    } catch (err) {
      Sentry.captureException(err);
      setBorrowStatus("rejected-borrow");
      toast({
        variant: "destructive",
        title: "Borrow Failed",
        description: formatWalletError(err),
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isBorrowing) return; // don't close mid-signature

    // Reset on open, not on close - resetting on close flashes the other stage.
    if (open) {
      if (borrowStatus === "success") {
        setBorrowStatus("");
        setLoanTxHash(null);
      }

      if (dialogStage !== "acknowledgement") {
        setDialogStage("feeStructure");
      }
    }

    setIsModalOpen(open);
  };

  if (!isConnected) {
    return (
      <ConnectKitButton.Custom>
        {({ isConnecting, show }) => (
          <Button
            onClick={show}
            loading={isConnecting}
            className={primaryPayButtonClass}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </ConnectKitButton.Custom>
    );
  }

  if (projectTokenBalance < collateralBigInt) {
    return (
      <Button className={primaryPayButtonClass} disabled>
        Insufficient Funds
      </Button>
    );
  }

  if ((Number(collateralAmount) && lessThanMinCollateral)) {
    return (
      <Button className={primaryPayButtonClass} disabled>
        Loan Amount Is Too Small
      </Button>
    );
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className={`shimmer ${primaryPayButtonClass}`}
          disabled={!collateralAmount || !loanAmount || isLoanAmountLoading}
        >
          Open Loan
        </Button>
      </DialogTrigger>

      <DialogContent>
        {dialogStage === "acknowledgement" && (
          <>
            <DialogTitle>Before you continue...</DialogTitle>
            <DialogDescription>
              Please note the following before proceeding.
            </DialogDescription>

            <div className="background-color my-4 max-h-48 overflow-y-auto rounded-xl p-4 text-xs">
              <ul className="flex list-disc flex-col gap-0.5 pl-2">
                <li>
                  Your {formatNumber(collateralAmount, false)}{" "}
                  {token.data?.symbol} will be burned as collateral
                </li>
                <li>You will receive an NFT to reclaim tokens when repaying</li>
                <li>
                  After 10 years, loan is liquidated and collateral is lost
                </li>
              </ul>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <DialogClose className="bg-transparent! hover:underline">
                Cancel
              </DialogClose>
              <Button
                variant={"secondary"}
                onClick={() => setDialogStage("feeStructure")}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {dialogStage === "feeStructure" && (
          <>
            <DialogTitle>Confirm Fee Structure</DialogTitle>
            <DialogDescription>
              Please confirm the fee structure of the loan.
            </DialogDescription>

            <div className="background-color max-h-48 flex flex-col sm:flex-row sm:justify-between overflow-y-auto rounded-xl my-4 p-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  Collateral:
                </p>
                <p className="text-lg">
                  {formatNumber(collateralAmount, false)}{" "}
                  {token.data?.symbol}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground sm:text-right">
                  Receive:
                </p>
                <p className="text-lg sm:text-right">
                  ~{amountToWalletFormatted} {baseToken.symbol}
                </p>
              </div>
            </div>

            <div className="background-color my-4 overflow-y-auto rounded-xl px-4 py-2 text-xs">
              <LoanFeeChart
                prepaidPercent={prepaidPercent}
                setPrepaidPercent={setPrepaidPercent}
                feeData={feeData}
                grossBorrowedNative={loanAmountNum}
                fixedFeeRatio={fixedFeeRatio}
                collateralAmount={collateralAmount}
                tokenSymbol={baseToken.symbol}
                collateralTokenSymbol={token.data?.symbol}
                displayYears={displayYears}
                displayMonths={displayMonths}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <DialogClose className="bg-transparent! hover:underline">
                Cancel
              </DialogClose>
              <Button
                variant={"secondary"}
                onClick={() => setDialogStage("transactions")}
              >
                Confirm
              </Button>
            </div>
          </>
        )}

        {dialogStage === "transactions" && (
          <>
            <DialogTitle>
              {borrowStatus === "success"
                ? "Loan Created"
                : "Sign Transactions"
              }
            </DialogTitle>
            <DialogDescription>
              {borrowStatus === "success"
                ? "Loan will apear in the about tab shortly."
                : "Sign the following transactions to open a new loan."
              }
            </DialogDescription>


            <div className="my-4">
              <div className="background-color max-h-48 flex flex-col sm:flex-row sm:justify-between overflow-y-auto rounded-xl p-4 text-sm">
                <div>
                  <p className="text-muted-foreground">
                    Collateral:
                  </p>
                  <p className="text-lg">
                    {formatNumber(collateralAmount, false)}{" "}
                    {token.data?.symbol}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground sm:text-right">
                    Receive:
                  </p>
                  <p className="text-lg sm:text-right">
                    ~{amountToWalletFormatted} {baseToken.symbol}
                  </p>
                </div>
              </div>
              <div className="flex flex-row justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Minimum Received
                  <br/>
                  <span className="text-white">
                    {truncateNumber(minReceivedString, false)} {baseToken.symbol}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground text-right sm:block hidden">
                  Prepaid Percent
                  <br/>
                  <span className="text-white">
                    {prepaidPercent}%
                  </span>
                </p>
              </div>
            </div>

            <LoanStepper />

            {loanTxHash && borrowStatus === "success" && (
              <div className="mt-1 flex flex-row items-center justify-between">
                <p className="text-xs text-muted-foreground">Transaction</p>
                <EtherscanLink
                  className="text-xs text-muted-foreground flex items-center gap-1"
                  value={loanTxHash}
                  chain={JB_CHAINS[activeChainId].chain}
                  type="tx"
                >
                  {loanTxHash.slice(0, 6)}…{loanTxHash.slice(-4)}
                  <ExternalLink className="h-3 w-3" />
                </EtherscanLink>
              </div>
            )}

            {borrowStatus === "success" ? (
              <DialogClose className="!bg-cerulean w-full rounded-xl py-2.5 mt-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                Done
              </DialogClose>
            ) : (
              <div className="mt-6 flex justify-end space-x-2">
                <DialogClose disabled={isBorrowing}>
                  Cancel
                </DialogClose>
                <ButtonWithWallet
                  targetChainId={activeChainId}
                  onClick={handleBorrow}
                  className={"bg-cerulean hover:bg-cerulean"}
                  loading={isBorrowing}
                  disabled={!collateralAmount}
                >
                  {userHasBorrowPerm ? "Open Loan" : "Grant Permissions"}
                  {isBorrowing && "..."}
                </ButtonWithWallet>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
