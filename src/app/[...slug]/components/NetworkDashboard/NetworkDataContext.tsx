import { createContext, useContext, ReactNode, useMemo, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import {
  useJBRulesetContext,
  useSuckers,
  useJBContractContext,
  useJBChainId,
} from 'juice-sdk-react';
import { Loader2 } from 'lucide-react';
import { SuckerPair, JBRulesetData, JBRulesetMetadata, JBProjectToken } from 'juice-sdk-core';
import { JBContractContextData } from 'juice-sdk-react';
import { useBendystrawQuery } from '@/graphql/useBendystrawQuery';
import { ProjectDocument, ProjectQuery } from '@/generated/graphql';
import { useVolumeData, DailyVolume } from '@/hooks/useVolumeData';
import { notFound } from 'next/navigation';

interface NetworkDataContextType {
  suckers: SuckerPair[];
  walletBalance: ReturnType<typeof useBalance>['data'];
  ruleset: JBRulesetData;
  rulesetMetadata: JBRulesetMetadata;
  contracts: JBContractContextData;
  project: NonNullable<ProjectQuery['project']>;
  dailyTotals: DailyVolume[];
  isRefetching: boolean; // Flag for background data fetches (e.g., on chain change)
}

const NetworkDataContext = createContext<NetworkDataContextType | undefined>(undefined);

export const NetworkDataProvider = ({ children }: { children: ReactNode }) => {
  // Foundational Hooks
  const { address } = useAccount();
  const chainId = useJBChainId();
  const { projectId, contracts: jbContracts } = useJBContractContext();

  // Primary Data Fetching Hooks
  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({ address });
  const { data: suckers, isLoading: areSuckersLoading } = useSuckers();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  // Dependent Data Fetching Hooks
  const { data: projectData, isLoading: isProjectLoading } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    skip: !chainId || !projectId,
  });
  
  // NOTE: `project` will hold the current or stale data from the query hook.
  const project = projectData?.project;

  const [loadTimestamp] = useState(() => Math.floor(Date.now() / 1000));
  const twoWeeksAgo = useMemo(() => loadTimestamp - 14 * 24 * 60 * 60, [loadTimestamp]);

  const { dailyTotals, isLoading: isVolumeLoading } = useVolumeData({
    suckerGroupId: project?.suckerGroupId,
    startTimestamp: twoWeeksAgo,
    endTimestamp: loadTimestamp,
  });

  // `isFetching` is a general flag, true whenever *any* data fetching is in progress.
  const isFetching =
    isBalanceLoading ||
    areSuckersLoading ||
    ruleset.isLoading ||
    rulesetMetadata.isLoading ||
    isProjectLoading ||
    (!!project?.suckerGroupId && isVolumeLoading);
  
  const isInitialLoading = isFetching && !project;

  // `isRefetching` is true when we are fetching again (e.g., chain changed)
  const isRefetching = isFetching && !!project;

  const value = useMemo(() => {
    return {
      suckers,
      walletBalance,
      ruleset: ruleset.data,
      rulesetMetadata: rulesetMetadata.data,
      contracts: { projectId, contracts: jbContracts },
      project,
      dailyTotals,
      isRefetching,
    };
  }, [
    suckers,
    walletBalance,
    ruleset.data,
    rulesetMetadata.data,
    projectId,
    jbContracts,
    project,
    dailyTotals,
    isRefetching,
  ]);


  if (isInitialLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  }

  if (
    !isFetching &&
    (!value.suckers || !value.ruleset || !value.rulesetMetadata || !value.project)
  ) {
    notFound(); 
  }

  return (
    <NetworkDataContext.Provider value={value as NetworkDataContextType}>
      {children}
    </NetworkDataContext.Provider>
  );
};


// The consumer hook remains the same.
export const useNetworkData = () => {
  const context = useContext(NetworkDataContext);
  if (!context) {
    throw new Error('useNetworkData must be used within a NetworkDataProvider');
  }
  return context;
};