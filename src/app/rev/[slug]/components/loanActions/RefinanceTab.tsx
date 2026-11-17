import * as Sentry from "@sentry/nextjs";
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { Button } from "@/components/ui/button";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs/ipfs";
import { DialogClose, DialogTitle } from "@/components/ui/dialog";
import {
  JB_TOKEN_DECIMALS,
  jbPermissionsAbi,
  revLoansAbi,
} from "@bananapus/nana-sdk-core";
import {
  buildReallocateCollateralTx,
  loanOpeningAmounts,
  MAX_PREPAID_FEE_PERCENT,
  MIN_PREPAID_FEE_PERCENT,
  REVLOANS_BURN_PERMISSION_ID,
  slippageFloor,
} from "@bananapus/nana-sdk-core/v6";
import {
  useJBProjectMetadataContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "@bananapus/nana-sdk-react";
import Image from "next/image";
import { useState } from "react";
import { LoanTabProps } from "./LoanDialog";
import { Address, formatUnits, parseUnits, PublicClient } from "viem";
import { formatNumber, formatWalletError, truncateNumber } from "@/lib/utils";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { generateFeeData } from "@/lib/feeHelpers";
import { useToast } from "@/components/ui/use-toast";
import { LoanFeeChart } from "../payCard/loanTab/LoanFeeChart";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useLoanFeeData } from "@/hooks/useLoanFeeData";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { useDebounce } from "use-debounce";

// Only support loan actions with v6

// Max drop from the quoted new loan we accept before reallocating reverts (1%).
const REFINANCE_SLIPPAGE_BPS = 100n;

// Collateral kept above the exact break-even, covers curve-fit rounding (0.1%).
const KEEP_BUFFER = 1.001;

type RefinanceStatus =
  | ""
  | "signing-permission"
  | "rejected-permission"
  | "signing-refinance"
  | "rejected-refinance"
  | "success";

interface RefinanceQuote {
  collateralCountToTransfer: bigint;
  newCollateralCount: bigint;
  newBorrowAmount: bigint;
}

interface LoanQuoteArgs {
  revLoans: Address;
  loanId: bigint;
  revnetId: bigint;
  decimals: bigint;
  currency: bigint;
}

const parseCollateral = (input: string, decimals: number): bigint => {
  try {
    return parseUnits(input, decimals);
  } catch {
    return 0n;
  }
};

// Largest collateral that can leave the loan while the rest still covers its debt.
async function maxTransferableCollateral(
  client: PublicClient,
  { revLoans, revnetId, decimals, currency }: LoanQuoteArgs,
  loan: { amount: bigint; collateral: bigint }
): Promise<bigint> {
  const capacityOf = async (collateralCount: bigint) =>
    (
      await client.readContract({
        address: revLoans,
        abi: revLoansAbi,
        functionName: "borrowableAmountFrom",
        args: [revnetId, collateralCount, decimals, currency],
      })
    )[1]; // reallocation checks against capacity, not live surplus

  const halfCollateral = loan.collateral / 2n;
  if (halfCollateral === 0n) return 0n;

  const [fullCapacity, halfCapacity] = await Promise.all([
    capacityOf(loan.collateral),
    capacityOf(halfCollateral),
  ]);
  if (fullCapacity <= loan.amount) return 0n;

  // Cash out curve is p·x + q·x², fit it from both samples and solve for the debt.
  const [x1, y1] = [Number(loan.collateral), Number(fullCapacity)];
  const [x2, y2] = [Number(halfCollateral), Number(halfCapacity)];
  const q = (y1 / x1 - y2 / x2) / (x1 - x2);
  const p = y1 / x1 - q * x1;
  const debt = Number(loan.amount);
  const breakEven =
    q > 0 ? (-p + Math.sqrt(p * p + 4 * q * debt)) / (2 * q) : debt / p;

  const keep = BigInt(Math.ceil(breakEven * KEEP_BUFFER));
  if (keep >= loan.collateral) return 0n;

  return (await capacityOf(keep)) >= loan.amount ? loan.collateral - keep : 0n;
}

async function quoteRefinance(
  client: PublicClient,
  args: LoanQuoteArgs & { collateralCountToAdd: bigint }
): Promise<RefinanceQuote> {
  const loan = await client.readContract({
    address: args.revLoans,
    abi: revLoansAbi,
    functionName: "loanOf",
    args: [args.loanId],
  });

  const collateralCountToTransfer = await maxTransferableCollateral(
    client,
    args,
    loan
  );
  const newCollateralCount =
    collateralCountToTransfer + args.collateralCountToAdd;

  const newBorrowAmount =
    newCollateralCount > 0n
      ? (
          await client.readContract({
            address: args.revLoans,
            abi: revLoansAbi,
            functionName: "borrowableAmountFrom",
            args: [
              args.revnetId,
              newCollateralCount,
              args.decimals,
              args.currency,
            ],
          })
        )[0] // new loans draw from the live surplus
      : 0n;

  return { collateralCountToTransfer, newCollateralCount, newBorrowAmount };
}

