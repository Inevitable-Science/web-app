import { SuckerGroupDocument, SuckerGroupQuery, SuckerGroupQueryVariables } from "@/generated/graphql";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
import { JBChainId } from "juice-sdk-core";


export async function fetchSuckerGroupVol(suckerGroupId: string, chainId: JBChainId): Promise<bigint | null> {
  try {
    const client = getBendystrawClient(chainId);
    const result = await client.request<
      SuckerGroupQuery,
      SuckerGroupQueryVariables
    >(SuckerGroupDocument, { id: suckerGroupId });

    const volume = result.suckerGroup?.volume;
    if (!volume) throw new Error("Failed to fetch volume for suckers");
    
    return result.suckerGroup?.volume;
  } catch (error) {
    console.error("Failed to fetch SuckerGroup:", error);
    return null;
  }
};
