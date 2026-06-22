import * as Sentry from "@sentry/nextjs";
import { unstable_cache } from "next/cache";
import {
  SuckerGroupDocument,
  SuckerGroupQuery,
  SuckerGroupQueryVariables,
} from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
import { JBChainId } from "juice-sdk-core";

interface FetchSuckerGroupData {
  volume: bigint;
  decimals: number;
  paymentsCount: number | null;
}

async function _fetchSuckerGroupData(
  suckerGroupId: string,
  chainId: JBChainId
): Promise<FetchSuckerGroupData | null> {
  try {
    const client = getBendystrawClient(chainId);
    const result = await client.request<
      SuckerGroupQuery,
      SuckerGroupQueryVariables
    >(SuckerGroupDocument, { id: suckerGroupId });

    const volume = result.suckerGroup?.volume;
    const decimals = result.suckerGroup?.projects?.items[0].decimals ?? 18;
    if (!volume) throw new Error("Failed to fetch volume for suckers");

    return {
      volume: volume as bigint,
      decimals: decimals,
      paymentsCount: result.suckerGroup?.paymentsCount ?? null,
    };
  } catch (err) {
    Sentry.captureException(err);
    console.error("Failed to fetch SuckerGroup:", err);
    return null;
  }
}


export const fetchSuckerGroupData = unstable_cache(
  _fetchSuckerGroupData,
  ["sucker-group-data"],
  {
    revalidate: 900,        // revalidate every 15 mins
    tags: ["sucker-group"], // allow for on-demand revalidation
  }
);
