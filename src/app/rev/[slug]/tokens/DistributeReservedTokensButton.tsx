"use client"
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { useToast } from "@/components/ui/use-toast";
import { jbControllerAbi, SuckerPair } from "juice-sdk-core";
import { useJBContractContext } from "juice-sdk-react";
import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface ReservedTokenSplit {
  percent: number;
  projectId: bigint;
  beneficiary: `0x${string}`;
  preferAddToBalance: boolean;
  lockedUntil: number;
  hook: `0x${string}`;
};

export function DistributeReservedTokensButton({ 
  reservedTokenSplits,
  pendingReserveTokenBalance,
  selectedSucker
}: { 
  reservedTokenSplits: readonly ReservedTokenSplit[] | undefined;
  pendingReserveTokenBalance: bigint | undefined;
  selectedSucker: SuckerPair | undefined;
}) {
  const [isPending, setIsPending] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const { contracts: { controller } } = useJBContractContext();

  const { address } = useAccount();  
  const { writeContractAsync } = useWriteContract();
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
  const { toast } = useToast();

  const selectedChain = selectedSucker?.peerChainId;
  const selectedProjectId = selectedSucker?.projectId;

  const mappedBeneficiaries = reservedTokenSplits?.map(s => s.beneficiary);
  const userIsBeneficiary = mappedBeneficiaries?.some(s => s.toLowerCase() === address?.toLocaleLowerCase()) ?? false;

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Successfully Distributed",
        description: "Successfully distributed reserved tokens."
      });
    } else if (isError) {
      toast({
        title: "Failed To Distribute",
        description: "Couldn't distribute reserved tokens."
      });
    }
  }, [isLoading, isSuccess]);

  const distributeSplits = async () => {
    try {
      if (!controller.data || !selectedChain || !selectedProjectId) return;
      setIsPending(true);

      const hash = await writeContractAsync({
        abi: jbControllerAbi,
        functionName: "sendReservedTokensToSplitsOf",
        chainId: selectedChain,
        address: controller.data,
        args: [selectedProjectId],
      });

      setHash(hash);

    } catch (err) {
      console.log(err);
    } finally {
      setIsPending(false);
    }
  };

  if (userIsBeneficiary) {
    return (
      <ButtonWithWallet
        variant={"accent"}
        onClick={distributeSplits}
        loading={isPending || isLoading}
        targetChainId={selectedChain}
        disabled={pendingReserveTokenBalance === 0n}
        className="mt-3"
      >
        Distribute Pending Splits
      </ButtonWithWallet>
    )
  }
}