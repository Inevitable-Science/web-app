"use client";
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { Button } from "@/components/ui/button";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import {
  getRevnetLoanContract,
  JB_TOKEN_DECIMALS,
  revLoansAbi,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import Image from "next/image";
import { useState } from "react";
import { LoanType } from "./LoanDialog";
import { Address, erc20Abi, formatUnits, parseUnits } from "viem";
import { formatNumber, formatWalletError, truncateNumber } from "@/lib/utils";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSimulateContract,
  useWriteContract,
} from "wagmi";
import { useToast } from "@/components/ui/use-toast";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";

const calculateCollateralAmount = (
  input: string,
  maxCollateral: bigint,
  projectTokenDecimals: number
): bigint => {
  try {
    const userInputWei = parseUnits(input, projectTokenDecimals);
    return userInputWei >= maxCollateral ? maxCollateral : userInputWei;
  } catch (error) {
    return 0n;
  }
};

export function RepayTab({ loan }: { loan: LoanType }) {
  const [collateralToReturn, setCollateralToReturn] = useState("");
  const [repayStatus, setRepayStatus] = useState<
    | ""
    | "signing-approval"
    | "rejected-approval"
    | "signing-repay"
    | "rejected-repay"
    | "success"
  >("");
  const [hasApproved, setHasApproved] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const { version } = useJBContractContext();
  const baseToken = useProjectBaseToken();
  const loanChainId = loan.chainId;
  const baseTokenAddress = baseToken.tokenMap[loanChainId].token;
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const collateralToReturnBigInt = parseUnits(
    collateralToReturn,
    baseToken.decimals
  );
  const collateralToReturnPercent =
  loan.collateral
    ? (collateralToReturnBigInt * 100n) / loan.collateral
    : 0n;

  const insufficientCollateral = collateralToReturnBigInt > loan.collateral;

  const { data: loanData, isLoading: isLoadingLoan } = useReadContract({
    abi: revLoansAbi,
    functionName: "loanOf",
    address: getRevnetLoanContract(version, loanChainId),
    chainId: loanChainId,
    args: [BigInt(loan.id)],
  });

  const simulationArgs = [
    BigInt(loan.id),
    loan.borrowAmount, // Always use full loan amount - contract will calculate exact amount needed
    calculateCollateralAmount(
      collateralToReturn,
      loan.collateral,
      baseToken.decimals
    ),
    address as Address,
    {
      sigDeadline: 0n,
      amount: 0n,
      expiration: 0,
      nonce: 0,
      signature:
        "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
    },
  ];

  const {
    data: simulationResult,
    isLoading: isSimulating,
  } = useSimulateContract({
    abi: revLoansAbi,
    functionName: "repayLoan",
    address: getRevnetLoanContract(version, loanChainId),
    chainId: loanChainId,
    args: simulationArgs as unknown as readonly [
      bigint,
      bigint,
      bigint,
      `0x${string}`,
      {
        sigDeadline: bigint;
        amount: bigint;
        expiration: number;
        nonce: number;
        signature: `0x${string}`;
      },
    ],
    value: baseToken.isNative ? loanData?.amount : 0n, // Only send ETH value for ETH-based projects
  });

  // Extract the exact amount from simulation result for display purposes only
  const exactRepayAmount = (() => {
    if (!simulationResult?.result) return undefined;

    // Try to extract amount from simulation result
    if (
      Array.isArray(simulationResult.result) &&
      simulationResult.result.length >= 2
    ) {
      const remainingLoanAmount = simulationResult.result[1]?.amount;

      if (remainingLoanAmount !== undefined && loanData) {
        // Calculate payment amount: original loan - remaining loan
        const paymentAmount = loanData.amount - BigInt(remainingLoanAmount);
        return paymentAmount;
      }
      return undefined;
    }

    // Try direct result if it's not an array
    if (
      simulationResult.result &&
      typeof simulationResult.result === "object" &&
      "amount" in simulationResult.result
    ) {
      const remainingLoanAmount = simulationResult.result.amount;
      if (
        remainingLoanAmount !== undefined &&
        loanData &&
        (typeof remainingLoanAmount === "string" ||
          typeof remainingLoanAmount === "number" ||
          typeof remainingLoanAmount === "bigint")
      ) {
        const paymentAmount = loanData.amount - BigInt(remainingLoanAmount);
        return paymentAmount;
      }
    }

    return undefined;
  })();

  const handleRepay = async () => {
    if (!loanData || !address || !publicClient || !loanChainId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required data for repayment",
      });
      return;
    }

    try {
      setIsPending(true);
      const loanIdBigInt = BigInt(loan.id);
      const maxRepayBorrowAmount = loanData.amount; // Use full loan amount as ceiling
      const collateralCountToReturn = calculateCollateralAmount(
        collateralToReturn,
        loanData.collateral,
        baseToken.decimals
      );

      // Check allowance for USDC-based projects
      if (!baseToken.isNative) {
        const revLoansContractAddress = getRevnetLoanContract(
          version,
          loanChainId
        );

        const allowance = await publicClient.readContract({
          address: baseTokenAddress,
          abi: erc20Abi,
          functionName: "allowance",
          args: [address as Address, revLoansContractAddress as Address],
        });

        if (allowance < maxRepayBorrowAmount) {
          try {
            setRepayStatus("signing-approval");

            const approveHash = await writeContractAsync({
              address: baseTokenAddress,
              abi: erc20Abi,
              functionName: "approve",
              args: [revLoansContractAddress as Address, maxRepayBorrowAmount],
            });

            await publicClient.waitForTransactionReceipt({ hash: approveHash });
            setHasApproved(true);
          } catch (err) {
            console.error(err);
            setRepayStatus("rejected-approval");
          }
        } else {
          setHasApproved(true);
        }
      }

      try {
        setRepayStatus("signing-repay");

        const txHash = await writeContractAsync({
          abi: revLoansAbi,
          functionName: "repayLoan",
          address: getRevnetLoanContract(version, loanChainId),
          chainId: loanChainId,
          args: [
            loanIdBigInt,
            maxRepayBorrowAmount,
            collateralCountToReturn,
            address,
            {
              sigDeadline: 0n,
              amount: 0n,
              expiration: 0,
              nonce: 0,
              signature:
                "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
            },
          ],
          value: baseToken.isNative ? exactRepayAmount || loanData?.amount : 0n,
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });
        setRepayStatus("success");
        toast({
          title: "Success",
          description: "Successfully repaid loan and unlocked collateral",
        });
      } catch (err) {
        console.error(err);
        setRepayStatus("rejected-repay");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Repayment Failed",
        description: formatWalletError(error),
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <DialogTitle className="text-lg font-semibold">Repay Loan</DialogTitle>
      <p className="text-muted-foreground text-sm">
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
            {formatNumber(formatUnits(loan.collateral, projectTokenDecimals))}
          </p>
        </div>
      </div>

      <div className="bg-grey-450 hidden grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 rounded-xl p-1 sm:grid [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
        {[10, 25, 50, 100].map((percent) => (
          <Button
            className="h-[28px] rounded-xs"
            variant={"secondary"}
            key={percent}
            onClick={() => {
              const amount = (loan.collateral / 100n) * BigInt(percent);
              const formattedAmount = formatUnits(amount, projectTokenDecimals);
              setCollateralToReturn(formattedAmount);
            }}
          >
            {percent === 100 ? "MAX" : `${percent}%`}
          </Button>
        ))}
      </div>

      <div className="bg-grey-450 [&>*:nth-child(odd)]:text-muted-foreground grid grid-cols-[60%_40%] rounded-lg p-3 text-sm [&>*:nth-child(even)]:text-right">
        <p>Current Borrow Amount:</p>
        <p>
          {formatNumber(
            formatUnits(loan.borrowAmount, projectTokenDecimals),
            false
          )}{" "}
          {baseToken.symbol}
        </p>
        <p>
          Collateral To Unlock (
          {Number(collateralToReturnPercent) > 100
            ? ">100"
            : Number(collateralToReturnPercent)}
          %):
        </p>
        <p>
          {formatNumber(collateralToReturn, false) || 0} {token.data?.symbol}
        </p>
        <p>Amount To Pay Now:</p>
        <div className="flex justify-end">
          {Number(collateralToReturn) && isSimulating ? (
            <div className="activeSkeleton h-[16px] w-[48px] rounded-sm" />
          ) : exactRepayAmount === undefined ? (
            `0 ${baseToken.symbol}`
          ) : (
            `${formatNumber(
              formatUnits(exactRepayAmount, baseToken.decimals),
              false
            )} ${baseToken.symbol}`
          )}
        </div>
        <p>Amount Carried Into New Loan:</p>
        <div className="flex justify-end">
          {Number(collateralToReturn) && (isSimulating || isLoadingLoan) ? (
            <div className="activeSkeleton h-[16px] w-[48px] rounded-sm" />
          ) : exactRepayAmount === undefined || !loanData?.amount ? (
            `0 ${baseToken.symbol}`
          ) : (
            `${formatNumber(
              formatUnits(
                loanData.amount - exactRepayAmount,
                baseToken.decimals
              ),
              false
            )} 
            ${baseToken.symbol}`
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <DialogClose asChild>
          <Button>Cancel</Button>
        </DialogClose>
        <ButtonWithWallet
          targetChainId={loanChainId}
          onClick={handleRepay}
          disabled={!collateralToReturn || insufficientCollateral}
          loading={isPending}
          className="bg-cerulean!"
        >
          {insufficientCollateral ? "Insufficient Collateral" : "Pay"}
        </ButtonWithWallet>
      </div>
    </div>
  );
}
