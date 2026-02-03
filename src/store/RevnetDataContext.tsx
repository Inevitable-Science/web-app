//  Weird but useful pattern - READ MORE: https://tkdodo.eu/blog/zustand-and-react-context
//  Zustand + React Context allows for many benefits such as initialization  w/props
//  This pattern reduces the caveats usually found with replacing context w/zustand stores.

"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from "react";
import {
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useSuckers,
} from "juice-sdk-react";
import { SuckerPair, JBRulesetData, JBRulesetMetadata } from "juice-sdk-core";
import { ProjectQuery } from "@/generated/graphql";
import { useVolumeData, DailyVolume } from "@/hooks/useVolumeData";
import {
  TokenResponse,
  DaoResponse,
  TreasuryResponse,
} from "@/lib/types/AnalyticTypes";
import { createStore, StoreApi, useStore } from "zustand";

export type SelectedTabType =
  | "about"
  | "tokens"
  | "activity"
  | "cycles"
  | "analytics"
  | "treasury";

interface RevnetDataStore {
  // Interactive State
  selectedSucker: SuckerPair;
  setSelectedSucker: (sucker: SuckerPair) => void;

  // State
  slug: string;
  suckers: SuckerPair[] | undefined;
  ruleset: JBRulesetData | undefined;
  rulesetMetadata: JBRulesetMetadata | undefined;
  project: NonNullable<ProjectQuery["project"]>;
  dailyTotals: DailyVolume[];

  // Analytics State
  //daoData: DaoResponse | null;
  treasuryAnalytics: TreasuryResponse | null;
  tokenAnalytics: TokenResponse | null;

  // Actions - Setters
  setSuckers: (suckers: SuckerPair[]) => void;
  setRuleset: (ruleset: JBRulesetData) => void;
  setRulesetMetadata: (metadata: JBRulesetMetadata) => void;
  setProject: (project: NonNullable<ProjectQuery["project"]>) => void;
  setDailyTotals: (totals: DailyVolume[]) => void;
}

const RevnetDataContext = createContext<StoreApi<RevnetDataStore> | undefined>(
  undefined
);

interface ContextPropType {
  children: ReactNode;
  projectData: NonNullable<ProjectQuery["project"]>;
  treasuryAnalytics: TreasuryResponse | null;
  tokenAnalytics: TokenResponse | null;
  slug: string;
}

export const RevnetDataProvider = ({
  children,
  projectData,
  treasuryAnalytics,
  tokenAnalytics,
  slug,
}: ContextPropType) => {
  // Foundational Hooks
  const { data: suckers, isLoading: areSuckersLoading } = useSuckers();
  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  const chainId = useJBChainId();
  const { projectId } = useJBContractContext();

  const [loadTimestamp] = useState(() => Math.floor(Date.now() / 1000));
  const twoWeeksAgo = useMemo(
    () => loadTimestamp - 14 * 24 * 60 * 60,
    [loadTimestamp]
  );

  const { dailyTotals, isLoading: isVolumeLoading } = useVolumeData({
    suckerGroupId: projectData.suckerGroupId,
    startTimestamp: twoWeeksAgo,
    endTimestamp: loadTimestamp,
  });

  const [store] = useState(() =>
    createStore<RevnetDataStore>((set) => ({
      selectedSucker: { peerChainId: chainId!, projectId }, // todo review if this is safe (chainId!)
      setSelectedSucker: (sucker) => set({ selectedSucker: sucker }),

      slug: slug,
      suckers: suckers,
      ruleset: ruleset.data ?? undefined,
      rulesetMetadata: rulesetMetadata.data!,
      project: projectData,
      dailyTotals,

      //daoData,
      treasuryAnalytics,
      tokenAnalytics,

      setRuleset: (newRuleset) => set({ ruleset: newRuleset }),

      setRulesetMetadata: (metadata) => set({ rulesetMetadata: metadata }),

      setProject: (newProject) => set({ project: newProject }),

      setSuckers: (newSuckers) => set({ suckers: newSuckers }),

      setDailyTotals: (totals) => set({ dailyTotals: totals }),
    }))
  );

  // Keep store in sync when data changes
  useEffect(() => {
    if (suckers) store.getState().setSuckers(suckers);
  }, [suckers, store]);

  useEffect(() => {
    if (ruleset.data) store.getState().setRuleset(ruleset.data);
  }, [ruleset.data, store]);

  useEffect(() => {
    if (rulesetMetadata.data)
      store.getState().setRulesetMetadata(rulesetMetadata.data);
  }, [rulesetMetadata.data, store]);

  useEffect(() => {
    if (dailyTotals) store.getState().setDailyTotals(dailyTotals);
  }, [dailyTotals, store]);

  return (
    <RevnetDataContext.Provider value={store}>
      {children}
    </RevnetDataContext.Provider>
  );
};

export function useRevnetDataStore<T>(selector: (state: RevnetDataStore) => T) {
  const context = useContext(RevnetDataContext);

  if (!context) {
    throw new Error("NetworkDataContext Provider is missing");
  }

  return useStore(context, selector);
}
