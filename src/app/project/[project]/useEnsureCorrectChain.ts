import { useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useData } from "./DataProvider";

export function useSwitchToCorrectChain() {
  const { analyticsData } = useData();
  const nativeTokenChainId = analyticsData?.tokenData?.selectedToken?.chain_id;

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

/*import { useEffect } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useData } from "./DataProvider";


export function useEnsureCorrectChain(enabled: boolean = true) {
  const { analyticsData } = useData();
  const nativeTokenChainId = analyticsData?.tokenData?.selectedToken?.chain_id;

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();

  useEffect(() => {
    if (
      !enabled || 
      !nativeTokenChainId || 
      !isConnected || 
      !chainId ||  
      chainId === nativeTokenChainId
    ) return;

    handleSwitchChain();
  }, [nativeTokenChainId]);

  const handleSwitchChain = () => {
    if (!nativeTokenChainId) return;
    try {
      switchChain({ chainId: nativeTokenChainId });
    } catch (err) {
      console.error("Failed to switch chain", err);
    }
  }

  return { handleSwitchChain, isSwitchingChain };
}*/
