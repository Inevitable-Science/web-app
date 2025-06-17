// src/components/WithdrawActionButton.tsx

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import { DEFAULT_METADATA, NATIVE_TOKEN, SuckerPair } from "juice-sdk-core";
import {
  JBChainId,
  useJBContractContext,
  useWriteJbMultiTerminalCashOutTokensOf,
} from "juice-sdk-react";
import { useEffect, useMemo } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

const shimmerClasses = `
    relative overflow-hidden 
    before:content-[''] before:absolute before:inset-0 
    before:-translate-x-full before:animate-[shimmer_2s_infinite] 
    before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent
  `;

export function WithdrawActionButton({
  amountToWithdraw,
  disabled,
  selectedSucker,
}: {
  amountToWithdraw: bigint;
  disabled?: boolean;
  selectedSucker?: SuckerPair | undefined;
}) {
  const { projectId, contracts: { primaryNativeTerminal } } = useJBContractContext();
  const { address, chainId } = useAccount();
  const { toast } = useToast();

  const {
    data: txHash,
    isPending: isWriteLoading,
    isError: isWriteError,
    error: writeError,
    writeContract,
  } = useWriteJbMultiTerminalCashOutTokensOf();

  const {
    isLoading: isTxLoading,
    isSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const loading = isWriteLoading || isTxLoading;

  useEffect(() => {
    if (isSuccess) {
      toast({ title: "Withdraw Successful!", description: "Your ETH is on its way." });
    }
    if (isWriteError || isTxError) {
      toast({
        variant: "destructive",
        title: "Withdraw Failed",
        description: writeError?.name || "An unknown error occurred.",
      });
    }
  }, [isSuccess, isWriteError, isTxError, writeError, toast]);

  const handleWithdraw = () => {
    if (!primaryNativeTerminal?.data || !address || !writeContract || !selectedSucker || !chainId) return;

    writeContract({
      chainId: selectedSucker.peerChainId,
      address: primaryNativeTerminal.data,
      args: [
        address, // holder of tokens
        selectedSucker.projectId,
        amountToWithdraw,
        NATIVE_TOKEN, // The token to receive back (ETH)
        0n, // minTokensReclaimed (for slippage, 0 for now)
        address, // beneficiary
        DEFAULT_METADATA,
      ],
    });
  };
  
  const buttonContent = useMemo(() => {
    if (loading) return <>Processing...</>;
    if (isSuccess) return "Success!";
    /* if (isWriteError || isTxError) return "Error - Try Again"; */
    return "Withdraw";
  }, [loading, isSuccess, isWriteError, isTxError]);

  return (
    <ButtonWithWallet
      targetChainId={selectedSucker?.peerChainId as JBChainId | undefined}
      disabled={false}
      loading={loading}
      onClick={handleWithdraw}
      className={twMerge(
        "w-full rounded-full transition-colors hover:bg-columbia-blue hover:text-dark-slate-grey",
        shimmerClasses,
        "w-full rounded-full bg-cerulean",
      )}
    >
      {buttonContent}
    </ButtonWithWallet>
  );
}