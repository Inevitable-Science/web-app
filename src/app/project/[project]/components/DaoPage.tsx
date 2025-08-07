"use client"
import { useState } from "react";
import { Header } from "./Header";
import { SwapWidget } from "./SwapWiget/SwapWiget";
import OtherDaosCarousel from "@/app/[...slug]/components/NetworkDashboard/Components/OtherDaosCarousel";
import { useData } from "../DataProvider";
import { TabContent } from "./TabsContent";

import { ArrowRightIcon } from "lucide-react";

export function DaoPage() {
  const { analyticsData, isLoading } = useData();
  const [selectedTab, setSelectedTab] = useState("about");

  const tabs = [
    { key: "about", label: "About" },
    { key: "activity", label: "Activity" },
    ...(analyticsData?.daoData === null && isLoading === false // Intended to prevent CLS
      ? [] : [
        ...(analyticsData?.tokenData ? [{ key: "analytics", label: "Analytics" }] : []),
          { key: "treasury", label: "Treasury" },
        ]),
  ];

  return(
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
              <SwapWidget token={analyticsData?.tokenData?.selectedToken.address as string} />
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
                />
              </div>
            </section>
          </div>
        </div>

        <div className="md:block hidden w-full md:w-[340px] lg:w-[400px]">
          <div className="mb-4">
            <SwapWidget token={analyticsData?.tokenData?.selectedToken.address as string} />
          </div>
        </div>
      </div>

      <OtherDaosCarousel />
    </>
  );
}