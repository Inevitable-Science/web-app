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

export function NetworkDashboard() {
  const { contracts } = useJBContractContext();
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const [selectedTab, setSelectedTab] = useState("activity");

  const tabs = [
    { key: "activity", label: "Activity" },
    { key: "terms", label: "Terms" },
    { key: "owners", label: "Owners" },
    { key: "about", label: "About" },
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
      <div className="w-full px-4 sm:container pt-6">
        <Header />
      </div>
      <div className="flex gap-10 w-full px-4 sm:container pb-5 md:flex-nowrap flex-wrap mb-10">
        {/* Column 2, hide on mobile */}
        <aside className="hidden md:w-[300px] md:block">
          <div className="mt-1 mb-4">
            <PayCard />
          </div>
        </aside>
        {/* Column 1 */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto">
            <section className="mb-10">
              {/* Tabs */}
              <div className="flex mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key)}
                    className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors duration-150 focus:outline-none ${
                      selectedTab === tab.key
                        ? "border-black text-black"
                        : "border-transparent text-zinc-400 hover:text-black"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
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
          <div className="sm:hidden">
            {selectedTab !== "activity" && (
              <div className="mt-1 mb-4">
                <PayCard />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
