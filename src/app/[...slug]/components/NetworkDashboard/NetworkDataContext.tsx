import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import {
  useJBRulesetContext,
  useSuckers,
  useJBContractContext,
  useJBChainId,
  useJBProjectMetadataContext,
  useReadJbSplitsSplitsOf,
  JBChainId,
} from 'juice-sdk-react';
import { Loader2 } from 'lucide-react';
import { SuckerPair, JBRulesetData, JBRulesetMetadata, JBProjectMetadata } from 'juice-sdk-core';
import { JBContractContextData } from 'juice-sdk-react';
import { useBendystrawQuery } from '@/graphql/useBendystrawQuery';
import { ProjectDocument, ProjectQuery } from '@/generated/graphql';
import { useVolumeData, DailyVolume } from '@/hooks/useVolumeData';
import { notFound } from 'next/navigation';
import { TokenResponse, DaoResponse, TreasuryResponse, MarketChartResponse } from '@/lib/types/AnalyticTypes';
import { AsyncData } from 'juice-sdk-react/dist/contexts/types';
import { type GetTokenReturnType } from '@wagmi/core'
import { useBoostRecipient } from '@/hooks/useBoostRecipient';

export interface AnalyticsData {
  tokenData: TokenResponse | null;
  daoData: DaoResponse | null;
  treasuryData: TreasuryResponse | null;
  marketData: MarketChartResponse | null;
}

interface NetworkDataContextType {
  suckers: SuckerPair[];
  walletBalance: ReturnType<typeof useBalance>['data'];
  ruleset: JBRulesetData;
  rulesetMetadata: JBRulesetMetadata;
  contracts: JBContractContextData;
  project: NonNullable<ProjectQuery['project']>;
  dailyTotals: DailyVolume[];
  isRefetching: boolean;
  analyticsData: AnalyticsData | null;
  isAnalyticsLoading: boolean;
  analyticsError: string | null;
  token: AsyncData<GetTokenReturnType | undefined>;
  chainId: 1 | 10 | 8453 | 42161 | 84532 | 421614 | 11155111 | 11155420 | undefined;
  payoutWallet: `0x${string}` | undefined;
  metadata: AsyncData<JBProjectMetadata>;
}

const NetworkDataContext = createContext<NetworkDataContextType | undefined>(undefined);

export const NetworkDataProvider = ({ children, token }: { children: ReactNode, token: AsyncData<GetTokenReturnType | undefined> }) => {
  // Foundational Hooks
  const { address } = useAccount();
  const { projectId, contracts: jbContracts } = useJBContractContext();
  const chainId = useJBChainId();
  const { metadata } = useJBProjectMetadataContext();
  const payoutWallet = useBoostRecipient();

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

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have the necessary project details and are not already fetching.
    const daoName = metadata.data?.name;
    const tokenName = token.data?.name; // Assuming token symbol is used as the ID. Adjust if needed.

    if (!daoName || !tokenName) {
      return;
    }

    const fetchAnalyticsData = async () => {
      setIsAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        // Use Promise.all to fetch data in parallel for better performance
        const responses = await Promise.all([
          fetch(`https://api.profiler.bio/api/dao/${daoName}`),
          fetch(`https://api.profiler.bio/api/token/${tokenName}`),
          fetch(`https://api.profiler.bio/api/treasury/${daoName}`),
          fetch(`https://api.profiler.bio/api/market-chart?id=${tokenName}&days=7`)
        ]);

        // Check if all responses are OK
        for (const response of responses) {
          if (!response.ok) {
            throw new Error(`Failed to fetch analytics data (status: ${response.status})`);
          }
        }

        const [daoResult, tokenResult, treasuryResult, marketResult] = await Promise.all(responses.map(res => res.json()));

        setAnalyticsData({
          daoData: daoResult,
          tokenData: tokenResult,
          treasuryData: treasuryResult,
          marketData: marketResult
        });

      } catch (err) {
        setAnalyticsError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [metadata.data?.name, token.data?.symbol]);

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
      analyticsData,
      isAnalyticsLoading,
      analyticsError,
      token,
      payoutWallet,
      metadata
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
    analyticsData,
    isAnalyticsLoading,
    analyticsError,
    token
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