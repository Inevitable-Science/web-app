import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { jbContractAddress, jbMultiTerminalAbi, JB_TOKEN_DECIMALS, NATIVE_TOKEN } from "@bananapus/nana-sdk-core";
import {
  JBChainId,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "@bananapus/nana-sdk-react";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { primaryPayButtonClass } from "../payTab/PayActionButton";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useTransactionCardStore } from "../TransactionCardStore";


export function WithdrawActionButton({
  minTokensReturned,
  disabled,
}: {
  minTokensReturned: bigint | undefined;
  disabled?: boolean;
}) {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const withdrawAmountString = useTransactionCardStore(
    (state) => state.withdrawAmount
  );
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useJBTokenContext();

  const publicClient = usePublicClient();
  const { address, isConnected, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();

  // Token to reclaim on the selected chain
  const baseToken = useProjectBaseToken();
  const receiveTokenAddress = baseToken.tokenMap[selectedSucker.peerChainId].token;

  const {  data: balances } = useSuckersUserTokenBalance();
  const tokenBalance =
    balances?.find((token) => token.chainId === selectedSucker.peerChainId)
      ?.balance?.value ?? 0n;


  const projectTokenDecimals = token?.data?.decimals || JB_TOKEN_DECIMALS;
  const withdrawAmount = parseUnits(withdrawAmountString, projectTokenDecimals);
  const insufficientFunds = withdrawAmount > tokenBalance;

  const handleWithdraw = async () => {
    if (
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
      ] as const;

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

      const txResult = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (txResult.status === "reverted") {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Transaction reverted",
        });
        return;
      }

      toast({
        title: "Withdraw Successful",
        description: "You Successfully Withdrew Your Tokens",
      });

    } catch (err) {
      // only log error here, usually error gets 
      // triggered by rejecting tx
      console.error(err);
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
