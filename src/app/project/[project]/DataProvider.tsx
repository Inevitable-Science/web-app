"use client";

import { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";
import { TokenResponse, DaoResponse, TreasuryResponse, MarketChartResponse } from "@/lib/types/AnalyticTypes";
import { Loader2 } from "lucide-react";

const DataContext = createContext<DataContextType | null>(null);

interface ContextProps{
  children: ReactNode;
  daoName: string;
  daoData: DaoResponse;
}

export interface AnalyticsData {
  tokenData: TokenResponse | null;
  daoData: DaoResponse | null;
  treasuryData: TreasuryResponse | null;
  marketData: MarketChartResponse | null;
}

export interface DataContextType {
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
}

export function DataProvider({ children, daoName, daoData }: ContextProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const tokenName = daoData.nativeToken.name;
        /*const responses = await Promise.all([
          fetch(`https://inev.profiler.bio/token/${tokenName}`),
          fetch(`https://inev.profiler.bio/treasury/${daoName}`),
          fetch(`https://inev.profiler.bio/chart/${tokenName}-7`)
        ]);

        for (const response of responses) {
          if (!response.ok) {
            throw new Error(`Failed to fetch analytics data (status: ${response.status})`);
          }
        }*/

        //const [tokenResult, treasuryResult, marketResult] = await Promise.all(responses.map(res => res.json()));

        // Fetch token and treasury data (required)
        const [tokenRes, treasuryRes] = await Promise.all([
          fetch(`https://inev.profiler.bio/token/${tokenName}`),
          fetch(`https://inev.profiler.bio/treasury/${daoName}`),
        ]);

        if (!tokenRes.ok || !treasuryRes.ok) {
          throw new Error("Failed to fetch required analytics data");
        }

        const [tokenResult, treasuryResult] = await Promise.all([
          tokenRes.json(),
          treasuryRes.json(),
        ]);

        // Try chart fetch separately (optional)
        let marketResult: MarketChartResponse | null = null;
        try {
          //const chartRes = await fetch(`https://inev.profiler.bio/chart/${tokenName}-7`);
          const chartRes = await fetch(`http://localhost:3001/chart/${tokenName}-7`);
          if (chartRes.ok) {
            marketResult = await chartRes.json();
          } else {
            console.warn("Chart fetch failed with status", chartRes.status);
          }
        } catch (chartErr) {
          console.warn("Chart fetch error:", chartErr);
        }
        // ------

        setAnalyticsData({
          daoData: daoData,
          tokenData: tokenResult,
          treasuryData: treasuryResult,
          marketData: marketResult
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

  }, [daoName]);

  const value = useMemo(() => {
    return {
      analyticsData,
      isLoading,
      error,
    };
  }, [
    analyticsData,
    isLoading,
    error,
  ]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12" />
      </div>
    );
  };

  return (
    <DataContext.Provider value={value as DataContextType}>
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to use the context
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}