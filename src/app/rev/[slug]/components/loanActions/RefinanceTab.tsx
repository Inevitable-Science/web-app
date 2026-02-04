import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { Button } from "@/components/ui/button";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import {
  JB_TOKEN_DECIMALS,
  revLoansAbi
} from "juice-sdk-core";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import Image from "next/image";
import { useState } from "react";
import { LoanType } from "./LoanDialog";
import { formatUnits, parseUnits } from "viem";
import { formatNumber, formatWalletError, truncateNumber } from "@/lib/utils";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { generateFeeData } from "@/lib/feeHelpers";
import { useToast } from "@/components/ui/use-toast";
import { LoanFeeChart } from "../payCard/loanTab/LoanFeeChart";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useLoanFeeData } from "@/hooks/useLoanFeeData";

export function RefinanceTab({ loan }: { loan: LoanType }) {
  const [additionalCollateral, setAdditionalCollateral] = useState("");
  const [prepaidPercent, setPrepaidPercent] = useState(2.5);
  const [borrowStatus, setBorrowStatus] = useState("");
  const [isBorrowing, setIsBorrowing] = useState(false);

  const [dialogStage, setDialogStage] = useState<
    "setCollateral" | "feeStructure" | "transactions"
  >("setCollateral");

  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const { contracts: { primaryNativeTerminal } } = useJBContractContext();
  const baseToken = useProjectBaseToken();
  const baseTokenAddress = baseToken.tokenMap[loan.chainId].token;

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  const balances = useSuckersUserTokenBalance();
  const loanChainId = loan.chainId;

  const chainBalanceObj = balances.data?.find((t) => t.chainId === loanChainId);
  const chainBalanceBigInt = chainBalanceObj?.balance.value;
  const chainBalance = chainBalanceObj?.balance.format();

  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  const {
    revLoansContractAddress,
    revDeployerFee,
    revPrepaidFeePercent
  } = useLoanFeeData(loanChainId);

  const {
    data: currentBorrowableOnSelectedCollateral,
    isLoading: isCurrentBorrowableLoading,
  } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: revLoansContractAddress,
    chainId: loanChainId,
    args: additionalCollateral
      ? [
          // Use the same project ID as the loan table for consistency
          BigInt(loan.projectId),
          BigInt(loan.collateral),
          BigInt(baseToken.decimals),
          BigInt(baseToken.currency),
        ]
      : undefined,
  });

  const collateralHeadroom =
    currentBorrowableOnSelectedCollateral !== undefined && loan
      ? currentBorrowableOnSelectedCollateral - BigInt(loan.borrowAmount)
      : 0n;

  // Calculate borrowable amount for just the new loan (headroom + additional collateral)
  const newLoanCollateral =
    collateralHeadroom +
    (additionalCollateral
      ? parseUnits(additionalCollateral, projectTokenDecimals)
      : 0n);

  const totalReallocationCollateral =
    loan && additionalCollateral
      ? BigInt(loan.collateral) +
        parseUnits(additionalCollateral, projectTokenDecimals)
      : undefined;

  const { data: selectedLoanReallocAmount } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: revLoansContractAddress,
    chainId: loanChainId,
    args: totalReallocationCollateral
      ? [
          // Use the same project ID as the loan table for consistency
          BigInt(loan.projectId),
          totalReallocationCollateral,
          BigInt(baseToken.decimals),
          BigInt(baseToken.currency),
        ]
      : undefined,
  });

  const { data: newLoanBorrowableAmount, isLoading: isBorrowableAmtLoading } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: revLoansContractAddress,
    chainId: loanChainId,
    args:
      additionalCollateral && newLoanCollateral > 0n
        ? [
            // Use the same project ID as the loan table for consistency
            BigInt(loan.projectId),
            newLoanCollateral,
            BigInt(baseToken.decimals),
            BigInt(baseToken.currency),
          ]
        : undefined,
  });

  const collateralCountToTransfer =
    loan && currentBorrowableOnSelectedCollateral
      ? BigInt(
          Math.floor(
            Number(collateralHeadroom) /
              (Number(currentBorrowableOnSelectedCollateral) /
                Number(loan.collateral))
          )
        )
      : BigInt(0);

  const collateralToTransfer = Number(
    formatUnits(collateralCountToTransfer, projectTokenDecimals)
  );
  const noCollateralToTransfer = collateralToTransfer <= 0;


  const newLoanFeeData = generateFeeData({
    grossBorrowedEth: newLoanBorrowableAmount
      ? Number(formatUnits(newLoanBorrowableAmount, baseToken.decimals))
      : 0,
    prepaidPercent,
  });

  // Calculate total fixed fees from contract values (in basis points)
  const amountBorrowed = newLoanBorrowableAmount
    ? Number(formatUnits(newLoanBorrowableAmount, projectTokenDecimals))
    : 0;
  const totalFixedFees =
    (revDeployerFee ? Number(revDeployerFee) : 0) +
    (revPrepaidFeePercent ? Number(revPrepaidFeePercent) : 0);
  const protocolFees = Number(amountBorrowed) * (totalFixedFees / 1000);
  const protocolFeesPercentage = (totalFixedFees / 1000) * 100;
  const prepaidAmount = (Number(prepaidPercent) / 100) * amountBorrowed;
  const amountToWallet = amountBorrowed
    ? amountBorrowed - protocolFees - prepaidAmount
    : 0;

  const { data: borrowableAmountRaw } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: revLoansContractAddress,
    chainId: loanChainId,
    args: chainBalanceBigInt
      ? [
          BigInt(loan.projectId),
          chainBalanceBigInt,
          BigInt(baseToken.decimals),
          BigInt(baseToken.currency),
        ]
      : undefined,
  });

  // Chart Logic
  const monthsToPrepay = (prepaidPercent / 50) * 120;
  const prepaidMonths = monthsToPrepay;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  const percent = chainBalanceBigInt
    ? Number(
        formatUnits(
          parseUnits(additionalCollateral, projectTokenDecimals),
          projectTokenDecimals
        )
      ) / Number(formatUnits(chainBalanceBigInt, projectTokenDecimals))
    : 0;
  const estimatedRaw = borrowableAmountRaw
    ? Number(formatUnits(borrowableAmountRaw, baseToken.decimals))
    : 0;
  const adjusted = estimatedRaw * percent;

  const handleBorrow = async () => {
    if (!isNaN(Number(additionalCollateral))) {
      // Reallocation path - allow 0 additional capital
      if (
        !loan ||
        !primaryNativeTerminal?.data ||
        !loan.chainId ||
        !address ||
        !publicClient
      ) {
        setBorrowStatus("error");
        return;
      }

      // Fix the parameter calculations based on the guidance:
      // Calculate the safe transfer amount to avoid under-collateralization
      const principalCover = BigInt(loan.borrowAmount);
      const maxRemovable = currentBorrowableOnSelectedCollateral
        ? currentBorrowableOnSelectedCollateral - principalCover
        : 0n;

      // Only transfer the safe amount (or less)
      const collateralCountToTransfer = maxRemovable > 0n ? maxRemovable : 0n;

      // collateralCountToAdd: The amount of collateral to add to the new loan (can be 0)
      // Should be in project token decimals, not base token decimals
      const collateralCountToAdd = parseUnits(
        additionalCollateral || "0",
        projectTokenDecimals
      );

      // feePercent: The fee percent for the new loan
      const feePercent = BigInt(Math.round(prepaidPercent * 10));

      // Validate that the reallocation won't result in a borrow amount less than the original
      if (
        selectedLoanReallocAmount !== undefined &&
        selectedLoanReallocAmount < BigInt(loan.borrowAmount)
      ) {
        setBorrowStatus("error");
        toast({
          variant: "destructive",
          title: "Cannot Refinance",
          description:
            "Adding this collateral would result in a borrow amount less than your original loan. Please add more collateral.",
        });
        return;
      }

      // Set minBorrowAmount to 0 as per the guidance
      const minBorrowAmount = 0n;

      try {
        setIsBorrowing(true);
        setBorrowStatus("waiting-signature");

        const txHash = await writeContractAsync({
          abi: revLoansAbi,
          functionName: "reallocateCollateralFromLoan",
          address: revLoansContractAddress,
          chainId: loan.chainId,
          args: [
            loan.id,
            collateralCountToTransfer,
            {
              token: baseTokenAddress,
              terminal: primaryNativeTerminal.data,
            },
            minBorrowAmount,
            collateralCountToAdd,
            address,
            feePercent,
          ],
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });
        toast({
          title: "Loan Refinanced",
          description: "Successfully refinanced loan",
        });
      } catch (err) {
        setBorrowStatus("error");
        toast({
          variant: "destructive",
          title: "Refinance Failed",
          description: formatWalletError(err),
        });
      } finally {
        setIsBorrowing(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <DialogTitle className="text-lg font-semibold">
        Refinance Loan
      </DialogTitle>

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
                  {formatNumber(
                    formatUnits(loan.collateral, projectTokenDecimals)
                  )}{" "}
                  {token.data?.symbol ?? "TOKENS"}
                </span>
              </p>
              <p>
                Borrowed:
                <br />
                <span className="text-foreground text-md">
                  {formatNumber(
                    formatUnits(loan.borrowAmount, baseToken.decimals)
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
                onChangeFunction={setAdditionalCollateral}
                //disabled={noCollateralToTransfer}
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
                  formatNumber(chainBalance, false)
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
                  const amount = chainBalanceBigInt
                    ? (chainBalanceBigInt / 100n) * BigInt(percent)
                    : 0n;
                  const formattedAmount = truncateNumber(
                    formatUnits(
                      amount,
                      projectTokenDecimals
                    )
                  );
                  setAdditionalCollateral(formattedAmount);
                }}
                //disabled={noCollateralToTransfer}
              >
                {percent === 100 ? "MAX" : `${percent}%`}
              </Button>
            ))}
          </div>

          <div className="bg-grey-450 [&>*:nth-child(odd)]:text-muted-foreground grid grid-cols-[60%_40%] rounded-lg p-3 text-sm [&>*:nth-child(even)]:text-right">
            {/*<p>
              Head Room To Reallocate: // what is this..?
            </p>
            <p>
              {collateralToTransfer}
            </p>*/}
            <p>Borrowing:</p>
            <div className="flex justify-end">
              {additionalCollateral && isBorrowableAmtLoading ? (
                <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
              ) : newLoanBorrowableAmount ? (
                formatNumber(
                  formatUnits(newLoanBorrowableAmount, baseToken.decimals),
                  false
                )
              ) : (
                "0.00"
              )}{" "}
              {baseToken.symbol}
            </div>
            <p>Receive After Fees:</p>
            <div className="flex justify-end">
              {additionalCollateral && isBorrowableAmtLoading ? (
                <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
              ) : amountToWallet ? (
                formatNumber(amountToWallet, false)
              ) : (
                "0.00"
              )}{" "}
              {baseToken.symbol}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
            <Button
              className="bg-cerulean!"
              onClick={() => setDialogStage("feeStructure")}
              disabled={!additionalCollateral}
            >
              Next
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
              grossBorrowedNative={adjusted}
              collateralAmount={formatUnits(
                newLoanCollateral,
                projectTokenDecimals
              )}
              tokenSymbol={baseToken.symbol}
              collateralTokenSymbol={token.data?.symbol ?? "TOKENS"}
              displayYears={displayYears}
              displayMonths={displayMonths}
            />
          </div>

          <div className="bg-grey-450 [&>*:nth-child(odd)]:text-muted-foreground grid grid-cols-[60%_40%] rounded-lg p-3 text-sm [&>*:nth-child(even)]:text-right">
            {/*<p>
              Head Room To Reallocate: // what is this..?
            </p>
            <p>
              {collateralToTransfer}
            </p>*/}
            <p>Borrowing:</p>
            <div className="flex justify-end">
              {additionalCollateral && isBorrowableAmtLoading ? (
                <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
              ) : newLoanBorrowableAmount ? (
                formatNumber(
                  formatUnits(newLoanBorrowableAmount, baseToken.decimals),
                  false
                )
              ) : (
                "0.00"
              )}{" "}
              {baseToken.symbol}
            </div>
            <p>Receive After Fees:</p>
            <div className="flex justify-end">
              {additionalCollateral && isBorrowableAmtLoading ? (
                <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
              ) : amountToWallet ? (
                formatNumber(amountToWallet, false)
              ) : (
                "0.00"
              )}{" "}
              {baseToken.symbol}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button onClick={() => setDialogStage("setCollateral")}>
              Back
            </Button>
            <ButtonWithWallet
              targetChainId={loan.chainId}
              onClick={handleBorrow}
              loading={isBorrowing}
              className="bg-cerulean!"
            >
              Pay
            </ButtonWithWallet>
          </div>
        </>
      )}
    </div>
  );
}
