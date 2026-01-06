import { useEffect, useRef } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useLegacyProjectStore } from "../../../store/LegacyProjectContext";

export function useSwitchToCorrectChain() {
  const tokenAnalytics = useLegacyProjectStore((state) => state.tokenAnalytics);
  const nativeTokenChainId = tokenAnalytics?.selectedToken?.chain_id;

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const hasSwitchedRef = useRef(false);


  useEffect(() => {
    if (
      hasSwitchedRef.current ||
      !nativeTokenChainId ||
      !isConnected ||
      !chainId
    ) return;

    if (chainId === nativeTokenChainId) {
      hasSwitchedRef.current = true;
      return;
    }

    handleSwitchChain();
  }, [
    nativeTokenChainId,
    isConnected,
    chainId,
    switchChain,
  ]);

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
