import { MAX_RULESET_COUNT } from "@/app/constants";
import {
  AutoIssueEventsDocument,
  StoreAutoIssuanceAmountEventsDocument,
} from "@/generated/graphql";
import { JBChainId, JBCoreContracts, jbRulesetsAbi } from "juice-sdk-core";
import {
  useBendystrawQuery,
  useJBChainId,
  useJBContractContext,
} from "juice-sdk-react";
import { useMemo } from "react";
import { useReadContract } from "wagmi";

export function useAutoIssuances(passedChainId?: JBChainId) {
  const { projectId, contractAddress, version } = useJBContractContext();

  const chainIdCtx = useJBChainId();
  const chainId = passedChainId ? passedChainId : chainIdCtx;

  const { data: autoIssuancesData } = useBendystrawQuery(
    StoreAutoIssuanceAmountEventsDocument,
    {
      where: { projectId: Number(projectId), chainId, version },
    }
  );

  const { data: autoIssueEventsQuery } = useBendystrawQuery(
    AutoIssueEventsDocument,
    {
      where: { projectId: Number(projectId), chainId, version },
    }
  );

  const { data: rulesets } = useReadContract({
    abi: jbRulesetsAbi,
    functionName: "allOf",
    address: contractAddress(JBCoreContracts.JBRulesets),
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
  });

  const autoIssuances = useMemo(() => {
    return autoIssuancesData?.storeAutoIssuanceAmountEvents.items.map(
      (autoIssuance) => {
        const rulesetIndex =
          rulesets?.findIndex((r) => String(r.id) === autoIssuance.stageId) ||
          0;

        const distributed = autoIssueEventsQuery?.autoIssueEvents.items.find(
          (event) => {
            return (
              event.stageId === autoIssuance.stageId &&
              event.beneficiary === autoIssuance.beneficiary &&
              event.count === autoIssuance.count
            );
          }
        );

        let distributedTxn: string | undefined = undefined;
        if (distributed) {
          distributedTxn = distributed.id.split("-")[1];
        }
        return {
          ...autoIssuance,
          startsAt: rulesets?.[rulesetIndex]?.start,
          stage: (rulesets?.length || 0) - rulesetIndex, // review - https://github.com/rev-net/revnet-app/commit/a8f6262a0af97a38d67f1fd52e0f17de982b51cc
          distributed: distributed !== undefined,
          distributedTxn,
        };
      }
    );
  }, [autoIssuancesData, rulesets, autoIssueEventsQuery]);
  return autoIssuances;
}