export function RefinanceTab({ loan, isSigning, setIsSigning }: LoanTabProps) {
  const [additionalCollateral, setAdditionalCollateral] = useState("");
  const [debounceAdditionalCollateral] = useDebounce(additionalCollateral, 600);
  const [prepaidPercent, setPrepaidPercent] = useState(2.5);
  const [refinanceStatus, setRefinanceStatus] = useState<RefinanceStatus>("");
  const [dialogStage, setDialogStage] = useState<
    "setCollateral" | "feeStructure"
  >("setCollateral");

  // JB Hooks
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const baseToken = useProjectBaseToken();
  const balances = useSuckersUserTokenBalance();

  // Client Hooks
  const loanChainId = loan.chainId;
  const publicClient = usePublicClient({ chainId: loanChainId });
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const { revLoansContractAddress, resolvedPermissionsAddress } =
    useLoanFeeData(loanChainId);

  // Reallocating burns the transferred + added collateral, REVLoans needs BURN_TOKENS.
  const userHasBurnPermission = useHasBorrowPermission({
    address,
    projectId: BigInt(loan.projectId),
    chainId: loanChainId,
    resolvedPermissionsAddress,
  });

  // Loan Derived Values
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;
  // v6 currency ids differ per chain, so use the loan chain's token info.
  const chainTokenDecimals =
    baseToken.tokenMap[loanChainId]?.decimals ?? baseToken.decimals;
  const chainTokenCurrency =
    baseToken.tokenMap[loanChainId]?.currency ?? baseToken.currency;

  const chainBalanceObj = balances.data?.find((t) => t.chainId === loanChainId);
  const chainBalanceBigInt = chainBalanceObj?.balance.value ?? 0n;
  const chainBalance = chainBalanceObj?.balance.format();

  const additionalCollateralBigInt = parseCollateral(
    additionalCollateral,
    projectTokenDecimals
  );
  const insufficientBalance = additionalCollateralBigInt > chainBalanceBigInt;
  const isDebouncing = debounceAdditionalCollateral !== additionalCollateral;

  const quoteArgs = {
    revLoans: revLoansContractAddress,
    loanId: BigInt(loan.id),
    revnetId: BigInt(loan.projectId),
    decimals: BigInt(chainTokenDecimals),
    currency: BigInt(chainTokenCurrency),
    collateralCountToAdd: parseCollateral(
      debounceAdditionalCollateral,
      projectTokenDecimals
    ),
  };

  const { data: refinanceQuote, isFetching: isQuoting } = useQuery({
    queryKey: [
      "refinanceQuote",
      loanChainId,
      String(loan.id),
      quoteArgs.collateralCountToAdd.toString(),
    ],
    queryFn: () => quoteRefinance(publicClient!, quoteArgs),
    enabled: !!publicClient,
  });

  const isQuoteLoading = isDebouncing || isQuoting;
  const newBorrowAmount = refinanceQuote?.newBorrowAmount ?? 0n;
  const minBorrowAmount = slippageFloor(newBorrowAmount, REFINANCE_SLIPPAGE_BPS);

  // Prepaid source fee, out of 1,000 (25 = 2.5% ... 500 = 50%)
  const prepaidFeePercent = BigInt(Math.round(prepaidPercent * 10));
  const prepaidFeeInRange =
    prepaidFeePercent >= MIN_PREPAID_FEE_PERCENT &&
    prepaidFeePercent <= MAX_PREPAID_FEE_PERCENT;

  const openingAmounts = loanOpeningAmounts({
    grossBorrowAmount: newBorrowAmount,
    prepaidSourceFeePercent: prepaidFeeInRange
      ? prepaidFeePercent
      : MIN_PREPAID_FEE_PERCENT,
  });
  const fixedFeeRatio = newBorrowAmount
    ? Number(openingAmounts.protocolFee + openingAmounts.revFee) /
      Number(newBorrowAmount)
    : undefined;

  const newBorrowAmountNum = Number(
    formatUnits(newBorrowAmount, chainTokenDecimals)
  );
  const amountToWallet = Number(
    formatUnits(openingAmounts.netBorrowAmount, chainTokenDecimals)
  );

  const newLoanFeeData = generateFeeData({
    grossBorrowedEth: newBorrowAmountNum,
    prepaidPercent,
    fixedLoanFee: fixedFeeRatio,
  });

  // Chart Vars
  const prepaidMonths = (prepaidPercent / 50) * 120;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  const handleRefinance = async () => {
    if (
      !address ||
      !publicClient ||
      !resolvedPermissionsAddress ||
      !newBorrowAmount ||
      !prepaidFeeInRange
    ) {
      toast({
        variant: "destructive",
        title: "Client Error",
        description:
          "Couldn't start the refinance, please refresh and try again.",
      });
      return;
    }

    try {
      setIsSigning(true);

      if (!userHasBurnPermission) {
        setRefinanceStatus("signing-permission");
        try {
          const txHash = await writeContractAsync({
            address: resolvedPermissionsAddress,
            abi: jbPermissionsAbi,
            functionName: "setPermissionsFor",
            chainId: loanChainId,
            args: [
              address,
              {
                operator: revLoansContractAddress,
                projectId: BigInt(loan.projectId),
                permissionIds: [REVLOANS_BURN_PERMISSION_ID], // never ROOT
              },
            ],
          });
          const txReceipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
          });

          if (txReceipt.status === "reverted") {
            setRefinanceStatus("rejected-permission");
            toast({
              variant: "destructive",
              title: "Transaction Reverted",
              description: "Permission grant reverted on chain",
            });
            return;
          }
        } catch {
          setRefinanceStatus("rejected-permission");
          toast({
            variant: "destructive",
            title: "Transaction Cancelled",
            description: "Permission grant was cancelled",
          });
          return;
        }
      }

      // Re-quote onchain right before signing.
      const quote = await quoteRefinance(publicClient, quoteArgs);
      if (quote.newBorrowAmount < minBorrowAmount) {
        setRefinanceStatus("rejected-refinance");
        toast({
          variant: "destructive",
          title: "Quote Changed",
          description:
            "The amount you can borrow dropped since your quote. Please review the new amount and try again.",
        });
        return;
      }

      setRefinanceStatus("signing-refinance");
      try {
        const txHash = await writeContractAsync({
          ...buildReallocateCollateralTx({
            chainId: loanChainId,
            loanId: quoteArgs.loanId,
            collateralCountToTransfer: quote.collateralCountToTransfer,
            token: loan.token, // must match the loan's source token
            minBorrowAmount,
            collateralCountToAdd: quoteArgs.collateralCountToAdd,
            beneficiary: address,
            prepaidFeePercent,
          }),
          address: revLoansContractAddress,
        });
        const txReceipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });

        if (txReceipt.status === "reverted") {
          setRefinanceStatus("rejected-refinance");
          toast({
            variant: "destructive",
            title: "Transaction Reverted",
            description: "Loan refinance reverted on chain",
          });
          return;
        }

        setRefinanceStatus("success");
        toast({
          title: "Loan Refinanced",
          description: "Successfully refinanced loan",
        });
      } catch {
        setRefinanceStatus("rejected-refinance");
        toast({
          variant: "destructive",
          title: "Transaction Cancelled",
          description: "Loan refinance was cancelled",
        });
      }
    } catch (err) {
      Sentry.captureException(err);
      setRefinanceStatus("rejected-refinance");
      toast({
        variant: "destructive",
        title: "Refinance Failed",
        description: formatWalletError(err),
      });
    } finally {
      setIsSigning(false);
    }
  };

  const actionLabel = insufficientBalance
    ? "Insufficient Balance"
    : refinanceStatus === "signing-permission"
      ? "Granting Permission..."
      : refinanceStatus === "signing-refinance"
        ? "Refinancing..."
        : userHasBurnPermission === false
          ? "Grant Permission"
          : "Pay";

  const quoteRows = (
    <div className="bg-grey-450 [&>*:nth-child(odd)]:text-muted-foreground grid grid-cols-[60%_40%] rounded-lg p-3 text-sm [&>*:nth-child(even)]:text-right">
      <p>Collateral Reallocated:</p>
      <div className="flex items-center justify-end">
        {isQuoteLoading ? (
          <div className="activeSkeleton mr-1 h-[17px] w-[32px] rounded-md opacity-30" />
        ) : (
          truncateNumber(
            formatUnits(
              refinanceQuote?.collateralCountToTransfer ?? 0n,
              projectTokenDecimals
            ),
            true
          )
        )}{" "}
        {token.data?.symbol ?? "TOKENS"}
      </div>
      <p>Borrowing:</p>
      <div className="flex items-center justify-end">
        {isQuoteLoading ? (
          <div className="activeSkeleton mr-1 h-[17px] w-[32px] rounded-md opacity-30" />
        ) : (
          formatNumber(newBorrowAmountNum, false)
        )}{" "}
        {baseToken.symbol}
      </div>
      <p>Receive After Fees:</p>
      <div className="flex items-center justify-end">
        {isQuoteLoading ? (
          <div className="activeSkeleton mr-1 h-[17px] w-[32px] rounded-md opacity-30" />
        ) : (
          formatNumber(amountToWallet, false)
        )}{" "}
        {baseToken.symbol}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <DialogTitle>Refinance Loan</DialogTitle>

      {dialogStage === "setCollateral" && (
        <>
          <p className="text-muted-foreground mb-2 text-sm">
            Carve out your token's upside: maintain your original loan terms &
            generate a second loan that pays you based on your original
            collateral's gain.
          </p>
          <div className="bg-grey-450 rounded-lg p-3">
            <h3 className="mb-1">Current Loan Details</h3>
            <div className="text-muted-foreground grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] text-sm">
              <p>
                Collateral:
                <br />
                <span className="text-foreground text-md">
                  {truncateNumber(
                    formatUnits(loan.collateral, projectTokenDecimals),
                    true
                  )}{" "}
                  {token.data?.symbol ?? "TOKENS"}
                </span>
              </p>
              <p>
                Borrowed:
                <br />
                <span className="text-foreground text-md">
                  {formatNumber(
                    formatUnits(loan.borrowAmount, chainTokenDecimals),
                    false
                  )}{" "}
                  {baseToken.symbol}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-grey-450 grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
            <div className="flex flex-col gap-[2px]">
              <p className="text-muted-foreground text-sm font-light uppercase select-none">
                Additional Collateral
              </p>
              <PayInput
                value={additionalCollateral}
                onChangeFunction={(value) => {
                  if (value.startsWith("-")) {
                    setAdditionalCollateral("0");
                    return;
                  }

                  setAdditionalCollateral(value);
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

              <div className="text-muted-foreground flex items-center gap-1 text-sm font-light">
                Balance:{" "}
                {balances.isLoading ? (
                  <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
                ) : chainBalance ? (
                  truncateNumber(chainBalance, true)
                ) : (
                  "0.00"
                )}
              </div>
            </div>
          </div>

          <div className="bg-grey-450 hidden grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 rounded-xl p-1 sm:grid [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
            {[10, 25, 50, 100].map((percent) => (
              <Button
                key={percent}
                className="h-[28px] rounded-xs"
                variant={"secondary"}
                onClick={() => {
                  const amount =
                    percent === 100
                      ? chainBalanceBigInt
                      : (chainBalanceBigInt * BigInt(percent)) / 100n;

                  setAdditionalCollateral(
                    truncateNumber(formatUnits(amount, projectTokenDecimals))
                  );
                }}
              >
                {percent === 100 ? "MAX" : `${percent}%`}
              </Button>
            ))}
          </div>

          {quoteRows}

          <div className="mt-6 flex justify-end space-x-2">
            <DialogClose className="bg-grey-450!" />
            <Button
              className="bg-cerulean!"
              onClick={() => setDialogStage("feeStructure")}
              disabled={!newBorrowAmount || insufficientBalance || isQuoteLoading}
            >
              {insufficientBalance
                ? "Insufficient Balance"
                : !isQuoteLoading && !newBorrowAmount
                  ? "Nothing To Refinance"
                  : "Next"}
            </Button>
          </div>
        </>
      )}

      {dialogStage === "feeStructure" && (
        <>
          <p className="text-muted-foreground mb-2 text-sm">
            Please confirm the fee structure of the loan.
          </p>
          <div className="bg-grey-450 rounded-lg p-2">
            <LoanFeeChart
              prepaidPercent={prepaidPercent}
              setPrepaidPercent={setPrepaidPercent}
              feeData={newLoanFeeData}
              grossBorrowedNative={newBorrowAmountNum}
              fixedFeeRatio={fixedFeeRatio}
              collateralAmount={formatUnits(
                refinanceQuote?.newCollateralCount ?? 0n,
                projectTokenDecimals
              )}
              tokenSymbol={baseToken.symbol}
              collateralTokenSymbol={token.data?.symbol ?? "TOKENS"}
              displayYears={displayYears}
              displayMonths={displayMonths}
            />
          </div>

          {quoteRows}

          <div className="mt-6 flex justify-end space-x-2">
            <Button
              onClick={() => setDialogStage("setCollateral")}
              disabled={isSigning}
            >
              Back
            </Button>
            <ButtonWithWallet
              targetChainId={loanChainId}
              onClick={handleRefinance}
              loading={isSigning}
              disabled={insufficientBalance || !newBorrowAmount || isQuoteLoading}
              className="bg-cerulean!"
            >
              {actionLabel}
            </ButtonWithWallet>
          </div>
        </>
      )}
    </div>
  );
}
