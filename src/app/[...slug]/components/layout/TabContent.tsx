"use client";
import { FC } from "react";
import { ActivityFeed } from "../NetworkDashboard/sections/ActivitySection/ActivityFeed";
import { NetworkDetailsTable } from "../NetworkDashboard/sections/CyclesSection/NetworkDetailsTable";
import { DescriptionSection } from "../NetworkDashboard/sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "../NetworkDashboard/sections/HoldersSection/HoldersSection";

import { TreasurySection } from "../NetworkDashboard/sections/TreasuryAnalyticsSection/TreasurySection";
import { TokenSection } from "../NetworkDashboard/sections/TokenAnalyticsSection/TokenSection";
import { useProjectContext } from "../../ProjectDataContext";

interface TabContentProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
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

export function TabContent({ selectedTab, setSelectedTab }: TabContentProps) {
  const { token, analyticsData } = useProjectContext();
  const SelectedComponent = tabComponents[selectedTab];

  // If no matching component is found, render nothing or a fallback
  if (!SelectedComponent) {
    return null;
  }

  return (
    <div className="pb-10">
      {selectedTab === "about" && <DescriptionSection setSelectedTab={setSelectedTab} />}
      {selectedTab === "tokens" && <HoldersSection />}
      {selectedTab === "activity" && <ActivityFeed />}
      {selectedTab === "cycles" && <NetworkDetailsTable />}

      {analyticsData?.tokenData && analyticsData?.treasuryData && (
        <>
          {token?.data && selectedTab === "analytics" && <TokenSection />}
          {selectedTab === "treasury" && <TreasurySection />}
        </>
      )}
    </div>
  );
}
