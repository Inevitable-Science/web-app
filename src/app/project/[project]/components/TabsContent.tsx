// TabContent.tsx
"use client"
import { FC, useState, useEffect } from 'react';
import { DescriptionSection } from './sections/about/AboutSection';
/*
import { ActivityFeed } from "../ActivityFeed";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";

import { TreasurySection } from './sections/TreasuryAnalyticsSection/TreasurySection';
import { TokenSection } from './sections/TokenAnalyticsSection/TokenSection';*/
import { useData } from '../DataProvider';
import { TreasurySection } from './sections/treasury/TreasurySection';
import { TokenSection } from './sections/tokenAnalytics/TokenAnalytics';
import { ActivityFeed } from './sections/activity/ActivityFeed';

interface TabContentProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

// Mapping of tab names to their corresponding components
/*const tabComponents: Record<string, FC<any>> = {
  activity: ActivityFeed,
  cycles: NetworkDetailsTable,
  tokens: HoldersSection,
  about: DescriptionSection,
  analytics: TokenSection,
  treasury: TreasurySection,
};*/

const tabComponents: Record<string, FC<any>> = {
  about: DescriptionSection,
  activity: ActivityFeed,
  analytics: TokenSection,
  treasury: TreasurySection,
};

export const TabContent: FC<TabContentProps> = ({ 
  selectedTab, 
  setSelectedTab,
}) => {
  const { analyticsData } = useData();
  const SelectedComponent = tabComponents[selectedTab];
  
  // If no matching component is found, render nothing or a fallback
  if (!SelectedComponent) {
    return null;
  }

  useEffect(() => {
    console.log(selectedTab);
  }, [selectedTab]);

  return (
    <div className="pb-10">

      {selectedTab === "about" && (
        <DescriptionSection />
      )}

      {selectedTab === "activity" && (
        <ActivityFeed />
      )}
      {/*{selectedTab === "tokens" && (
        <HoldersSection />
      )}
      {selectedTab === "activity" && (
        <ActivityFeed />
      )}

      {analyticsData?.tokenData && analyticsData?.treasuryData && (
        <>
          {analyticsData?.tokenData && (
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
      )}*/}

      {analyticsData?.tokenData && (
        <>
          {selectedTab === "analytics" && (
            <TokenSection />
          )}
        </>
      )}

      {analyticsData?.treasuryData && (
        <>
          {selectedTab === "treasury" && (
            <TreasurySection />
          )}
        </>
      )}
    </div>
  );
};
