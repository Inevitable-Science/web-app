import { ProjectAccountingContextDocument } from "@/generated/graphql";
import { useJBChainId, useJBContractContext, useBendystrawQuery } from "juice-sdk-react";

export function useProjectAccountingContext() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();

  return useBendystrawQuery(ProjectAccountingContextDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    version: 4 // TODO dynamic version
  });
}