"use client";
import { createContext, useContext, ReactNode, useMemo, useState } from "react";
import {
  useJBRulesetContext,
  useSuckers,
} from "juice-sdk-react";
import { Loader2 } from "lucide-react";
import {
  SuckerPair,
  JBRulesetData,
  JBRulesetMetadata,
  JBProjectMetadata,
} from "juice-sdk-core";
import { ProjectQuery } from "@/generated/graphql";
import { useVolumeData, DailyVolume } from "@/hooks/useVolumeData";
import { notFound } from "next/navigation";
import {
  TokenResponse,
  DaoResponse,
  TreasuryResponse,
} from "@/lib/types/AnalyticTypes";

interface AnalyticsDataProp {
  daoData: DaoResponse;
  treasuryData: TreasuryResponse | null;
  tokenData: TokenResponse | null;
}

interface NetworkDataContextType {
  suckers: SuckerPair[];
  ruleset: JBRulesetData;
  rulesetMetadata: JBRulesetMetadata;
  project: NonNullable<ProjectQuery["project"]>;
  dailyTotals: DailyVolume[];
  isRefetching: boolean;
  analyticsData: AnalyticsDataProp | null;
  // token: AsyncData<GetTokenReturnType | undefined>;
  // metadata: AsyncData<JBProjectMetadata>;
}

const NetworkDataContext = createContext<NetworkDataContextType | undefined>(
  undefined
);

export const ProjectDataProvider = ({
  children,
  projectData,
  analyticsData,
}: {
  children: ReactNode;
  projectData: ProjectQuery;
  analyticsData: AnalyticsDataProp | null;
}) => {
  // Foundational Hooks
  // const { metadata } = useJBProjectMetadataContext();
  // const { token } = useJBTokenContext();

  const { data: suckers, isLoading: areSuckersLoading } = useSuckers();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  // NOTE: `project` will hold the current or stale data from the query hook.
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
    areSuckersLoading ||
    ruleset.isLoading || ruleset ||
    rulesetMetadata.isLoading || !rulesetMetadata ||
    (!!project?.suckerGroupId && isVolumeLoading);

  const isInitialLoading = isFetching && !project;

  // `isRefetching` is true when we are fetching again (e.g., chain changed)
  const isRefetching = isFetching && !!project;

  const value = useMemo(() => {
    return {
      suckers,
      ruleset: ruleset.data,
      rulesetMetadata: rulesetMetadata.data,
      project,
      dailyTotals,
      isRefetching,
      analyticsData,
      // token,
      // metadata,
    };
  }, [
    suckers,
    ruleset.data,
    rulesetMetadata.data,
    project,
    dailyTotals,
    isRefetching,
    analyticsData,
    // token,
  ]);

  if (isInitialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (
    !isFetching &&
    (!value.suckers ||
      //!value.ruleset ||
      //!value.rulesetMetadata ||
      !value.project)
  ) {
    console.log("No project values found");
    notFound();
  }

  return (
    <NetworkDataContext.Provider value={value as NetworkDataContextType}>
      {children}
    </NetworkDataContext.Provider>
  );
};

// The consumer hook remains the same.
export const useProjectContext = () => {
  const context = useContext(NetworkDataContext);
  if (!context) {
    throw new Error(
      "useProjectContext must be used within a NetworkDataProvider"
    );
  }
  return context;
};
