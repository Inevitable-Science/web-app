import { useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useLegacyProjectStore } from "./DataProvider";

export function useSwitchToCorrectChain() {
  const tokenAnalytics = useLegacyProjectStore((state) => state.tokenAnalytics);
  const nativeTokenChainId = tokenAnalytics?.selectedToken?.chain_id;

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  useEffect(() => {
    if (
      !nativeTokenChainId ||
      !isConnected ||
      !chainId ||
      chainId === nativeTokenChainId
    )
      return;

    handleSwitchChain();
  }, [nativeTokenChainId]);

  const handleSwitchChain = () => {
    if (!nativeTokenChainId) return;
    try {
      switchChain({ chainId: nativeTokenChainId });
    } catch (err) {
      console.error("Failed to switch chain", err);
    }
  };

  return { handleSwitchChain, isSwitchingChain };
}
