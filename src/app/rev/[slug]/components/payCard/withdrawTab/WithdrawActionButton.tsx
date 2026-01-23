import { useEffect, useMemo } from "react";
import { Address, parseUnits } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  DEFAULT_METADATA,
  jbMultiTerminalAbi,
  NATIVE_TOKEN_DECIMALS,
} from "juice-sdk-core";
import { JBChainId, useJBContractContext } from "juice-sdk-react";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

const shimmerClasses = `
    w-full rounded-full bg-cerulean px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-columbia-blue hover:text-dark-slate-grey focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:opacity-50
    relative overflow-hidden 
    before:content-[''] before:absolute before:inset-0 
    before:-translate-x-full before:animate-shimmer 
    before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent
`;

export function WithdrawActionButton({
  withdrawAmount,
  receiveTokenAddress,
  tokenBalance,
  disabled,
}: {
  withdrawAmount: string;
  receiveTokenAddress?: Address;
  tokenBalance: number;
  disabled?: boolean;
}) {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);

  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();
  const { address, chainId } = useAccount();
  const { toast } = useToast();
  const {
    data: txHash,
    isPending: isWriteLoading,
    isError: isWriteError,
    error: writeError,
    writeContractAsync,
  } = useWriteContract();

  const {
    isLoading: isTxLoading,
    isSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const loading = isWriteLoading || isTxLoading;
  const insufficientFunds = Number(withdrawAmount) > tokenBalance;

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Withdraw Successful!",
        description: "You Successfully Withdrew Your Tokens.",
      });
    }
    if (isWriteError || isTxError) {
      toast({
        variant: "destructive",
        title: "Withdraw Failed",
        description: "Couldn't Withdraw Your Tokens.",
      });
    }
  }, [isSuccess, isWriteError, isTxError, writeError, toast]);

  const handleWithdraw = async () => {
    if (
      !primaryNativeTerminal?.data ||
      !address ||
      !writeContractAsync ||
      !selectedSucker ||
      !chainId ||
      !receiveTokenAddress
    ) {
      toast({
        variant: "destructive",
        title: "Error Preparing Transaction",
        description: "Couldn't Prepare Your Transaction.",
      });
      return;
    }

    await writeContractAsync({
      abi: jbMultiTerminalAbi,
      functionName: "cashOutTokensOf",
      chainId: selectedSucker?.peerChainId,
      address: primaryNativeTerminal.data,
      args: [
        address, // holder
        selectedSucker.projectId, // project id (use the correct project ID for the selected chain)
        withdrawAmount ? parseUnits(withdrawAmount, NATIVE_TOKEN_DECIMALS) : 0n, // cash out count
        receiveTokenAddress, // token to reclaim (what you want to receive)
        0n, // min tokens reclaimed
        address, // beneficiary
        DEFAULT_METADATA, // metadata,
      ],
    });
  };

  const buttonContent = useMemo(() => {
    if (insufficientFunds) return "Insufficient Funds";
    if (loading) return "Processing...";
    if (isSuccess) return "Success!";
    return "Withdraw";
  }, [loading, isSuccess, isWriteError, isTxError, insufficientFunds]);

  return (
    <ButtonWithWallet
      targetChainId={selectedSucker?.peerChainId as JBChainId | undefined}
      disabled={
        disabled ||
        ((insufficientFunds || !withdrawAmount) &&
          chainId === selectedSucker?.peerChainId)
      }
      loading={loading}
      onClick={handleWithdraw}
      className={shimmerClasses}
    >
      {buttonContent}
    </ButtonWithWallet>
  );
}
