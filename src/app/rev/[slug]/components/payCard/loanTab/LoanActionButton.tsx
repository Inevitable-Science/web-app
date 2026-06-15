"use client";
import * as Sentry from "@sentry/nextjs";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useHasBorrowPermission } from "@/hooks/useHasBorrowPermission";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { formatNumber, formatWalletError, truncateNumber } from "@/lib/utils";
import {
  JB_TOKEN_DECIMALS,
  JBChainId,
  jbPermissionsAbi,
  revLoansAbi,
} from "juice-sdk-core";
import { useJBContractContext, useJBTokenContext } from "juice-sdk-react";
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


export type BorrowStatus =
  | ""
  | "signing-permission"
  | "rejected-permission"
  | "signing-borrow"
  | "rejected-borrow"
  | "success";

export function LoanActionButton({
  loanAmount,
  collateralAmount,
  projectTokenBalance,
  isLoanAmountLoading,
}: {
  loanAmount: bigint | undefined;
  collateralAmount: string;
  projectTokenBalance: bigint;
  isLoanAmountLoading: boolean;
}) {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const [prepaidPercent, setPrepaidPercent] = useState(2.5);

  const [borrowStatus, setBorrowStatus] = useState<BorrowStatus>("");
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [userHasBorrowPerm, setUserHasBorrowPerm] = useState(false);

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
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  // Sucker Derived Values
  const { peerChainId: activeChainId, projectId: activeProjectId } =
    selectedSucker;
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;
  const baseTokenAddress = baseToken.tokenMap[selectedSucker.peerChainId].token;

  const {
    revLoansContractAddress,
    revDeployerFee,
    resolvedPermissionsAddress,
    revPrepaidFeePercent,
  } = useLoanFeeData(activeChainId);

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

  const feeData = generateFeeData({
    grossBorrowedEth: loanAmount
      ? Number(formatUnits(loanAmount, baseToken.decimals))
      : 0,
    prepaidPercent,
  });

  const totalFixedFees =
    (revDeployerFee ? Number(revDeployerFee) : 0) +
    (revPrepaidFeePercent ? Number(revPrepaidFeePercent) : 0);
  const loanAmountNum = loanAmount
    ? Number(formatUnits(loanAmount, baseToken.decimals))
    : 0;
  const protocolFees = loanAmountNum * (totalFixedFees / 1000);
  const prepaidAmount = (prepaidPercent / 100) * loanAmountNum;
  const amountToWallet = loanAmountNum - protocolFees - prepaidAmount;

  const amountToWalletFormatted =
    amountToWallet < 1
      ? truncateNumber(amountToWallet)
      : formatNumber(amountToWallet, false);

  const feeBasisPoints = Math.round(prepaidPercent * 10);
  const collateralBigInt = parseUnits(collateralAmount, projectTokenDecimals);
  const lessThanMinCollateral =
    collateralBigInt < parseUnits("0.001", projectTokenDecimals);

  // Chart Vars
  const monthsToPrepay = (prepaidPercent / 50) * 120;
  const prepaidMonths = monthsToPrepay;
  const displayYears = Math.floor(prepaidMonths / 12);
  const displayMonths = Math.round(prepaidMonths % 12);

  const handleBorrow = async () => {
    try {
      if (
        !publicClient ||
        !primaryNativeTerminal?.data ||
        !address ||
        !resolvedPermissionsAddress
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
            args: [
              address,
              {
                operator: revLoansContractAddress,
                projectId: activeProjectId,
                permissionIds: [1],
              },
            ],
          });
          await publicClient.waitForTransactionReceipt({ hash: txHash });

          setBorrowStatus("");
          setUserHasBorrowPerm(true);
        } catch (err) {
          setBorrowStatus("rejected-permission");
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description:
              "Permission was not granted. Please approve to proceed.",
          });
          return;
        }
      }

      try {
        setBorrowStatus("signing-borrow");
        await writeContractAsync({
          abi: revLoansAbi,
          functionName: "borrowFrom",
          address: revLoansContractAddress,
          chainId: Number(activeChainId) as JBChainId,
          args: [
            activeProjectId,
            {
              token: baseTokenAddress,
              terminal: primaryNativeTerminal.data,
            },
            0n,
            collateralBigInt,
            address as `0x${string}`,
            BigInt(feeBasisPoints),
          ],
        });

        setBorrowStatus("success");
        toast({
          variant: "destructive",
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
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                  Your {formatNumber(collateralAmount, false)} $
                  {token.data?.symbol} tokens will be burned as collateral
                </li>
                <li>You will receive an NFT to reclaim them when repaying</li>
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

            <div className="background-color my-4 overflow-y-auto rounded-xl p-4 text-sm">
              <p>
                Collateral Amount: {formatNumber(collateralAmount, false)} $
                {token.data?.symbol}
              </p>
              <p>
                You Receive: {amountToWalletFormatted} {baseToken.symbol}
              </p>
            </div>

            <div className="background-color my-4 overflow-y-auto rounded-xl px-4 py-2 text-xs">
              <LoanFeeChart
                prepaidPercent={prepaidPercent}
                setPrepaidPercent={setPrepaidPercent}
                feeData={feeData}
                grossBorrowedNative={
                  loanAmount
                    ? Number(formatUnits(loanAmount, baseToken.decimals))
                    : 0
                }
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
            <DialogTitle>Sign Transactions</DialogTitle>
            <DialogDescription>
              Sign the following transactions to open a new loan.
            </DialogDescription>

            <div className="background-color my-4 overflow-y-auto rounded-xl p-4 text-sm">
              <p>
                Collateral Amount: {formatNumber(collateralAmount, false)} $
                {token.data?.symbol}
              </p>
              <p>Prepaid Percent: {prepaidPercent}%</p>
              <p>
                You Receive: {amountToWalletFormatted} {baseToken.symbol}
              </p>
            </div>

            <LoanStepper
              currentStep={borrowStatus}
              userHasPermission={userHasPermission ?? false}
            />

            <div className="mt-6 flex justify-end space-x-2">
              <DialogClose>Cancel</DialogClose>
              <ButtonWithWallet
                targetChainId={activeChainId}
                onClick={handleBorrow}
                className={"bg-cerulean hover:bg-cerulean"}
                loading={isBorrowing}
                disabled={!collateralAmount}
              >
                Open Loan
              </ButtonWithWallet>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
