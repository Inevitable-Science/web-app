// TabContent.tsx
"use client"
import { FC } from "react";
import { useData } from "../DataProvider";
import { DescriptionSection } from "./sections/about/AboutSection";
import { ActivityFeed } from "./sections/activity/ActivityFeed";
import { TreasurySection } from "./sections/treasury/TreasurySection";
import { TokenSection } from "./sections/tokenAnalytics/TokenAnalytics";
import { useSwitchToCorrectChain } from "../useEnsureCorrectChain";

interface TabContentProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

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

  useSwitchToCorrectChain();

  if (!SelectedComponent) {
    return null;
  }

  return (
    <div className="pb-10">

      {selectedTab === "about" && (
        <DescriptionSection />
      )}

      {selectedTab === "activity" && (
        <ActivityFeed />
      )}

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
