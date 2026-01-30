"use client"

import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { useFetchProjectRulesets } from "@/hooks/useFetchProjectRulesets";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { JB_CHAINS, jbControllerAbi, JBCoreContracts, jbSplitsAbi, SuckerPair } from "juice-sdk-core";
import { useJBChainId, useJBContractContext, useJBTokenContext, useSuckers } from "juice-sdk-react"
import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";
import { formatUnits } from "viem";
import { formatNumber, formatTokenSymbol } from "@/lib/utils";
import { AutoIssuanceTable } from "./AutoIssuanceTable";
import { DistributeReservedTokensButton } from "./DistributeReservedTokensButton";

export function SplitSection() {
  const [selectedSucker, setSelectedSucker] = useState<SuckerPair>();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const { projectId, contractAddress } = useJBContractContext();
  const { token } = useJBTokenContext();
  const chainId = useJBChainId();
  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;

  const ruleset = useRevnetDataStore(state => state.ruleset);
  const { suckerPairsWithRulesets, isLoading: isLoadingRuleSets } = useFetchProjectRulesets(suckers);
  const selectedSuckerRulesets = suckerPairsWithRulesets?.find(s => s.peerChainId === selectedSucker?.peerChainId)?.rulesets;
  
  const nextStageIdx = Math.max(
    selectedSuckerRulesets?.findIndex(
      (stage) => stage.start > Date.now() / 1000
    ) ?? -1,
    1 // lower bound should be 1 (the minimum 'next stage' is 1)
  );
  const currentStageIdx = nextStageIdx - 1;
  const splitLimit = selectedSuckerRulesets?.[selectedStageIdx].metadata.reservedPercent.formatPercentage();


  useEffect(() => {
    if (suckers) {
      setSelectedSucker(suckers[0]);
    };
  }, [suckers]);

  const { data: reservedTokenSplits, isLoading: isLoadingSplits } =
    useReadContract({
      chainId: selectedSucker?.peerChainId,
      abi: jbSplitsAbi,
      address: contractAddress(
        JBCoreContracts.JBSplits,
        selectedSucker?.peerChainId
      ),
      functionName: "splitsOf",
      args:
        ruleset &&
        selectedSucker &&
        selectedSuckerRulesets &&
        suckerPairsWithRulesets &&
        suckerPairsWithRulesets?.length > 0
          ? [
              BigInt(selectedSucker?.projectId || projectId),
              BigInt(selectedSuckerRulesets[selectedStageIdx].id || 0),
              RESERVED_TOKEN_SPLIT_GROUP_ID,
            ]
          : undefined,
    });

  const { data: pendingReserveTokenBalance } = useReadContract({
    abi: jbControllerAbi,
    functionName: "pendingReservedTokenBalanceOf",
    chainId: selectedSucker?.peerChainId,
    address: selectedSucker?.peerChainId
      ? contractAddress(
          JBCoreContracts.JBController,
          selectedSucker.peerChainId
        )
      : undefined,
    args: ruleset ? [projectId] : undefined,
  });
  

  return (
    <div className="bg-grey-450 rounded-2xl p-[12px]">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center flex-wrap">
          {selectedSuckerRulesets ?
          selectedSuckerRulesets?.map((ruleset, index) => (
            <Button 
              onClick={() => setSelectedStageIdx(index)}
              variant={"bottomline"}
              className={`${selectedStageIdx !== index && "text-muted-foreground border-transparent"}`}
              key={ruleset.id}
            >
              Stage {index + 1}
              {currentStageIdx === index && 
                <span className="ml-1.5 h-2 w-2 rounded-full bg-primary" />
              }
            </Button>
          )) : (
            <div className="flex items-center flex-wrap">
              <Button 
                variant={"bottomline"}
                className="w-[84px] flex justify-center items-center"
                disabled
              >
                <div className="activeSkeleton h-[22px] w-full rounded-sm" />
              </Button>
              <Button 
              variant={"bottomline"}
              className="w-[84px] flex justify-center items-center border-transparent"
              disabled
              >
                <div className="activeSkeleton h-[22px] w-full rounded-sm" />
              </Button>
              <Button 
                variant={"bottomline"}
                className="w-[84px] flex justify-center items-center border-transparent"
                disabled
              >
                <div className="activeSkeleton h-[22px] w-full rounded-sm" />
              </Button>
            </div>
          )}
        </div>

        <div>
          <Select
            onValueChange={(value) => setSelectedSucker(suckers && suckers[parseInt(value)])}
            value={
              selectedSucker
                ? String(suckers?.indexOf(selectedSucker))
                : undefined
            }
            disabled={!selectedSucker}
          >
            <SelectTrigger 
              className="h-fit p-1.5 flex items-center gap-2 background-color rounded-full border-none"
            >
              {selectedSucker ? (
                <div className="flex items-center gap-2">
                  <ChainLogo 
                    chainId={selectedSucker.peerChainId}
                    height={24}
                    width={24}
                  />
                  <span>{JB_CHAINS[selectedSucker.peerChainId].name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ChainLogo 
                    chainId={chainId!}
                    height={24}
                    width={24}
                  />
                  <span>{JB_CHAINS[chainId!].name}</span>
                </div>
              )}
            </SelectTrigger>
            <SelectContent>
              {suckers?.map((s, index) => (
                <SelectItem
                  key={s.peerChainId}
                  value={String(index)}
                  className="flex items-center gap-1"
                >
                  <div className="flex items-center gap-2">
                    <ChainLogo chainId={s.peerChainId} />
                    <span>{JB_CHAINS[s.peerChainId].name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="text-sm">
        <div className="grid grid-cols-[3.5fr_3fr_3fr] my-2 gap-1 sm:gap-0">
          <p>Account</p>
          <p>Percentage</p>
          <p>Pending Splits</p>
        </div>
        <div className="background-color rounded-2xl p-3">
          {reservedTokenSplits ? 
          reservedTokenSplits.length > 0 ?
          reservedTokenSplits.map(split => (
            <div key={split.beneficiary} className="grid grid-cols-[3.5fr_3fr_3fr] items-center py-3 border-b border-grey-450 text-sm gap-1 sm:gap-0">
              <EthereumAddress 
                address={split.beneficiary} 
                chain={
                  selectedSucker?.peerChainId
                  ? JB_CHAINS[selectedSucker.peerChainId].chain
                  : undefined
                }
                className="w-fit"
                short withEnsName 
              />

              <p>
                {formatNumber(
                  formatUnits(
                    BigInt((split.percent * Number(splitLimit)) / 100),
                    7
                  )
                )}
                %
                <span className="text-muted-foreground lg:inline hidden">
                  {"  "}({formatUnits(BigInt(split.percent), 7)}% of limit)
                </span>
              </p>
              
              <p>
                {pendingReserveTokenBalance ||
                  pendingReserveTokenBalance === 0n
                    ? `
                    ${formatNumber(
                      formatUnits(
                      (pendingReserveTokenBalance *
                        BigInt(split.percent)) /
                        BigInt(10 ** 9),
                      18
                    ))}
                    ${formatTokenSymbol(token.data?.symbol)}
                  `
                    : "--"}
              </p>
            </div>
          )) : (
            <div className="flex justify-center items-center h-[45px]">
              <p className="text-muted-foreground text-sm">
                No Splits Set
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-[4fr_3fr_3fr] py-3 border-b border-grey-450 text-sm opacity-40">
            <div className="activeSkeleton h-[22px] w-[44px] sm:w-[112px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[32px] sm:w-[64px] rounded-sm" />
            <div className="activeSkeleton h-[22px] w-[32px] sm:w-[64px] rounded-sm" />
          </div>
        )}
        </div>
      </div>

      <DistributeReservedTokensButton reservedTokenSplits={reservedTokenSplits} pendingReserveTokenBalance={pendingReserveTokenBalance} selectedSucker={selectedSucker} />

      <AutoIssuanceTable selectedSucker={selectedSucker} />
    </div>
  )
};