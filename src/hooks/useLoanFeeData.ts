import { getRevnetLoanContract, JBChainId, revDeployerAbi, revLoansAbi, RevnetCoreContracts } from "juice-sdk-core";
import { useJBContractContext } from "juice-sdk-react";
import { useReadContract } from "wagmi";

export function useLoanFeeData(activeChainId: JBChainId) {
  const { contractAddress, version } = useJBContractContext();
  
  const revLoansContractAddress = getRevnetLoanContract(
    version,
    activeChainId
  );

  const { data: revDeployerFee } = useReadContract({
    abi: revDeployerAbi,
    functionName: "FEE",
    address: contractAddress(RevnetCoreContracts.REVDeployer),
    chainId: activeChainId ? (Number(activeChainId) as JBChainId) : undefined,
  });

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
    revPrepaidFeePercent
  }
};