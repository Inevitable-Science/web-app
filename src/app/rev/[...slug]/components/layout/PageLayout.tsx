"use client";
import { useJBContractContext } from "juice-sdk-react";
import { notFound } from "next/navigation";
import { useState } from "react";
import { zeroAddress } from "viem";
import { PayCard } from "../payCard/PayCardWrapper";
import { Header } from "./Header";
import { TabContent } from "./TabContent";
import { OtherDaosCarousel } from "./OtherDaosCarousel";

import { useProjectContext } from "../../ProjectDataContext";
import { ArrowRight } from "lucide-react";

export function PageLayout() {
  const { token, analyticsData, metadata } = useProjectContext();
  const { contracts } = useJBContractContext();

  // UI-specific state remains in this component.
  const [selectedTab, setSelectedTab] = useState("about");

  const tabs = [
    { key: "about", label: "About" },
    { key: "tokens", label: "Tokens" },
    { key: "activity", label: "Activity" },
    { key: "cycles", label: "Cycles" },
    ...(analyticsData?.daoData === null //&& isAnalyticsLoading === false // Intended to prevent CLS
      ? []
      : [
          ...(analyticsData?.tokenData // && token.data
            ? [{ key: "analytics", label: "Analytics" }]
            : []),
          ...(analyticsData?.treasuryData
            ? [{ key: "treasury", label: "Treasury" }]
            : []),
        ]),
  ];

  if (contracts.controller.data === zeroAddress) {
    notFound();
  }

  return (
    <>
      <div className="relative w-full">
        <div className="absolute inset-0 -z-10 w-full bg-[url('/assets/img/dao_landing.webp')] bg-cover bg-center"></div>
        <Header />
      </div>
      <div className="ctWrapper mb-10 flex flex-wrap gap-8 px-4 pb-5 sm:mb-24 md:flex-nowrap">
        <aside className="max-w-54 hidden lg:block">
          <div className="mb-6 flex min-w-[110px] flex-col items-start gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`-mb-px flex items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-hidden ${
                  selectedTab === tab.key
                    ? "bg-gunmetal"
                    : "text-muted-foreground hover:bg-grey-450 hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className={selectedTab === tab.key ? "block" : "hidden"}>
                  <ArrowRight height="18" width="18" />
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Column 1 */}
        <div className="flex-1">
          <div className="block md:hidden">
            <div className="mb-4 mt-1">
              <PayCard />
            </div>
          </div>

          <div className="mx-auto max-w-4xl">
            <section className="mb-10">
              <aside className="block lg:hidden">
                <div className="mb-6 flex flex-wrap gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedTab(tab.key)}
                      className={`-mb-px flex items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-hidden ${
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
                />
              </div>
            </section>
          </div>
        </div>

        <div className="hidden w-full md:block md:w-[340px] lg:w-[400px]">
          <div className="mb-4">
            <PayCard />
          </div>
        </div>
      </div>

      <OtherDaosCarousel />
    </>
  );
}
