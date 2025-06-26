"use client";

import { formatTokenSymbol } from "@/lib/utils";
import {
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { PayCard } from "../PayCard/PayCard";
// import { SwapWidget } from "../PayCard/SwapWiget/SwapWiget";
import { Header } from "./Header/Header";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { TabContent } from "./TabContent";

import OtherDaosCarousel from "./Components/OtherDaosCarousel";

import { NetworkDataProvider, useNetworkData } from "./NetworkDataContext";
import { SelectedSuckerProvider } from "../PayCard/SelectedSuckerContext";

/**
 * The top-level component. Its ONLY job is to render the provider,
 * making the shared data available to all children.
 */
export function NetworkDashboard() {
  const { token } = useJBTokenContext();
  return (
    <NetworkDataProvider token={token}>
      <DashboardContent />
    </NetworkDataProvider>
  );
}

function DashboardContent() {
  const { contracts, token, analyticsData, isAnalyticsLoading, analyticsError, metadata } = useNetworkData();

  // UI-specific state remains in this component.
  const [selectedTab, setSelectedTab] = useState("about");

  const tabs = [
    { key: "about", label: "About" },
    { key: "tokens", label: "Tokens" },
    { key: "activity", label: "Activity" },
    { key: "cycles", label: "Cycles" },
    ...(analyticsData?.daoData === null
      ? [
          { key: "analytics", label: "Analytics" },
          { key: "treasury", label: "Treasury" },
        ]
      : []),
  ];

  // set title - removed for now, use SSR to render title in layout file using project handle instead of token name
  /*useEffect(() => {
    console.log("token symbol", token?.data?.symbol)
    if (token?.data?.symbol === undefined) document.title = `${metadata.data?.name} | Inevitable Protocol`; else
    document.title = `${formatTokenSymbol(token)} | Inevitable Protocol`;
  }, [token, metadata]);*/

  if (contracts.contracts.controller.data === zeroAddress) {
    notFound();
  }

  return (
    <>
      <div className="w-full relative">
        <div className="absolute inset-0 bg-[url('/assets/img/dao_landing.webp')] bg-cover w-full bg-center z-[-10]"></div>
        <Header />
      </div>
      <div className="ctWrapper flex gap-10 px-4 pb-5 md:flex-nowrap flex-wrap mb-10 sm:mb-24">
        <aside className="hidden lg:block max-w-54">
          <div className="flex flex-col gap-2 items-start mb-6 min-w-[110px]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`-mb-px transition-colors duration-150 focus:outline-none py-[8px] px-[12px] rounded-full flex gap-2 items-center ${
                  selectedTab === tab.key
                    ? "bg-gunmetal"
                    : "text-muted-foreground hover:bg-grey-450 hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className={ 
                  selectedTab === tab.key
                    ? "block"
                    : "hidden"
                  }
                >
                  <ArrowRightIcon height="18" width="18" />
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Column 1 */}
        <div className="flex-1">
          <div className="md:hidden block">
            <div className="mt-1 mb-4">
              <PayCard />
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <section className="mb-10">
              <aside className="block lg:hidden">
                <div className="flex flex-wrap mb-6 gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key)}
                      className={`-mb-px transition-colors duration-150 focus:outline-none py-[8px] px-[12px] rounded-full flex gap-2 items-center ${
                        selectedTab === tab.key
                          ? "bg-gunmetal"
                          : "text-muted-foreground hover:bg-grey-450 hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </aside>
              <div className="sm:min-h-[700px]">
                <TabContent
                  selectedTab={selectedTab} 
                  setSelectedTab={setSelectedTab} 
                  analyticsError={analyticsError}
                  analyticsData={analyticsData}
                />
              </div>
            </section>
          </div>
        </div>

        <div className="md:block hidden w-full md:w-[340px] lg:w-[400px]">
          <div className="mb-4">
            <PayCard />
          </div>
        </div>
      </div>

      <OtherDaosCarousel />
    </>
  );
}