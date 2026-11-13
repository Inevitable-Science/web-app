import { getCashOutDelay } from "@bananapus/nana-sdk-core/v6";
import { JBChainId, useJBContractContext } from "@bananapus/nana-sdk-react";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

const nowSeconds = () => BigInt(Math.floor(Date.now() / 1000));

function lockState(unlockAt: bigint | undefined) {
  const remaining = unlockAt !== undefined ? unlockAt - nowSeconds() : 0n;
  return {
    unlockAt,
    isLocked: remaining > 0n,
    /** Seconds until cash outs and loans unlock (0 when unlocked). */
    secondsUntilUnlock: remaining > 0n ? Number(remaining) : 0,
  };
}

/**
 * Reads a revnet's cash out delay (`REVOwner.cashOutDelayOf`): the unix
 * timestamp until which cash outs AND loans are locked on one chain. Only set
 * when a chain is added after the revnet's start; 0 or a past time = unlocked.
 *
 * The lock is per chain, so this defaults to the user's selected chain
 * (`selectedSucker`), not the project's home chain. v6 only.
 */
export function useCashOutDelay({
  chainId: chainIdOverride,
  projectId: projectIdOverride,
  enabled = true,
}: {
  chainId?: JBChainId;
  projectId?: bigint;
  enabled?: boolean;
} = {}) {
  const { version } = useJBContractContext();
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);

  const chainId = chainIdOverride ?? selectedSucker?.peerChainId;
  const revnetId = projectIdOverride ?? selectedSucker?.projectId;
  const publicClient = usePublicClient({ chainId });

  const canRead =
    enabled && version === 6 && !!publicClient && !!chainId && !!revnetId;

  const query = useQuery({
    queryKey: ["cashOutDelay", chainId, revnetId?.toString()],
    queryFn: () =>
      getCashOutDelay(publicClient!, {
        chainId,
        revnetId,
      }),
    enabled: canRead,
  });

  const { refetch } = query;

  /**
   * Re-reads the delay onchain. Call right before a cash out or borrow is
   * signed, since cached state may be stale. Throws if the read fails.
   */
  const checkLockNow = useCallback(async () => {
    // No delay before v6.
    if (version !== 6) return lockState(0n);
    if (!canRead) throw new Error("Can't read the cash out delay yet");
    const { data } = await refetch({ throwOnError: true });
    return lockState(data);
  }, [version, canRead, refetch]);

  return { ...query, ...lockState(query.data), checkLockNow };
}
