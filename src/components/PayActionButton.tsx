import { useToast } from "@/components/ui/use-toast";
import { NATIVE_TOKEN, TokenAmountType } from "juice-sdk-core";
import {
  useJBContractContext,
  useJBChainId,
  useWriteJbMultiTerminalPay,
  useSuckers,
  JBChainId,
} from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { SuckerPair } from "juice-sdk-core";
import { Loader2 } from "lucide-react";
import { twMerge } from "tailwind-merge";

const shimmerClasses = `
    relative overflow-hidden 
    before:content-[''] before:absolute before:inset-0 
    before:-translate-x-full before:animate-[shimmer_2s_infinite] 
    before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent
  `;

/**
 * A self-contained button that handles the entire payment transaction flow,
 * including wallet connection, chain switching, and transaction state.
 */
export function PayActionButton({
  amountA,
  amountB,
  memo,
  disabled,
  selectedSucker
}: {
  amountA: TokenAmountType;
  amountB: TokenAmountType;
  memo: string | undefined;
  disabled?: boolean;
  selectedSucker?: SuckerPair | undefined;
}) {
  // --- 1. HOOKS for context, wallet, and transaction ---
  const { contracts: { primaryNativeTerminal } } = useJBContractContext();
  const { address } = useAccount();
  const { toast } = useToast();

  const {
    data: txHash,
    isPending: isWriteLoading,
    isError: isWriteError,
    error: writeError,
    writeContract,
  } = useWriteJbMultiTerminalPay();

  const {
    isLoading: isTxLoading,
    isSuccess,
    isError: isTxError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  // --- 2. STATE & EFFECTS for loading and feedback ---
  const loading = isWriteLoading || isTxLoading;

  // Effect for showing error/success toasts
  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Success!",
        description: `Your contribution of ${amountA.amount.format(4)} ${amountA.symbol} was successful.`,
      });
    }
    if (isWriteError || isTxError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (writeError?.name || "Transaction failed."),
      });
    }
  }, [isSuccess, isWriteError, isTxError, writeError, toast, amountA]);


  // --- 3. CORE TRANSACTION HANDLER ---
  const handlePay = () => {
    if (!primaryNativeTerminal?.data || !address || !selectedSucker || !writeContract) {
      return;
    }
    const value = amountA.amount.value;

    writeContract({
      chainId: selectedSucker.peerChainId,
      address: primaryNativeTerminal.data,
      args: [
        selectedSucker.projectId,
        NATIVE_TOKEN,
        value,
        address,
        0n, // minReturnedTokens
        memo || "",
        "0x0", // delegateMetadata
      ],
      value,
    });
  };

  // --- 4. DYNAMIC BUTTON TEXT & STYLING ---
  const buttonContent = useMemo(() => {
    if (loading) {
      return (
        <>
          Processing...
        </>
      );
    }
    if (isSuccess) return "Success!";
    return "Buy";
  }, [loading, isSuccess, isWriteError, isTxError]);

  return (
    <ButtonWithWallet
      targetChainId={selectedSucker?.peerChainId as JBChainId | undefined}
      disabled={disabled || loading}
      loading={loading}
      onClick={handlePay}
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