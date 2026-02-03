import { useState } from "react";
import { Address } from "viem";
import {
  useAccount,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import {
  DEFAULT_METADATA,
  jbMultiTerminalAbi,
} from "juice-sdk-core";
import { JBChainId, useJBContractContext } from "juice-sdk-react";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { Button } from "@/components/ui/button";

const shimmerClasses = `
    w-full rounded-full bg-cerulean px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-columbia-blue hover:text-dark-slate-grey focus:outline-hidden focus:ring-4 focus:ring-blue-300 disabled:opacity-50
    relative overflow-hidden 
    before:content-[''] before:absolute before:inset-0 
    before:-translate-x-full before:animate-shimmer 
    before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent
`;

export function WithdrawActionButton({
  withdrawAmount,
  tokenBalance,
  minTokensReturned,
  receiveTokenAddress,
  disabled,
}: {
  withdrawAmount: bigint;
  tokenBalance: bigint;
  minTokensReturned: bigint | undefined;
  receiveTokenAddress: Address;
  disabled?: boolean;
}) {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const [isLoading, setIsLoading] = useState(false);

  const { contracts: { primaryNativeTerminal } } = useJBContractContext();
  
  const publicClient = usePublicClient();
  const { address, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  const insufficientFunds = withdrawAmount > tokenBalance;

  const handleWithdraw = async () => {
    if (
      !primaryNativeTerminal?.data ||
      !address ||
      !publicClient ||
      !minTokensReturned
    ) {
      toast({
        variant: "destructive",
        title: "Error Preparing Transaction",
        description: "Couldn't Prepare Your Transaction.",
      });
      return;
    }
    
    try {
      setIsLoading(true);

      const txHash = await writeContractAsync({
        abi: jbMultiTerminalAbi,
        functionName: "cashOutTokensOf",
        chainId: selectedSucker?.peerChainId,
        address: primaryNativeTerminal.data,
        args: [
          address, // holder
          selectedSucker.projectId, // project id (use the correct project ID for the selected chain)
          withdrawAmount ?? 0n, // cash out count
          receiveTokenAddress, // token to reclaim (what you want to receive)
          minTokensReturned, // min tokens reclaimed
          address, // beneficiary
          DEFAULT_METADATA, // metadata,
        ],
      });

      const tx = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (tx.status !== "success") throw new Error();

      toast({
        title: "Withdraw Successful!",
        description: "You Successfully Withdrew Your Tokens.",
      });

    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "Withdraw Failed",
        description: "Couldn't Withdraw Your Tokens.",
      });
    } finally {
      setIsLoading(false);
    };
  };

  if (insufficientFunds) return (
    <Button
      className={shimmerClasses}
      disabled
    >
      Insufficient Funds
    </Button>
  );

  return (
    <ButtonWithWallet
      targetChainId={selectedSucker?.peerChainId as JBChainId | undefined}
      disabled={
        disabled ||
        !minTokensReturned ||
        (!withdrawAmount && chainId === selectedSucker?.peerChainId)
      }
      loading={isLoading}
      onClick={handleWithdraw}
      className={shimmerClasses}
    >
      {isLoading ? 
        "Processing..." :
        "Withdraw"
      }
    </ButtonWithWallet>
  );
}
