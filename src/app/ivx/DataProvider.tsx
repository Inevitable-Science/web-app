"use client";
import { createContext, useContext, ReactNode, useMemo, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import {
  useJBRulesetContext,
  useSuckers,
  useJBContractContext,
  useJBChainId,
  useJBProjectMetadataContext,
  useJBTokenContext,
  useBendystrawQuery,
} from "juice-sdk-react";
import {
  SuckerPair,
  JBRulesetData,
  JBRulesetMetadata,
  JBProjectMetadata,
} from "juice-sdk-core";
import { JBContractContextData } from "juice-sdk-react";
import { ProjectDocument, ProjectQuery } from "@/generated/graphql";
import { useVolumeData, DailyVolume } from "@/hooks/useVolumeData";
import { notFound } from "next/navigation";
import {
  TokenResponse,
  TreasuryResponse,
  TokenResponseZ,
  TreasuryResponseZ,
} from "@/lib/types/AnalyticTypes";
import { AsyncData } from "juice-sdk-react/dist/contexts/types";
import { type GetTokenReturnType } from "@wagmi/core";
import { useBoostRecipient } from "@/hooks/useBoostRecipient";
import { z } from "zod";

export interface AnalyticsData {
  token: TokenResponse | null;
  treasury: TreasuryResponse | null;
}

interface NetworkDataContextType {
  suckers: SuckerPair[];
  walletBalance: ReturnType<typeof useBalance>["data"];
  ruleset: JBRulesetData;
  rulesetMetadata: JBRulesetMetadata;
  contracts: JBContractContextData;
  project: NonNullable<ProjectQuery["project"]>;
  dailyTotals: DailyVolume[];
  isRefetching: boolean;
  analyticsData: AnalyticsData | null;
  token: AsyncData<GetTokenReturnType | undefined>;
  chainId:
    | 1
    | 10
    | 8453
    | 42161
    | 84532
    | 421614
    | 11155111
    | 11155420
    | undefined;
  payoutWallet: `0x${string}` | undefined;
  metadata: AsyncData<JBProjectMetadata>;
}

const IvxPageDataContext = createContext<NetworkDataContextType | undefined>(
  undefined
);

export const IvxPageDataProvider = ({
  children,
  //token,
  tokenData,
  treasuryData,
}: {
  children: ReactNode;
  //token: AsyncData<GetTokenReturnType | undefined>;
  tokenData: z.infer<typeof TokenResponseZ>;
  treasuryData: z.infer<typeof TreasuryResponseZ>;
}) => {
  // Foundational Hooks
  const { address } = useAccount();
  const { token } = useJBTokenContext();
  const { projectId, contracts: jbContracts, version } = useJBContractContext();
  const { metadata } = useJBProjectMetadataContext();
  const chainId = useJBChainId();
  const payoutWallet = useBoostRecipient();

  const analyticsData: AnalyticsData | null =
    tokenData && treasuryData
      ? { token: tokenData, treasury: treasuryData }
      : null;

  // Primary Data Fetching Hooks
  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({
    address,
  });
  const { data: suckers, isLoading: areSuckersLoading } = useSuckers();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  // Dependent Data Fetching Hooks
  const { data: projectData, isLoading: isProjectLoading } = useBendystrawQuery(
    ProjectDocument,
    {
      chainId: Number(chainId),
      projectId: Number(projectId),
      version: version,
      skip: !chainId || !projectId || !version,
    }
  );

  // NOTE: `project` will hold the current or stale data from the query hook.
  console.log(projectData);
  const project = projectData?.project;

  const [loadTimestamp] = useState(() => Math.floor(Date.now() / 1000));
  const twoWeeksAgo = useMemo(
    () => loadTimestamp - 14 * 24 * 60 * 60,
    [loadTimestamp]
  );

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
      analyticsData,
      token,
      payoutWallet,
      metadata,
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
    token,
  ]);

  if (
    !isInitialLoading &&
    !isFetching &&
    (!value.suckers ||
      !value.ruleset ||
      !value.rulesetMetadata ||
      !value.project)
  ) {
    notFound();
  }

  return (
    <IvxPageDataContext.Provider value={value as NetworkDataContextType}>
      {children}
    </IvxPageDataContext.Provider>
  );
};

// The consumer hook remains the same.
export const useIVXContext = () => {
  const context = useContext(IvxPageDataContext);
  if (!context) {
    throw new Error("useIVXContext must be used within a NetworkDataProvider");
  }
  return context;
};
