"use client";
import { FC } from "react";
import { useLegacyProjectStore } from "../../../../store/LegacyProjectContext";
import { DescriptionSection } from "./sections/about/AboutSection";
import { ActivityFeed } from "./sections/activity/ActivityFeed";
import { TreasurySection } from "./sections/treasury/TreasurySection";
import { TokenSection } from "./sections/tokenAnalytics/TokenAnalytics";
import { useSwitchToCorrectChain } from "../useEnsureCorrectChain";

const tabComponents: Record<string, FC<any>> = {
  about: DescriptionSection,
  activity: ActivityFeed,
  analytics: TokenSection,
  treasury: TreasurySection,
};

export function TabContent() {
  const tokenAnalytics = useLegacyProjectStore((state) => state.tokenAnalytics);
  const treasuryAnalytics = useLegacyProjectStore(
    (state) => state.treasuryAnalytics
  );

  const selectedTab = useLegacyProjectStore((state) => state.selectedTab);
  const SelectedComponent = tabComponents[selectedTab];

  // This improves UX with the cowswap widget
  useSwitchToCorrectChain();

  if (!SelectedComponent) {
    return null;
  }

  return (
    <div className="pb-10">
      {selectedTab === "about" && <DescriptionSection />}

      {selectedTab === "activity" && <ActivityFeed />}

      {tokenAnalytics && selectedTab === "analytics" && <TokenSection />}

      {treasuryAnalytics && selectedTab === "treasury" && <TreasurySection />}
    </div>
  );
}
