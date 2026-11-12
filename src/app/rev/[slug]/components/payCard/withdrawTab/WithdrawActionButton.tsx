import { useState } from "react";
import { Address } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { jbContractAddress, jbMultiTerminalAbi, NATIVE_TOKEN } from "@bananapus/nana-sdk-core";
import { JBChainId, useJBContractContext } from "@bananapus/nana-sdk-react";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { primaryPayButtonClass } from "../payTab/PayActionButton";


export function WithdrawActionButton({
  withdrawAmount,
  tokenBalance,
  minTokensReturned,
  receiveTokenAddress,
  isTokensReturnedLoading,
  disabled,
}: {
  withdrawAmount: bigint;
  tokenBalance: bigint;
  minTokensReturned: bigint | undefined;
  receiveTokenAddress: Address;
  isTokensReturnedLoading: boolean;
  disabled?: boolean;
}) {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const [isLoading, setIsLoading] = useState(false);

  const {
    contracts: { primaryNativeTerminal },
  } = useJBContractContext();

  const publicClient = usePublicClient();
  const { address, isConnected, chainId } = useAccount();
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

      // v6 args
      const args = [
      address,                      // holder
      selectedSucker.projectId,     // projectId
      withdrawAmount,               // cashOutCount
      // NATIVE_TOKEN,                 // token to reclaim
      receiveTokenAddress,          // token to reclaim
      //minTokensReturned,            // min tokens reclaimed
      0n,
      address,                      // beneficiary
      '0x0',                        // metadata
    ] as const

      const txHash = await writeContractAsync({
        abi: jbMultiTerminalAbi,
        functionName: "cashOutTokensOf",
        chainId: selectedSucker?.peerChainId,
        address: jbContractAddress[6].JBMultiTerminal[1], // primaryNativeTerminal.data,
        args
        /*args: [
          address, // holder
          selectedSucker.projectId, // project id (use the correct project ID for the selected chain)
          withdrawAmount ?? 0n, // cash out count
          receiveTokenAddress, // token to reclaim (what you want to receive)
          minTokensReturned, // min tokens reclaimed
          address, // beneficiary
          "0x" // metadata changed in v6 update idk y.. v6 INTEGRATION //DEFAULT_METADATA, - old import from core sdk - dep // metadata,
        ],*/
      });

      const tx = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (tx.status !== "success") throw new Error();

      toast({
        title: "Withdraw Successful",
        description: "You Successfully Withdrew Your Tokens.",
      });
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Withdraw Failed",
        description: "Couldn't Withdraw Your Tokens.",
      });
    } finally {
      setIsLoading(false);
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

  if (insufficientFunds)
    return (
      <Button className={primaryPayButtonClass} disabled>
        Insufficient Funds
      </Button>
    );

  return (
    <ButtonWithWallet
      targetChainId={selectedSucker?.peerChainId as JBChainId | undefined}
      disabled={
        disabled ||
        isTokensReturnedLoading ||
        !minTokensReturned ||
        (!withdrawAmount && chainId === selectedSucker?.peerChainId)
      }
      loading={isLoading}
      onClick={handleWithdraw}
      className={`shimmer ${primaryPayButtonClass}`}
    >
      {isLoading ? "Processing..." : "Withdraw"}
    </ButtonWithWallet>
  );
}
