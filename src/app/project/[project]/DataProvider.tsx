"use client";
import { createContext, useContext, useMemo, ReactNode } from "react";
import {
  TokenResponse,
  DaoResponse,
  TreasuryResponse,
} from "@/lib/types/AnalyticTypes";

const DataContext = createContext<DataContextType | null>(null);

interface ContextProps {
  children: ReactNode;
  daoData: DaoResponse;
  treasuryData: TreasuryResponse;
  tokenData: TokenResponse;
}

export interface AnalyticsData {
  tokenData: TokenResponse | null;
  daoData: DaoResponse | null;
  treasuryData: TreasuryResponse | null;
}

export interface DataContextType {
  analyticsData: AnalyticsData | null;
}

export function DataProvider({
  children,
  daoData,
  treasuryData,
  tokenData,
}: ContextProps) {
  const analyticsData: AnalyticsData = {
    daoData,
    treasuryData,
    tokenData,
  };

  const value = useMemo(() => {
    return {
      analyticsData,
    };
  }, [analyticsData]);

  return (
    <DataContext.Provider value={value as DataContextType}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
