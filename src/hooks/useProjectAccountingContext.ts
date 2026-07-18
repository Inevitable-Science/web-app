import { ProjectAccountingContextDocument } from "@/generated/graphql";
import {
  useJBChainId,
  useJBContractContext,
  useBendystrawQuery,
} from "@bananapus/nana-sdk-react";

export function useProjectAccountingContext() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  return useBendystrawQuery(
    ProjectAccountingContextDocument,
    {
      chainId: Number(chainId),
      projectId: Number(projectId),
      version: Number(version),
    },
    {
      enabled: !!chainId && !!projectId && !!version,
    }
  );
}
