import { useState } from "react";
import { ConnectKitButton } from "connectkit";
import { parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { jbContractAddress, jbMultiTerminalAbi, JB_TOKEN_DECIMALS } from "@bananapus/nana-sdk-core";
import {
  JBChainId,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "@bananapus/nana-sdk-react";
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { formatSeconds } from "@/lib/utils";
import { useCashOutDelay } from "@/hooks/useCashOutDelay";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { primaryPayButtonClass } from "../payTab/PayActionButton";
import { useTransactionCardStore } from "../TransactionCardStore";


export function WithdrawActionButton({
  minTokensReturned,
  disabled,
}: {
  minTokensReturned: bigint | undefined;
  disabled?: boolean;
}) {
  const { 
    peerChainId: activeChainId,
    projectId: activeProjectId
  } = useRevnetDataStore((state) => state.selectedSucker);
  const withdrawAmountString = useTransactionCardStore(
    (state) => state.withdrawAmount
  );
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useJBTokenContext();
  const { version } = useJBContractContext();
  const { checkLockNow } = useCashOutDelay();

  // Token to reclaim on the selected chain
  const baseToken = useProjectBaseToken();
  const receiveTokenAddress = baseToken.tokenMap[activeChainId].token;

  const {  data: balances } = useSuckersUserTokenBalance();
  const tokenBalance =
    balances?.find((token) => token.chainId === activeChainId)
      ?.balance?.value ?? 0n;

  const publicClient = usePublicClient({ chainId: activeChainId });
  const { address, isConnected, chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();


  const projectTokenDecimals = token?.data?.decimals || JB_TOKEN_DECIMALS;
  const withdrawAmount = parseUnits(withdrawAmountString, projectTokenDecimals);
  const insufficientFunds = withdrawAmount > tokenBalance;

  const handleWithdraw = async () => {
    if (
      !address ||
      !publicClient ||
      !minTokensReturned ||
      !withdrawAmount ||
      !receiveTokenAddress ||
      insufficientFunds
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

      // Re-read the lock onchain right before signing.
      const { isLocked, secondsUntilUnlock } = await checkLockNow();

      if (isLocked) {
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Cashouts Unavailable",
          description: `Cashouts unlock in ${formatSeconds(secondsUntilUnlock, 2, true)}`,
        });
        return;
      }

      const args = [
        address,                      // holder
        activeProjectId,              // projectId
        withdrawAmount,               // cashOutCount
        receiveTokenAddress,          // token to reclaim
        minTokensReturned,            // min tokens reclaimed
        address,                      // beneficiary
        '0x0',                        // metadata
      ] as const;

      const txHash = await writeContractAsync({
        abi: jbMultiTerminalAbi,
        functionName: "cashOutTokensOf",
        chainId: activeChainId,
        address: jbContractAddress[version].JBMultiTerminal[activeChainId],
        args
      });

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      if (txReceipt.status === "reverted") {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Transaction reverted",
        });
        return;
      };

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
      targetChainId={activeChainId as JBChainId | undefined}
      disabled={
        disabled ||
        !minTokensReturned ||
        (!withdrawAmount && chainId === activeChainId)
      }
      loading={isLoading}
      onClick={handleWithdraw}
      className={`shimmer ${primaryPayButtonClass}`}
    >
      {isLoading ? "Processing..." : "Withdraw"}
    </ButtonWithWallet>
  );
}
