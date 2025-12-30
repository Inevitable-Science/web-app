"use client";
import { MAX_RULESET_COUNT } from "@/app/constants";
import { getViemPublicClient, ViemChainIdType } from "@/lib/wagmiConfig";
import {
  getJBContractAddress,
  JBChainId,
  JBCoreContracts,
  jbRulesetsAbi,
  JBVersion,
  WeightCutPercent,
} from "juice-sdk-core";
import { getContract } from "viem";

export interface Ruleset {
  id: number;
  start: number;
  duration: number;
  weight: string;
  weightCutPercent: number;
}

export const getRulesets = async (
  projectId: string,
  chainId: ViemChainIdType,
  version: JBVersion
): Promise<Ruleset[]> => {
  const client = getViemPublicClient(chainId);
  const contract = getContract({
    address: getJBContractAddress(JBCoreContracts.JBRulesets, version, chainId),
    abi: jbRulesetsAbi,
    client,
  });

  const data = await contract.read.allOf([
    BigInt(projectId),
    0n,
    BigInt(MAX_RULESET_COUNT),
  ]);

  return data
    .map((r) => ({
      id: r.id,
      start: r.start,
      duration: r.duration,
      weight: r.weight.toString(),
      weightCutPercent: new WeightCutPercent(r.weightCutPercent).toFloat(),
    }))
    .sort((a, b) => a.start - b.start);
};
