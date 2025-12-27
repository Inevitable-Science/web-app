"use client";
import { FC } from "react";
import { ActivityFeed } from "../sections/activity/ActivityFeed";
import { NetworkDetailsTable } from "../sections/cycles/CyclesTab";
import { DescriptionSection } from "../sections/about/DescriptionSection";
import { HoldersSection } from "../sections/token/TokensSection";

import { TreasurySection } from "../sections/treasuryAnalytics/TreasurySection";
import { TokenSection } from "../sections/tokenAnalytics/TokenSection";
import { useProjectContext } from "../../ProjectDataContext";
import { useJBTokenContext } from "juice-sdk-react";

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
  const { analyticsData } = useProjectContext();
  const { token } = useJBTokenContext();
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
