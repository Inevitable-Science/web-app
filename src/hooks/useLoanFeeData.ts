import {
  getRevnetLoanContract,
  JBChainId,
  revDeployerAbi,
  revDeployerV5Abi,
  revLoansAbi,
  RevnetCoreContracts,
} from "@bananapus/nana-sdk-core";
import { useJBContractContext } from "@bananapus/nana-sdk-react";
import { useReadContract } from "wagmi";

export function useLoanFeeData(activeChainId: JBChainId) {
  const { contractAddress, version } = useJBContractContext();

  const revLoansContractAddress = getRevnetLoanContract(version, activeChainId);

  /* v6 INTEGRATION
  
  const { data: revDeployerFee } = useReadContract({
    abi: revDeployerAbi,
    functionName: "FEE",
    address: contractAddress(RevnetCoreContracts.REVDeployer),
    chainId: activeChainId ? (Number(activeChainId) as JBChainId) : undefined,
  });*/

  // Fee-related hooks. v6 moved the fixed loan fee from `REVDeployer.FEE` to
  // `REVLoans.MIN_PREPAID_FEE_PERCENT` (both 2.5%, in terms of MAX_FEE).
  const { data: revDeployerFeeV5 } = useReadContract({
    abi: revDeployerV5Abi,
    functionName: "FEE",
    address: contractAddress(RevnetCoreContracts.REVDeployer),
    chainId: activeChainId, 
    query: { enabled: version !== 6 },
  });

  const { data: minPrepaidFeePercent } = useReadContract({
    abi: revLoansAbi,
    functionName: "MIN_PREPAID_FEE_PERCENT",
    address: revLoansContractAddress,
    chainId: activeChainId,
    query: { enabled: version === 6 },
  });

  const revDeployerFee = version === 6 ? minPrepaidFeePercent : revDeployerFeeV5;

  const { data: resolvedPermissionsAddress } = useReadContract({
    abi: revDeployerAbi,
    functionName: "PERMISSIONS",
    address: contractAddress(RevnetCoreContracts.REVDeployer),
    chainId: activeChainId ? (Number(activeChainId) as JBChainId) : undefined,
  });

  const { data: revPrepaidFeePercent } = useReadContract({
    abi: revLoansAbi,
    functionName: "REV_PREPAID_FEE_PERCENT",
    address: revLoansContractAddress,
    chainId: activeChainId ? (Number(activeChainId) as JBChainId) : undefined,
  });

  return {
    revLoansContractAddress,
    revDeployerFee,
    resolvedPermissionsAddress,
    revPrepaidFeePercent,
  };
}
