"use client";
import { FC } from "react";
import { ActivityFeed } from "../sections/activity/ActivityFeed";
import { NetworkDetailsTable } from "../sections/cycles/CyclesTab";
import { DescriptionSection } from "../sections/about/DescriptionSection";
import { HoldersSection } from "../sections/token/TokensSection";

import { TreasurySection } from "../sections/treasuryAnalytics/TreasurySection";
import { TokenSection } from "../sections/tokenAnalytics/TokenSection";
import { useProjectDataStore } from "../../ProjectDataContext";
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

export function TabContent() {
  const treasuryAnalytics = useProjectDataStore((state) => state.treasuryAnalytics);
  const tokenAnalytics = useProjectDataStore((state) => state.tokenAnalytics);
  const { token } = useJBTokenContext();

  const selectedTab = useProjectDataStore((state) => state.selectedTab);
  const SelectedComponent = tabComponents[selectedTab];

  // If no matching component is found, render nothing or a fallback
  if (!SelectedComponent) {
    return null;
  }

  return (
    <div className="pb-10">
      {selectedTab === "about" && (
        <DescriptionSection />
      )}
      {selectedTab === "tokens" && <HoldersSection />}
      {selectedTab === "activity" && <ActivityFeed />}
      {selectedTab === "cycles" && <NetworkDetailsTable />}

      {token?.data && tokenAnalytics && selectedTab === "analytics" && <TokenSection />}
      {treasuryAnalytics && selectedTab === "treasury" && <TreasurySection />}
    </div>
  );
}
