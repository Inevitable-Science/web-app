"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import {
  TokenResponse,
  DaoResponse,
  TreasuryResponse,
} from "@/lib/types/AnalyticTypes";
import { createStore, StoreApi, useStore } from "zustand";

export type TabType = "about" | "activity" | "analytics" | "treasury";

interface ContextProps {
  children: ReactNode;
  daoData: DaoResponse;
  treasuryAnalytics: TreasuryResponse | null;
  tokenAnalytics: TokenResponse | null;
}

export interface LegacyProjectStore {
  daoData: DaoResponse;
  treasuryAnalytics: TreasuryResponse | null;
  tokenAnalytics: TokenResponse | null;
  //selectedTab: TabType;
  //setSelectedTab: (tab: TabType) => void;
}

const LegacyProjectContext = createContext<
  StoreApi<LegacyProjectStore> | undefined
>(undefined);

export function LegacyProjectProvider({
  children,
  daoData,
  treasuryAnalytics,
  tokenAnalytics,
}: ContextProps) {
  const [store] = useState(() =>
    createStore<LegacyProjectStore>((set) => ({
      daoData,
      treasuryAnalytics,
      tokenAnalytics,

      //selectedTab: "about",
      //setSelectedTab: (selectedTab) => set({ selectedTab }),
    }))
  );

  return (
    <LegacyProjectContext.Provider value={store}>
      {children}
    </LegacyProjectContext.Provider>
  );
}

export function useLegacyProjectStore<T>(
  selector: (state: LegacyProjectStore) => T
) {
  const context = useContext(LegacyProjectContext);

  if (!context) {
    throw new Error("LegacyProjectContext Provider is missing");
  }

  return useStore(context, selector);
}
