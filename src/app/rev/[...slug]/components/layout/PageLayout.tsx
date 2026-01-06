"use client";
import { useJBContractContext } from "juice-sdk-react";
import { notFound } from "next/navigation";
import { zeroAddress } from "viem";
import { PayCard } from "../payCard/PayCardWrapper";
import { Header } from "./Header";
import { TabContent } from "./TabContent";
import { OtherDaosCarousel } from "./OtherDaosCarousel";
import { SelectedTabType, useProjectDataStore } from "../../../../../store/RevnetDataContext";
import { TabSelectorLG, TabSelectorSM } from "./TabSelector";

export interface TabType {
  key: SelectedTabType;
  label: string;
}

export function PageLayout() {
  const daoData = useProjectDataStore((state) => state.daoData);
  const tokenAnalytics = useProjectDataStore((state) => state.tokenAnalytics);
  const treasuryAnalytics = useProjectDataStore(
    (state) => state.treasuryAnalytics
  );
  const { contracts } = useJBContractContext();

  const tabs = [
    { key: "about", label: "About" },
    { key: "tokens", label: "Tokens" },
    { key: "activity", label: "Activity" },
    { key: "cycles", label: "Cycles" },
    ...(daoData === null
      ? []
      : [
          ...(tokenAnalytics ? [{ key: "analytics", label: "Analytics" }] : []),
          ...(treasuryAnalytics
            ? [{ key: "treasury", label: "Treasury" }]
            : []),
        ]),
  ] as TabType[];

  if (contracts.controller.data === zeroAddress) {
    notFound();
  }

  return (
    <>
      <div className="relative w-full">
        <div className="absolute inset-0 -z-10 w-full bg-[url('https://cdn.inevitable.science/static/img/dao_landing.webp')] bg-cover bg-center"></div>
        <Header />
      </div>
      <div className="ctWrapper mb-10 flex flex-wrap gap-8 px-4 pb-5 sm:mb-24 md:flex-nowrap">
        <TabSelectorLG tabs={tabs} />

        {/* Column 1 */}
        <div className="flex-1">
          <div className="block md:hidden">
            <div className="mt-1 mb-4">
              <PayCard />
            </div>
          </div>

          <div className="mx-auto max-w-4xl">
            <section className="mb-10">
              <TabSelectorSM tabs={tabs} />

              <TabContent />
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
