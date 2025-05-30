"use client";

import { formatTokenSymbol } from "@/lib/utils";
import {
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { ActivityFeed } from "../ActivityFeed";
import { NetworkDetailsTable } from "../NetworkDetailsTable";
import { PayCard } from "../PayCard/PayCard";
import { Header } from "./Header/Header";
import { DescriptionSection } from "./sections/DescriptionSection/DescriptionSection";
import { HoldersSection } from "./sections/HoldersSection/HoldersSection";
import { ArrowRightIcon } from "@heroicons/react/24/outline";


export function NetworkDashboard() {
  const { contracts } = useJBContractContext();
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const [selectedTab, setSelectedTab] = useState("about");

  const tabs = [
    { key: "about", label: "About" },
    { key: "activity", label: "Activity" },
    { key: "terms", label: "Terms" },
    { key: "owners", label: "Owners" },
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

  return (
    <>
      <div className="w-full relative ctWrapper">
        <Header />
      </div>
      <div className="ctWrapper flex gap-10 px-4 pb-5 md:flex-nowrap flex-wrap mb-10">
        {/* Column 2, hide on mobile 
        <aside className="block md:w-[300px] md:hidden">
          <div className="mt-1 mb-4">
            <PayCard />
          </div>
        </aside>*/}
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
                          className={`pr-4 py-2 -mb-px gap-2 font-medium transition-colors duration-150 focus:outline-none ${
                            selectedTab === tab.key
                              ? "underline text-color"
                              : "text-muted-foreground hover:underline"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                </div>
              </aside>
              {/* Tab Content */}
              <div>
                {selectedTab === "activity" && (
                  <div className="pb-5">
                    <ActivityFeed />
                  </div>
                )}
                {selectedTab === "terms" && (
                  <div className="pb-5">
                    <NetworkDetailsTable />
                  </div>
                )}
                {selectedTab === "owners" && (
                  <div className="pb-5">
                    <HoldersSection />
                  </div>
                )}
                {selectedTab === "about" && (
                  <div className="pb-5">
                    <DescriptionSection />
                  </div>
                )}
              </div>
            </section>
          </div>
          {/* Render Pay and activity after header on mobile */}
        </div>
        <div className="md:block hidden">
            {/*{selectedTab !== "activity" && (*/}
              <div className="mt-1 mb-4">
                <PayCard />
              </div>
            {/*})}*/}
        </div>
      </div>
    </>
  );
}
