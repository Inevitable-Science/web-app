// TabContent.tsx
"use client"
import { FC, useState, useEffect } from 'react';
import { ActivityFeed } from "../ActivityFeed";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { DescriptionSection } from "./sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";

import { TreasurySection } from './sections/TreasuryAnalyticsSection/TreasurySection';
import { TokenSection } from './sections/TokenAnalyticsSection/TokenSection';
import { TokenResponse, DaoResponse, TreasuryResponse, MarketChartResponse } from '@/lib/types/AnalyticTypes'

interface TabContentProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  daoName: string;
  tokenName: string;
}

interface DescriptionInterface {
  treasuryHoldings: string;
  assetsUnderManagement: string | number;
  totalHolders: string;
  totalSupply: string | number;
  latestPrice: number;
  latestMarketCap: number;
  tokenName: string;
}

// Mapping of tab names to their corresponding components
const tabComponents: Record<string, FC<any>> = {
  activity: ActivityFeed,
  cycles: NetworkDetailsTable,
  tokens: HoldersSection,
  about: DescriptionSection,
  analytics: TokenSection,
  treasury: TreasurySection,
};

export const TabContent: FC<TabContentProps> = ({ selectedTab, setSelectedTab, daoName, tokenName }) => {

  // Define separate state variables for each response
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [daoData, setDaoData] = useState<DaoResponse | null>(null);
  const [treasuryData, setTreasuryData] = useState<TreasuryResponse | null>(null);
  const [marketData, setMarketData] = useState<MarketChartResponse | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch DAO data
        const daoResponse = await fetch(`https://api.profiler.bio/api/dao/${daoName}`);
        if (!daoResponse.ok) {
          throw new Error('Failed to fetch DAO data');
        }
        const daoResult: DaoResponse = await daoResponse.json();
        setDaoData(daoResult);

        // Fetch token data
        const tokenResponse = await fetch(`https://api.profiler.bio/api/token/${tokenName}`);
        if (!tokenResponse.ok) {
          throw new Error('Failed to fetch token data');
        }
        const tokenResult: TokenResponse = await tokenResponse.json();
        setTokenData(tokenResult);

        // Fetch treasury data
        const treasuryResponse = await fetch(`https://api.profiler.bio/api/treasury/${daoName}`);
        if (!treasuryResponse.ok) {
          throw new Error('Failed to fetch treasury data');
        }
        const treasuryResult: TreasuryResponse = await treasuryResponse.json();
        setTreasuryData(treasuryResult);

        // Fetch market chart data
        const marketResponse = await fetch(`https://api.profiler.bio/api/market-chart?id=${tokenName}&days=7`);
        if (!marketResponse.ok) {
          throw new Error('Failed to fetch market chart data');
        }
        const marketResult: MarketChartResponse = await marketResponse.json();
        setMarketData(marketResult);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchData();
  }, [daoName, tokenName]);

  // Find the component to render based on the selectedTab
  const SelectedComponent = tabComponents[selectedTab];


  const latestPrice = marketData?.prices[marketData.prices.length - 1]?.[1] || 0;
  const latestMarketCap = marketData?.market_caps[marketData.market_caps.length - 1]?.[1] || 0;

  const descriptionData: DescriptionInterface = {
    treasuryHoldings: daoData?.treasuryHoldings ?? '',
    assetsUnderManagement: daoData?.assetsUnderManagement ?? '',
    totalHolders: tokenData?.selectedToken.totalHolders ?? '',
    totalSupply: tokenData?.selectedToken.totalSupply ?? '',
    latestPrice: latestPrice ?? 0,
    latestMarketCap: latestMarketCap ?? 0,
    tokenName: tokenData?.name ?? '',
  };

  // If no matching component is found, render nothing or a fallback
  if (!SelectedComponent) {
    return null;
  }

  return (
    <div className="pb-10">
      {/* Render the selected component, passing data only if the tab is 'about' */}
      {selectedTab === "activity" && (
        <ActivityFeed />
      )}
      {selectedTab === "cycles" && (
        <NetworkDetailsTable setSelectedTab={setSelectedTab} />
      )}
      {selectedTab === "tokens" && (
        <HoldersSection />
      )}
      {selectedTab === "about" && (
        <DescriptionSection data={descriptionData} setSelectedTab={setSelectedTab} />
      )}

      {/* DATA_TODO: Conditionally render the TokenSection and TreasurySection hiding it if the dao is currently not a "live" dao/is currently fundraising. allow admins to select if its live. */}
      {selectedTab === "analytics" && (
        <TokenSection data={tokenData} />
      )}
      {selectedTab === "treasury" && (
        <TreasurySection data={treasuryData} />
      )}
    </div>
  );
};
