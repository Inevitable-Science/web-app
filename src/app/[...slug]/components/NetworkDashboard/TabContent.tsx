// TabContent.tsx
"use client"
import { FC, useState, useEffect } from "react";
import { ActivityFeed } from "../ActivityFeed";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { DescriptionSection } from "./sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";

import { TreasurySection } from "./sections/TreasuryAnalyticsSection/TreasurySection";
import { TokenSection } from "./sections/TokenAnalyticsSection/TokenSection";
import { useNetworkData } from "./NetworkDataContext";

interface TabContentProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
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

export const TabContent: FC<TabContentProps> = ({
  selectedTab,
  setSelectedTab,
}) => {
  const { token, analyticsData, analyticsError } = useNetworkData();
  const SelectedComponent = tabComponents[selectedTab];

  // If no matching component is found, render nothing or a fallback
  if (!SelectedComponent) {
    return null;
  }

  return (
    <div className="pb-10">

      {selectedTab === "about" && (
        <DescriptionSection setSelectedTab={setSelectedTab} />
      )}
      {selectedTab === "tokens" && (
        <HoldersSection />
      )}
      {selectedTab === "activity" && (
        <ActivityFeed />
      )}
      {selectedTab === "cycles" && (
        <NetworkDetailsTable />
      )}

      {!analyticsError && analyticsData?.tokenData && analyticsData?.treasuryData && (
        <>
          {token?.data && (
            <>
              {selectedTab === "analytics" && (
                <TokenSection />
              )}
            </>
          )}
          {selectedTab === "treasury" && (
            <TreasurySection />
          )}
        </>
      )}
    </div>
  );
};
