"use client";
import { Header } from "./Header";
import { TabType, useLegacyProjectStore } from "../DataProvider";
import { TabContent } from "./TabsContent";
import { OtherDaosCarousel } from "@/app/rev/[...slug]/components/layout/OtherDaosCarousel";

import { TabSelectorLG, TabSelectorSM } from "./TabSelector";
import { useEffect, useMemo, useState } from "react";
import { SwapWidget } from "./swapWidget/SwapWidget";

export interface TabTypeArray {
  key: TabType;
  label: string;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);

    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function DaoPage() {
  const isMobile = useIsMobile();
  const daoData = useLegacyProjectStore((state) => state.daoData);
  const tokenAnalytics = useLegacyProjectStore((state) => state.tokenAnalytics);
  const treasuryAnalytics = useLegacyProjectStore(
    (state) => state.treasuryAnalytics
  );

  const tabs = [
    { key: "about", label: "About" },
    { key: "activity", label: "Activity" },
    ...(!daoData
      ? []
      : [
          ...(tokenAnalytics ? [{ key: "analytics", label: "Analytics" }] : []),
          ...(treasuryAnalytics
            ? [{ key: "treasury", label: "Treasury" }]
            : []),
        ]),
  ] as TabTypeArray[];

  const swapWidget = useMemo(() => {
    if (!tokenAnalytics?.selectedToken.address) return null;

    return <SwapWidget token={tokenAnalytics.selectedToken.address} />;
  }, [tokenAnalytics?.selectedToken.address]);

  return (
    <>
      <div className="relative w-full">
        <div className="absolute inset-0 -z-10 w-full bg-[url('https://cdn.inevitable.science/static/img/dao_landing.webp')] bg-cover bg-center"></div>
        <Header />
      </div>

      <div className="ctWrapper mb-10 flex flex-wrap gap-10 px-4 pb-5 sm:mb-24 md:flex-nowrap">
        <TabSelectorLG tabs={tabs} />

        {/* Column 1 */}
        <div className="flex-1">
          <div className="block md:hidden">
            {isMobile === true && (
              <div className="mt-1 max-h-[700px]">{swapWidget}</div>
            )}
          </div>

          <div className="mx-auto max-w-4xl">
            <section className="mb-10">
              <TabSelectorSM tabs={tabs} />

              <div className="sm:min-h-[700px]">
                <TabContent />
              </div>
            </section>
          </div>
        </div>

        <div className="hidden w-full md:block md:w-[340px] lg:w-[400px]">
          {isMobile === false && <div className="mb-4">{swapWidget}</div>}
        </div>
      </div>

      <OtherDaosCarousel />
    </>
  );
}
