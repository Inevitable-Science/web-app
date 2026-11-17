"use client";
import * as Sentry from "@sentry/nextjs";
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { Button } from "@/components/ui/button";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs/ipfs";
import { DialogClose, DialogTitle } from "@/components/ui/dialog";
import {
  getRevnetLoanContract,
  JB_TOKEN_DECIMALS,
  NATIVE_TOKEN,
  revLoansAbi,
} from "@bananapus/nana-sdk-core";
import { buildRepayLoanTx } from "@bananapus/nana-sdk-core/v6";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "@bananapus/nana-sdk-react";
import Image from "next/image";
import { useState } from "react";
import { LoanTabProps } from "./LoanDialog";
import {
  Address,
  erc20Abi,
  formatUnits,
  parseUnits,
  PublicClient,
} from "viem";
import { formatNumber, formatWalletError, truncateNumber } from "@/lib/utils";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { TOASTS } from "@/lib/toastMessages";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useDebounce } from "use-debounce";
import { CornerDownRight } from "lucide-react";

// Headroom on top of the quoted repayment, excess is refunded by REVLoans (1%).
const REPAY_HEADROOM_BPS = 100n;

type RepayStatus =
  | ""
  | "signing-approval"
  | "rejected-approval"
  | "signing-repay"
  | "rejected-repay"
  | "success";

interface RepayQuote {
  repayBorrowAmount: bigint;
  sourceFee: bigint;
  totalRepay: bigint;
  remainingBorrowAmount: bigint;
  remainingExceedsLoan: boolean;
}

const parseCollateral = (input: string, decimals: number): bigint => {
  try {
    return parseUnits(input, decimals);
  } catch {
    return 0n;
  }
};

const withHeadroom = (amount: bigint) =>
  (amount * (10_000n + REPAY_HEADROOM_BPS)) / 10_000n;

// Mirrors REVLoans.repayLoan: debt left = remaining collateral's capacity
async function quoteRepay(
  client: PublicClient,
  {
    revLoans,
    loanId,
    revnetId,
    collateralCountToReturn,
    decimals,
    currency,
  }: {
    revLoans: Address;
    loanId: bigint;
    revnetId: bigint;
    collateralCountToReturn: bigint;
    decimals: bigint;
    currency: bigint;
  }
): Promise<RepayQuote> {
  const loan = await client.readContract({
    address: revLoans,
    abi: revLoansAbi,
    functionName: "loanOf",
    args: [loanId],
  });

  const remainingCollateral = loan.collateral - collateralCountToReturn;
  const remainingBorrowAmount =
    remainingCollateral > 0n
      ? (
          await client.readContract({
            address: revLoans,
            abi: revLoansAbi,
            functionName: "borrowableAmountFrom",
            args: [revnetId, remainingCollateral, decimals, currency],
          })
        )[1] // [borrowableNow, borrowableCapacity]
      : 0n;

  if (remainingBorrowAmount > loan.amount) {
    return {
      repayBorrowAmount: 0n,
      sourceFee: 0n,
      totalRepay: 0n,
      remainingBorrowAmount,
      remainingExceedsLoan: true,
    };
  }

  const repayBorrowAmount = loan.amount - remainingBorrowAmount;
  const sourceFee = await client.readContract({
    address: revLoans,
    abi: revLoansAbi,
    functionName: "determineSourceFeeAmount",
    args: [loan, repayBorrowAmount],
  });

  return {
    repayBorrowAmount,
    sourceFee,
    totalRepay: repayBorrowAmount + sourceFee,
    remainingBorrowAmount,
    remainingExceedsLoan: false,
  };
}

