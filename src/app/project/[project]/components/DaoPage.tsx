"use client";
import { useState } from "react";
import { Header } from "./Header";
import { SwapWidget } from "./SwapWiget/SwapWiget";
import { useData } from "../DataProvider";
import { TabContent } from "./TabsContent";
import { OtherDaosCarousel } from "@/app/[...slug]/components/layout/OtherDaosCarousel";

import { ArrowRightIcon } from "lucide-react";

export function DaoPage() {
  const { analyticsData } = useData();
  const [selectedTab, setSelectedTab] = useState("about");

  const tabs = [
    { key: "about", label: "About" },
    { key: "activity", label: "Activity" },
    ...(analyticsData?.daoData === null
      ? []
      : [
          ...(analyticsData?.tokenData
            ? [{ key: "analytics", label: "Analytics" }]
            : []),
          { key: "treasury", label: "Treasury" },
        ]),
  ];

  return (
    <>
      <div className="relative w-full">
        <div className="absolute inset-0 z-[-10] w-full bg-[url('/assets/img/dao_landing.webp')] bg-cover bg-center"></div>
        <Header />
      </div>

      <div className="ctWrapper mb-10 flex flex-wrap gap-10 px-4 pb-5 sm:mb-24 md:flex-nowrap">
        <aside className="max-w-54 hidden lg:block">
          <div className="mb-6 flex min-w-[110px] flex-col items-start gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                className={`-mb-px flex items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-none ${
                  selectedTab === tab.key
                    ? "bg-gunmetal"
                    : "text-muted-foreground hover:bg-grey-450 hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className={selectedTab === tab.key ? "block" : "hidden"}>
                  <ArrowRightIcon height="18" width="18" />
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Column 1 */}
        <div className="flex-1">
          <div className="block md:hidden">
            <div className="mt-1 max-h-[700px]">
              <SwapWidget
                token={
                  analyticsData?.tokenData?.selectedToken.address as string
                }
              />
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
                      className={`-mb-px flex items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-none ${
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
            <SwapWidget
              token={analyticsData?.tokenData?.selectedToken.address as string}
            />
          </div>
        </div>
      </div>

      <OtherDaosCarousel />
    </>
  );
}
