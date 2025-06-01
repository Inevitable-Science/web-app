// TabContent.tsx
"use client"
import { FC, useState, useEffect } from 'react';
import { ActivityFeed } from "../ActivityFeed";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { DescriptionSection } from "./sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";

interface TabContentProps {
  selectedTab: string;
  daoName: string;
}

interface DaoData {
  treasuryHoldings: string;
  assetsUnderManagement: string;
}

// Mapping of tab names to their corresponding components
const tabComponents: Record<string, FC<any>> = {
  activity: ActivityFeed,
  terms: NetworkDetailsTable,
  owners: HoldersSection,
  about: DescriptionSection,
};

export const TabContent: FC<TabContentProps> = ({ selectedTab, daoName }) => {
  const [data, setData] = useState<DaoData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://api.profiler.bio/api/dao/${daoName}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch DAO data');
        }
        
        const result = await response.json();
        setData({
          treasuryHoldings: result.treasuryHoldings,
          assetsUnderManagement: result.assetsUnderManagement,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
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
      {selectedTab === "terms" && (
        <div className="pb-5">
          <NetworkDetailsTable />
        </div>
      )}
      {selectedTab === "owners" && (
        <div className="pb-5">
          <HoldersSection />
        </div>
      )}
      {selectedTab === "about" && (
        <div className="pb-5">
          <DescriptionSection data={data} />
        </div>
      )}
    </div>
  );
};