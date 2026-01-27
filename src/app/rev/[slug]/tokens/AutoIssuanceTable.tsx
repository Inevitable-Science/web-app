"use client"
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useToast } from "@/components/ui/use-toast";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { formatDate, formatNumber } from "@/lib/utils";
import { formatUnits, JB_CHAINS, JBChainId, revDeployerAbi, RevnetCoreContracts, SuckerPair } from "juice-sdk-core";
import { useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export function AutoIssuanceTable({ selectedSucker }: { selectedSucker: SuckerPair | undefined }) {
  const [isPending, setIsPending] = useState(false);
  const [hash, setHash] = useState<`0x${string}` | undefined>();

  const suckerChainId = selectedSucker?.peerChainId;
  const autoIssuance = useAutoIssuances(suckerChainId);
  const chainId = useJBChainId();

  const { toast } = useToast();
  const { contractAddress } = useJBContractContext();
  const { writeContractAsync } = useWriteContract();
  const { isLoading, isSuccess, isError } = useWaitForTransactionReceipt({ hash });
  const { address: userAddress } = useAccount();

  const userIsBeneficiary = autoIssuance?.some(i => i.beneficiary.toLowerCase() === userAddress?.toLowerCase()) ?? false;

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Successfully Distributed",
        description: "Successfully distributed auto issuances."
      });
    } else if (isError) {
      toast({
        title: "Failed To Distribute",
        description: "Couldn't distribute auto issuance."
      });
    }
  }, [isLoading, isSuccess]);

  const distributeSplit = async (stageId: bigint, beneficiary: Address) => {
    try {
      if (!userAddress || !suckerChainId) return;
      setIsPending(true);

      const hash = await writeContractAsync({
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
      
      setHash(hash);
    } catch (err) {
      console.log(err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <h3 className="text-lg mt-4">
        Auto Issuance
      </h3>
      <div className="gridContainer my-2 text-sm gap-1 sm:gap-0">
        <p>Stage</p>
        <p>Beneficiary</p>
        <p className="tokenAmountItem">Token Amount</p>
        <p>Unlocks</p>
        <p className="statusItem">Status</p>
      </div>
      <div className="background-color rounded p-3">
        {!autoIssuance ? (
          <div className="gridContainer py-3 border-b border-color text-sm opacity-40">
            <div className="activeSkeleton h-[22px] w-[22px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[64px] sm:w-[94px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[64px] rounded-sm tokenAmountItem" />
            <div className="activeSkeleton h-[22px] w-[64px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[64px] rounded-sm statusItem" />
          </div>
        ) : autoIssuance.length > 0 ?
        autoIssuance?.map(issuance => {
          const releaseDateMs = (issuance.startsAt ?? 0) * 1000;
          const releaseDate = new Date(releaseDateMs);
          const canRelease = (new Date().getTime() / 1000) > Number(issuance.startsAt);

          return (
            <div key={issuance.id} className="gridContainer items-center py-3 border-b border-color text-sm">
              <p>{issuance.stage}</p>
              <EthereumAddress
                address={issuance.beneficiary as Address}
                chain={JB_CHAINS[chainId as JBChainId].chain} 
                className="w-fit"
                withEnsName short
              />
              <p className="tokenAmountItem">
                {formatNumber(
                  Number(
                    formatUnits(issuance.count, 18)
                  )
                )} 
              </p>
              <p>
                {formatDate(releaseDate, true)}
              </p>

              <div className="statusItem">
                {issuance.distributed ? (
                  <p className="rounded-full h-fit w-fit bg-gunmetal px-2 py-1 text-xs uppercase">
                    Distributed
                  </p>
                ) : canRelease ?
                  userIsBeneficiary ? (
                    <ButtonWithWallet
                      loading={isPending || isLoading}
                      targetChainId={suckerChainId}
                      onClick={() => distributeSplit(issuance.stageId, issuance.beneficiary as Address)}
                      variant={"accent"}
                      className="h-[32px]"
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

      <style>{`
      .gridContainer {
        display: grid;
        grid-template-columns: 1fr 2.5fr 2fr 2fr 2fr;
      }
      
      @media (min-width:1024px) and (max-width:1140px) {
        .statusItem {
          display: none;
        }

        .gridContainer {
          display: grid;
          grid-template-columns: 1fr 2.5fr 2fr 2fr;
        }
      }

      @media (min-width:768px) and (max-width:930px) {
        .statusItem {
          display: none;
        }

        .gridContainer {
          display: grid;
          grid-template-columns: 1fr 2.5fr 2fr 2fr;
        }
      }

      @media (max-width:590px) {
        .statusItem {
          display: none;
        }

        .gridContainer {
          display: grid;
          grid-template-columns: 1fr 2.5fr 2fr 2fr;
        }
      }

      @media (max-width:470px) {
        .tokenAmountItem {
          display: none;
        }

        .gridContainer {
          display: grid;
          grid-template-columns: 1fr 2.5fr 2fr;
        }
      }
      `}</style>
    </>
  )
}