"use client"
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useToast } from "@/components/ui/use-toast";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { formatDate, formatNumber } from "@/lib/utils";
import { formatUnits, JB_CHAINS, JBChainId, revDeployerAbi, RevnetCoreContracts, SuckerPair } from "juice-sdk-core";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useState } from "react";
import { Address } from "viem";
import { useAccount, useChainId, useSwitchChain, useWriteContract } from "wagmi";

export function AutoIssuanceTable({ selectedSucker }: { selectedSucker: SuckerPair | undefined }) {
  const [isPending, setIsPending] = useState(false);
  const suckerChainId = selectedSucker?.peerChainId;
  const autoIssuance = useAutoIssuances(suckerChainId);
  const chainId = useJBChainId();

  const { toast } = useToast();
  const { contractAddress } = useJBContractContext();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const { address: userAddress } = useAccount();
  const userChainId = useChainId();

  const userIsBeneficiary = autoIssuance?.some(i => i.beneficiary.toLowerCase() === userAddress?.toLowerCase()) ?? false;


  const distributeSplit = async (stageId: bigint, beneficiary: Address) => {
    try {
      if (!userAddress || !suckerChainId) return;
      setIsPending(true);

      if (userChainId !== suckerChainId) {
        await switchChainAsync({ chainId: suckerChainId });
      };

      await writeContractAsync({
        abi: revDeployerAbi,
        functionName: "autoIssueFor",
        address: contractAddress(RevnetCoreContracts.REVDeployer),
        chainId: suckerChainId,
        args: [
          BigInt(selectedSucker.projectId),
          stageId,
          beneficiary,
        ],
      });
      toast({
        title: "Successfully Distributed",
        description: "Successfully distributed auto issuances."
      });
    } catch (err) {
      console.log(err);
      toast({
        title: "Failed To Distribute",
        description: "Couldn't distribute auto issuance."
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <h3 className="text-lg mt-4">
        Auto Issuance
      </h3>
      <div className="grid grid-cols-[1fr_3fr_2fr_2fr_2fr] my-2 text-sm">
        <p>Stage</p>
        <p>Beneficiary</p>
        <p>Token Amount</p>
        <p>Unlocks</p>
        <p>Status</p>
      </div>
      <div className="background-color rounded p-3">
        {!autoIssuance ? (
          <div className="grid grid-cols-[1fr_3fr_2fr_2fr_2fr] py-3 border-b border-color text-sm opacity-40">
            <div className="activeSkeleton h-[22px] w-[22px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[94px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[64px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[64px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[64px] rounded-sm" />
          </div>
        ) : autoIssuance.length > 0 ?
        autoIssuance?.map(issuance => {
          const releaseDateMs = (issuance.startsAt ?? 0) * 1000;
          const releaseDate = new Date(releaseDateMs);
          const canRelease = (new Date().getTime() / 1000) > Number(issuance.startsAt);

          return (
            <div key={issuance.id} className="grid grid-cols-[1fr_3fr_2fr_2fr_2fr] py-3 border-b border-color text-sm">
              <p>{issuance.stage}</p>
              <EthereumAddress
                address={issuance.beneficiary as Address}
                chain={JB_CHAINS[chainId as JBChainId].chain} 
                className="w-fit"
                withEnsName short
              />
              <p>
                {formatNumber(
                  Number(
                    formatUnits(issuance.count, 18)
                  )
                )} 
              </p>
              <p>
                {formatDate(releaseDate, true)}
              </p>
              {issuance.distributed ? (
                <p className="rounded-full h-fit w-fit bg-gunmetal px-2 py-1 text-xs uppercase">
                  Distributed
                </p>
              ) : canRelease ?
                !userIsBeneficiary ? (
                  <ButtonWithWallet
                    disabled={!canRelease}
                    loading={isPending}
                    targetChainId={suckerChainId}
                    onClick={() => distributeSplit(issuance.stageId, issuance.beneficiary as Address)}
                  >
                    Distribute
                  </ButtonWithWallet>
                ) : (
                  <p className="rounded-full h-fit w-fit bg-gunmetal px-2 py-1 text-xs uppercase">
                    Unlocked
                  </p>
                ) : (
                  <p className="rounded-full h-fit w-fit bg-gunmetal px-2 py-1 text-xs uppercase">
                    Locked
                  </p>
                )}
              </div>
            )
          }
        ) : (
          <div className="flex justify-center items-center h-[49px]">
            <p className="text-muted-foreground text-sm">
              No Auto Issuances Set
            </p>
          </div>
        )}
      </div>
    </>
  )
}