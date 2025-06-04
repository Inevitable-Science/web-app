// TabContent.tsx
"use client"
import { FC, useState, useEffect } from 'react';
import { ActivityFeed } from "../ActivityFeed";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { DescriptionSection } from "./sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";

interface TabContentProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  daoName: string;
  tokenName: string;
}

interface DaoData {
  treasuryHoldings: string;
  assetsUnderManagement: string;
  totalHolders: string;
  totalSupply: string;
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
};

export const TabContent: FC<TabContentProps> = ({ selectedTab, setSelectedTab, daoName, tokenName }) => {
  const [data, setData] = useState<DaoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

        // TODO: Allow elements to be null rather then whole array

        // Fetch DAO data
        const daoResponse = await fetch(`https://api.profiler.bio/api/dao/${daoName}`);
        if (!daoResponse.ok) {
          throw new Error('Failed to fetch DAO data');
        }
        const daoResult = await daoResponse.json();

        // Fetch token data
        const tokenResponse = await fetch(`https://api.profiler.bio/api/token/${tokenName}`);
        if (!tokenResponse.ok) {
          throw new Error('Failed to fetch token data');
        }
        const tokenResult = await tokenResponse.json();

        // Fetch market chart data
        const marketResponse = await fetch(`https://api.profiler.bio/api/market-chart?id=${tokenName}&days=7`);
        if (!marketResponse.ok) {
          throw new Error('Failed to fetch market chart data');
        }
        const marketResult = await marketResponse.json();

        // Extract latest price and market cap
        const latestPrice = marketResult.prices[marketResult.prices.length - 1]?.[1] || 0;
        const latestMarketCap = marketResult.market_caps[marketResult.market_caps.length - 1]?.[1] || 0;

        // Combine all data
        setData({
          treasuryHoldings: daoResult.treasuryHoldings,
          assetsUnderManagement: daoResult.assetsUnderManagement,
          totalHolders: tokenResult.selectedToken.totalHolders,
          totalSupply: tokenResult.selectedToken.totalSupply,
          latestPrice,
          latestMarketCap,
          tokenName,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    fetchData();
  }, [daoName]);

  // Find the component to render based on the selectedTab
  const SelectedComponent = tabComponents[selectedTab];

  // If no matching component is found, render nothing or a fallback
  if (!SelectedComponent) {
    return null;
  }

  return (
    <div className="pb-5">
      {/* Render the selected component, passing data only if the tab is 'about' */}
      {selectedTab === "activity" && (
        <div className="pb-5">
          <ActivityFeed />
        </div>
      )}
      {selectedTab === "cycles" && (
        <div className="pb-5">
          <NetworkDetailsTable />
        </div>
      )}
      {selectedTab === "tokens" && (
        <div className="pb-5">
          <HoldersSection />
        </div>
      )}
      {selectedTab === "about" && (
        <div className="pb-5">
          <DescriptionSection data={data} setSelectedTab={setSelectedTab} />
        </div>
      )}
    </div>
  );
};