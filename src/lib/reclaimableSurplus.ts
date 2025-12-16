import { type Project } from "@/generated/graphql";
import { FixedInt } from "fpnum";
import {
  getProjectTerminalStore,
  JB_TOKEN_DECIMALS,
  JBChainId,
  jbTerminalStoreAbi,
  JBVersion,
  NATIVE_TOKEN_DECIMALS,
  ETH_CURRENCY_ID,
  USD_CURRENCY_ID
} from "juice-sdk-core";
import { getContract, parseUnits } from "viem";
import { applyNanaFee, applyRevFee } from "./feeHelpers";
import { getViemPublicClient } from "./wagmiConfig";


export function toBaseCurrencyId(currency: number | string, version: JBVersion) {
  if (Number(currency) === 1 || Number(currency) === 61166) return ETH_CURRENCY_ID;
  return USD_CURRENCY_ID(version);
}


export async function getReclaimableSurplus(
  chainId: Exclude<JBChainId, 11155111 | 11155420 | 421614 | 84532>,
  projectId: number,
  tokenAmountWei: bigint,
  version: JBVersion,
  decimals: number,
  currencyId: 1 | 2 | 3,
) {
  try {
    const contract = getContract({
      address: getProjectTerminalStore(chainId, version),
      abi: jbTerminalStoreAbi,
      client: getViemPublicClient(chainId),
    });

    const userReclaimable = await contract.read.currentReclaimableSurplusOf([
      BigInt(projectId),
      applyRevFee(tokenAmountWei),
      [],
      [],
      BigInt(decimals),
      BigInt(currencyId),
    ]);

    return applyNanaFee(userReclaimable).toString();
  } catch (error) {
    console.debug({ chainId, projectId, tokenAmountWei, version, decimals, currencyId });
    console.error(error);
    return "0";
  }
}

export async function getProjectsReclaimableSurplus(
  projects: Pick<Project, "chainId" | "projectId" | "tokenSupply" | "version" | "decimals" | "currency">[],
) {
  const result = await Promise.all(
    projects.map(async (project) => {
      const { chainId, projectId, tokenSupply, version, currency, decimals } = project;
      const currencyId = toBaseCurrencyId(currency, version as JBVersion);
      const tokenDecimals = JB_TOKEN_DECIMALS;

      const value = await getReclaimableSurplus(
        chainId as Exclude<JBChainId, 11155111 | 11155420 | 421614 | 84532>,
        projectId,
        BigInt(tokenSupply),
        version as JBVersion,
        tokenDecimals,
        currencyId,
      );

      return {
        projectId: project.projectId,
        value,
        currencyId,
        decimals: decimals || NATIVE_TOKEN_DECIMALS,
        chainId,
        version,
        tokenDecimals,
      };
    })
  );

  return result;
}

export type Surplus = Awaited<ReturnType<typeof getProjectsReclaimableSurplus>>[number];

export function getUnitValue(
  surplus: Pick<Surplus, "value" | "decimals"> | null,
  supply: { value: string; decimals: number },
) {
  if (!surplus || supply.value === "0") return 0;

  const _surplus = new FixedInt(parseUnits(surplus.value, surplus.decimals), surplus.decimals);
  const _supply = new FixedInt(parseUnits(supply.value, supply.decimals), supply.decimals);

  return _surplus.toFloat() / _supply.toFloat();
}
