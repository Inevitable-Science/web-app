/**
 * Fetches a participant's balances for a set of sucker groups from bendystraw,
 * summed across all chains in each group.
 * 
 * Hook required (manually) as useBendystrawQuery requires provider init
 */

import * as Sentry from "@sentry/nextjs";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { getBendystrawClient } from "@/graphql/bendystrawClient";
import {
  SuckerGroupsParticipantDocument,
  SuckerGroupsParticipantQuery,
  SuckerGroupsParticipantQueryVariables,
} from "@/generated/graphql";

const fetchSuckersBalances = async (
  address: Address,
  suckerGroupIds: string[],
): Promise<Map<string, bigint>> => {
  const suckersBalances = new Map<string, bigint>();

  try {
    const client = getBendystrawClient(1);
    const result = await client.request<
      SuckerGroupsParticipantQuery,
      SuckerGroupsParticipantQueryVariables
    >(SuckerGroupsParticipantDocument, { suckerGroupIds, address });

    result.participants.items.forEach((item) => {
      const current = suckersBalances.get(item.suckerGroupId) ?? 0n;
      suckersBalances.set(
        item.suckerGroupId,
        current + BigInt(String(item.balance ?? 0)),
      );
    });

    return suckersBalances;
  } catch (err) {
    console.error(err);
    Sentry.captureException(err);
    throw err;
  }
};

export const useEcosystemSuckersBal = (
  address: Address | undefined,
  suckerGroupIds: string[],
  enabled = true,
) => {
  return useQuery({
    queryKey: ["ecosystem_suckers_balances", address, suckerGroupIds],
    queryFn: () => fetchSuckersBalances(address!, suckerGroupIds),
    enabled: !!address && suckerGroupIds.length > 0 && enabled,
    staleTime: 300000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
