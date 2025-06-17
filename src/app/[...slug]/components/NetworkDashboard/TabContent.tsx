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
import { AnalyticsData } from './NetworkDataContext';

interface TabContentProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
  analyticsData: AnalyticsData | null;
  analyticsError: string | null;
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
  analyticsData,
  analyticsError,
}) => {
  const SelectedComponent = tabComponents[selectedTab];
  const latestPrice = analyticsData?.marketData?.prices[analyticsData.marketData.prices.length - 1]?.[1] || 0;
  const latestMarketCap = analyticsData?.marketData?.market_caps[analyticsData.marketData.market_caps.length - 1]?.[1] || 0;

  const descriptionData: DescriptionInterface = {
    treasuryHoldings: analyticsData?.treasuryData?.treasuryValue.toString() ?? '',
    assetsUnderManagement: analyticsData?.treasuryData?.assetsUnderManagement ?? '',
    totalHolders: analyticsData?.daoData?.nativeToken.totalHolders ?? '',
    totalSupply: analyticsData?.daoData?.nativeToken.totalSupply ?? '',
    latestPrice: latestPrice ?? 0,
    latestMarketCap: latestMarketCap ?? 0,
    tokenName: analyticsData?.tokenData?.name ?? '',
  };

  // If no matching component is found, render nothing or a fallback
  if (!SelectedComponent) {
    return null;
  }

  return (
    <div className="pb-10">

      {selectedTab === "about" && (
        <DescriptionSection analyticsError={analyticsError} data={descriptionData} setSelectedTab={setSelectedTab} />
      )}
      {selectedTab === "tokens" && (
        <HoldersSection />
      )}
      {selectedTab === "activity" && (
        <ActivityFeed />
      )}
      {selectedTab === "cycles" && (
        <NetworkDetailsTable analyticsError={analyticsError} setSelectedTab={setSelectedTab} />
      )}

      {!analyticsError && analyticsData?.tokenData && analyticsData?.treasuryData && (
        <>
          {selectedTab === "analytics" && (
            <TokenSection data={analyticsData?.tokenData} />
          )}
          {selectedTab === "treasury" && (
            <TreasurySection data={analyticsData?.treasuryData} />
          )}
        </>
      )}
    </div>
  );
};
