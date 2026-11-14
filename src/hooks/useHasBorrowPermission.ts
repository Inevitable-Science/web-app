// import { HasPermissionDocument } from "@/generated/graphql";
import {
  getRevnetLoanContract,
  jbPermissionsAbi,
  JBChainId,
} from "@bananapus/nana-sdk-core";
import { REVLOANS_BURN_PERMISSION_ID } from "@bananapus/nana-sdk-core/v6";
import { /* useBendystrawQuery, */ useJBContractContext } from "@bananapus/nana-sdk-react";
import { useReadContract } from "wagmi";

/**
 * Whether `address` has granted REVLoans the BURN_TOKENS permission for
 * `projectId` on `chainId`. Reads JBPermissions onchain (not the Bendystraw
 * indexer, which lags behind). Returns undefined while loading.
 */
export function useHasBorrowPermission({
  address,
  projectId,
  chainId,
  resolvedPermissionsAddress,
  skip,
}: {
  address?: `0x${string}`;
  projectId: bigint;
  chainId?: JBChainId;
  resolvedPermissionsAddress?: `0x${string}`;
  skip?: boolean;
}) {
  const { version } = useJBContractContext();

  const operator = chainId
    ? getRevnetLoanContract(version, chainId)
    : undefined;

  const querySkip =
    skip ||
    !address ||
    !projectId ||
    !chainId ||
    !resolvedPermissionsAddress ||
    !operator;

  const { data } = useReadContract({
    abi: jbPermissionsAbi,
    address: resolvedPermissionsAddress,
    functionName: "hasPermissions",
    chainId,
    args:
      operator && address
        ? [
            operator,
            address,
            projectId,
            [BigInt(REVLOANS_BURN_PERMISSION_ID)],
            false, // includeRoot: ROOT (1) must not be granted to REVLoans
            true, // includeWildcardProjectId: grants for all projects count
          ]
        : undefined,
    query: { enabled: !querySkip },
  });

  return data;

  /*

  const { data } = useBendystrawQuery(HasPermissionDocument, {
    skip: querySkip,
    account: address as string,
    chainId: chainId as number,
    projectId: Number(projectId),
    operator: operator as string,
    version,
  });

  // REVLoans needs BURN_TOKENS (11). ROOT (1) must not be granted to it.
  return (
    data?.permissionHolder?.permissions?.includes(REVLOANS_BURN_PERMISSION_ID) ??
    undefined
  );
  */
}