export function RepayTab({ loan, isSigning, setIsSigning }: LoanTabProps) {
  const [collateralToReturn, setCollateralToReturn] = useState("");
  const [debounceCollateralToReturn] = useDebounce(collateralToReturn, 600);
  const [repayStatus, setRepayStatus] = useState<RepayStatus>("");

  // JB Hooks
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const { version } = useJBContractContext();
  const baseToken = useProjectBaseToken();

  // Client Hooks
  const loanChainId = loan.chainId;
  const publicClient = usePublicClient({ chainId: loanChainId });
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  // Loan Derived Values
  const revLoansContractAddress = getRevnetLoanContract(version, loanChainId);
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;
  const isNativeLoan = loan.token.toLowerCase() === NATIVE_TOKEN.toLowerCase();
  // v6 currency ids differ per chain, so use the loan chain's token info.
  const chainTokenDecimals =
    baseToken.tokenMap[loanChainId]?.decimals ?? baseToken.decimals;
  const chainTokenCurrency =
    baseToken.tokenMap[loanChainId]?.currency ?? baseToken.currency;

  const inputCollateral = parseCollateral(
    collateralToReturn,
    projectTokenDecimals
  );
  const insufficientCollateral = inputCollateral > loan.collateral;
  const collateralToReturnPercent = loan.collateral
    ? (inputCollateral * 100n) / loan.collateral
    : 0n;

  const debouncedCollateral = parseCollateral(
    debounceCollateralToReturn,
    projectTokenDecimals
  );
  const collateralCountToReturn =
    debouncedCollateral > loan.collateral ? loan.collateral : debouncedCollateral;
  const isDebouncing = debounceCollateralToReturn !== collateralToReturn;

  const quoteArgs = {
    revLoans: revLoansContractAddress,
    loanId: BigInt(loan.id),
    revnetId: BigInt(loan.projectId),
    collateralCountToReturn,
    decimals: BigInt(chainTokenDecimals),
    currency: BigInt(chainTokenCurrency),
  };

  const { data: repayQuote, isFetching: isQuoting } = useQuery({
    queryKey: [
      "repayQuote",
      loanChainId,
      String(loan.id),
      collateralCountToReturn.toString(),
    ],
    queryFn: () => quoteRepay(publicClient!, quoteArgs),
    enabled: !!publicClient && collateralCountToReturn > 0n,
  });

  const isQuoteLoading = (isDebouncing || isQuoting) && inputCollateral > 0n;
  const remainingExceedsLoan = !!repayQuote?.remainingExceedsLoan;

  const handleRepay = async () => {
    if (!address || !publicClient || collateralCountToReturn === 0n) {
      toast(TOASTS.repay.error.clientError);
      return;
    }

    try {
      setIsSigning(true);

      // Re-quote onchain right before signing, the source fee grows over time.
      const quote = await quoteRepay(publicClient, quoteArgs);
      if (quote.remainingExceedsLoan) {
        toast(TOASTS.repay.error.remainingExceedsLoan);
        return;
      }

      const maxRepayBorrowAmount = withHeadroom(quote.totalRepay);

      if (!isNativeLoan) {
        const allowance = await publicClient.readContract({
          address: loan.token,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address, revLoansContractAddress],
        });

        if (allowance < maxRepayBorrowAmount) {
          setRepayStatus("signing-approval");
          try {
            const approveHash = await writeContractAsync({
              address: loan.token,
              abi: erc20Abi,
              functionName: "approve",
              chainId: loanChainId,
              args: [revLoansContractAddress, maxRepayBorrowAmount],
            });
            const approveReceipt = await publicClient.waitForTransactionReceipt(
              { hash: approveHash }
            );

            if (approveReceipt.status === "reverted") {
              setRepayStatus("rejected-approval");
              toast(TOASTS.repay.error.approvalReverted);
              return;
            }
          } catch {
            setRepayStatus("rejected-approval");
            toast(TOASTS.repay.error.approvalCancelled);
            return;
          }
        }
      }

      setRepayStatus("signing-repay");
      try {
        const txHash = await writeContractAsync({
          ...buildRepayLoanTx({
            chainId: loanChainId,
            loanId: quoteArgs.loanId,
            maxRepayBorrowAmount,
            collateralCountToReturn,
            beneficiary: address,
            value: isNativeLoan ? maxRepayBorrowAmount : 0n,
          }),
          address: revLoansContractAddress,
        });
        const txReceipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (txReceipt.status === "reverted") {
          setRepayStatus("rejected-repay");
          toast(TOASTS.repay.error.repayReverted);
          return;
        }

        setRepayStatus("success");
        toast(TOASTS.repay.success.loanRepaid);
      } catch {
        setRepayStatus("rejected-repay");
        toast(TOASTS.repay.error.repayCancelled);
      }
    } catch (err) {
      Sentry.captureException(err);
      setRepayStatus("rejected-repay");
      toast(TOASTS.repay.error.repayFailed(formatWalletError(err)));
    } finally {
      setIsSigning(false);
    }
  };

  const formatBaseAmount = (amount: bigint | undefined) =>
    `${formatNumber(formatUnits(amount ?? 0n, chainTokenDecimals), false)} ${baseToken.symbol}`;

  const actionLabel = insufficientCollateral
    ? "Insufficient Collateral"
    : remainingExceedsLoan
      ? "Unlock More Collateral"
      : repayStatus === "signing-approval"
        ? "Approving..."
        : repayStatus === "signing-repay"
          ? "Repaying..."
          : "Pay";

  return (
    <div className="flex flex-col gap-2">
      <DialogTitle>Repay Loan</DialogTitle>
      <p className="text-muted-foreground mb-1 text-sm">
        Amount of collateral you want to unlock
      </p>

      <div className="bg-grey-450 grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
        <div className="flex flex-col gap-[2px]">
          <p className="text-muted-foreground text-sm font-light select-none">
            YOU RECEIVE
          </p>
          <PayInput
            value={collateralToReturn}
            onChangeFunction={(value) => {
              if (value.startsWith("-")) {
                setCollateralToReturn("0");
                return;
              }

              setCollateralToReturn(value);
              return;
            }}
          />
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="background-color flex w-fit min-w-fit items-center gap-1 rounded-full py-1 pr-2 pl-1.5">
            <div className="flex items-end">
              <Image
                src={
                  metadata.data?.logoUri
                    ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                    : "https://cdn.inevitable.science/static/img/logo/mainnet.svg"
                }
                className="rounded-full"
                alt={`Token Logo`}
                width={24}
                height={24}
                style={{
                  minWidth: 24,
                  minHeight: 24,
                  flexShrink: 0,
                }}
              />

              <div className="border-grey-450 bg-grey-450 -mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] shadow-md">
                <ChainLogo chainId={loan.chainId} height={16} width={16} />
              </div>
            </div>
            <p className="text-lg font-light">
              {token.data?.symbol ?? "TOKENS"}
            </p>
          </div>
          <p className="text-muted-foreground text-right text-sm font-light text-nowrap select-none">
            Collateral:{" "}
            {truncateNumber(
              formatUnits(loan.collateral, projectTokenDecimals)
            )}
          </p>
        </div>
      </div>

      <div className="bg-grey-450 hidden grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 rounded-xl p-1 sm:grid [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
        {[10, 25, 50, 100].map((percent) => (
          <Button
            className="h-[28px] rounded-xs"
            variant={"secondary"}
            key={percent}
            disabled={isSigning}
            onClick={() => {
              const amount = (loan.collateral / 100n) * BigInt(percent);
              const formattedAmount = formatUnits(
                percent === 100 ? loan.collateral : amount,
                projectTokenDecimals
              );
              const formattedAmountString =
                percent === 100
                  ? formattedAmount
                  : formatNumber(formattedAmount, false);

              setCollateralToReturn(formattedAmountString);
            }}
          >
            {percent === 100 ? "MAX" : `${percent}%`}
          </Button>
        ))}
      </div>

      <div className="bg-grey-450 max-h-48 flex flex-col sm:flex-row sm:justify-between overflow-y-auto rounded-xl p-4 text-sm">
        <div>
          <p className="text-muted-foreground">
            Borrow Amount:
          </p>
          <p className="text-lg">
            {formatBaseAmount(loan.borrowAmount)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground sm:text-right">
            Collateral To Unlock (
            {Number(collateralToReturnPercent) > 100
              ? ">100"
              : Number(collateralToReturnPercent)}
            %):
          </p>
          <p className="text-lg sm:text-right">
            {formatNumber(collateralToReturn, false) || 0} {token.data?.symbol}
          </p>
        </div>
      </div>

      <div className="bg-grey-450 [&>*:nth-child(odd)]:text-muted-foreground grid grid-cols-[60%_40%] rounded-lg p-3 text-sm [&>*:nth-child(even)]:text-right">
        <div>
          <p className="leading-none mb-1">
            Amount To Pay Now:
          </p>
          <div className="text-white text-lg leading-none">
            {isQuoteLoading ? (
              <div className="activeSkeleton h-[22px] w-[64px] rounded-sm" />
            ) : (
              <p className="mb-[4px]">
                {formatBaseAmount(repayQuote?.totalRepay)}
              </p>
            )}
          </div>
        </div>
        <div />

        <p>Maximum Repay Amount:</p>
        <div className="flex justify-end">
          {isQuoteLoading ? (
            <div className="activeSkeleton h-[16px] w-[48px] rounded-sm" />
          ) : (
            formatBaseAmount(withHeadroom(repayQuote?.totalRepay ?? 0n))
          )}
        </div>

        <p className="flex items-center gap-0.5">
          <CornerDownRight className="pb-[2px]" size={16} />
          Of That Fees:
        </p>
        <div className="flex justify-end">
          {isQuoteLoading ? (
            <div className="activeSkeleton h-[16px] w-[48px] rounded-sm" />
          ) : (
            formatBaseAmount(repayQuote?.sourceFee)
          )}
        </div>

        <div className="my-1 w-full border-color border-t" />
        <div className="my-1 w-full border-color border-t" />

        <p>Amount Carried Into New Loan:</p>
        <div className="flex justify-end">
          {isQuoteLoading ? (
            <div className="activeSkeleton h-[16px] w-[48px] rounded-sm" />
          ) : (
            formatBaseAmount(
              remainingExceedsLoan ? 0n : repayQuote?.remainingBorrowAmount
            )
          )}
        </div>
      </div>

      {remainingExceedsLoan && (
        <p className="text-muted-foreground text-xs">
          The remaining collateral is worth more than this loan. Unlock more
          collateral, or use Refinance to borrow against the extra value.
        </p>
      )}

      <div className="mt-6 flex justify-end space-x-2">
        <DialogClose className="bg-grey-450!" disabled={isSigning} />
        <ButtonWithWallet
          targetChainId={loanChainId}
          onClick={handleRepay}
          disabled={
            !collateralCountToReturn ||
            insufficientCollateral ||
            remainingExceedsLoan ||
            isQuoteLoading
          }
          loading={isSigning}
          className="bg-cerulean!"
        >
          {actionLabel}
        </ButtonWithWallet>
      </div>
    </div>
  );
}
