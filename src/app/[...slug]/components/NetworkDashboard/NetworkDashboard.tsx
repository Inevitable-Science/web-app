"use client";

import { formatTokenSymbol } from "@/lib/utils";
import {
  useJBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { PayCard } from "../PayCard/PayCard";
import { SwapWidget } from "../PayCard/SwapWiget/SwapWiget";
import { Header } from "./Header/Header";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { TabContent } from "./TabContent";

import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { ProjectDocument } from "@/generated/graphql";

import OtherDaosCarousel from "./Components/OtherDaosCarousel";

export function NetworkDashboard() {
  const { projectId, contracts } = useJBContractContext();
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const [selectedTab, setSelectedTab] = useState("about");
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const chainId = useJBChainId();

  {/*const tabs = [
    { key: "about", label: "About" },
    { key: "tokens", label: "Tokens" },
    { key: "activity", label: "Activity" },
    { key: "cycles", label: "Cycles" },
    { key: "analytics", label: "Analytics" },
    { key: "treasury", label: "Treasury" },
  ];*/}
  const tabs = [
    { key: "about", label: "About" },
    { key: "tokens", label: "Tokens" },
    { key: "activity", label: "Activity" },
    { key: "cycles", label: "Cycles" },
    // Only include these tabs if there's no analyticsError
    ...(analyticsError === null
      ? [
          { key: "analytics", label: "Analytics" },
          { key: "treasury", label: "Treasury" },
        ]
      : []),
  ];

  // set title
  // TODO, hacky, probably eventually a next-idiomatic way to do this.
  useEffect(() => {
    if (!token?.data?.symbol) return;
    document.title = `${formatTokenSymbol(token)} | REVNET`;
  }, [token]);

  const pageLoading = metadata.isLoading && contracts.controller.isLoading;
  if (pageLoading) {
    return null;
  }

  if (contracts.controller.data === zeroAddress) {
    notFound();
  }

  const { name: projectName, logoUri, twitter, introImageUri } = metadata?.data ?? {};

  return (
    <>
      <div className="w-full relative">
        <div className="absolute inset-0 bg-[url('/assets/img/dao_landing.png')] bg-cover w-full bg-center z-[-10]"></div>
        <Header />
      </div>
      <div className="ctWrapper flex gap-10 px-4 pb-5 md:flex-nowrap flex-wrap mb-10 sm:mb-24">
        <aside className="hidden lg:block max-w-54">
          <div className="flex flex-col gap-2 items-start mb-6">
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
              {/* Tabs */}
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
              {/* Tab Content */}
              <div className="sm:min-h-[700px]">
                <TabContent
                  selectedTab={selectedTab}
                  setSelectedTab={setSelectedTab}
                  analyticsError={analyticsError}
                  setAnalyticsError={setAnalyticsError}
                  daoName={projectName? projectName : "Loading"}
                  tokenName={token?.data?.name? token.data.name : "..."}
                />

                {/* Dao Name is used for analytics, use static var in development 
                <TabContent 
                  selectedTab={selectedTab} 
                  setSelectedTab={setSelectedTab} 
                  analyticsError={analyticsError} 
                  setAnalyticsError={setAnalyticsError}
                  daoName="hydradao"
                  tokenName="hydra"
                /> */}
              </div>
            </section>
          </div>
          {/* Render Pay and activity after header on mobile */}
        </div>
        <div className="md:block hidden w-full md:w-[340px] lg:w-[400px]">
          <div className="mb-4">
            {/* DATA_TODO: Conditionally Render SwapWidget if the DAO is not in presale & pass it the token address */}

            {/*<SwapWidget token="0xf4308b0263723b121056938c2172868e408079d0" />*/}
            <PayCard />
            {/* <PayDummy /> */}
          </div>
        </div>
      </div>

      <OtherDaosCarousel />
    </>
  );
}
