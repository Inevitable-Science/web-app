"use client"
import { ArrowRightIcon } from "lucide-react";
import { TabType, useLegacyProjectStore } from "@/store/LegacyProjectContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { vestingContracts } from "../vesting/constants";

export interface TabTypeArray {
  key: TabType;
  label: string;
}

function useProjectTabs() {
  const daoData = useLegacyProjectStore((state) => state.daoData);
  const tokenAnalytics = useLegacyProjectStore((state) => state.tokenAnalytics);
  const treasuryAnalytics = useLegacyProjectStore((state) => state.treasuryAnalytics);
  const vestingContract = vestingContracts.find(d => d.name === daoData.name.toLowerCase());

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
    ...(vestingContract ? [
      { key: "vesting", label: "Vesting" },
    ] : [])
  ] as TabTypeArray[];
  
  return tabs;
};

export function TabSelectorSM() {
  const daoData = useLegacyProjectStore((state) => state.daoData);
  const tabs = useProjectTabs();

  const pathname = usePathname();
  const finalSegment = pathname.split('/').pop();
  const selectedTab = finalSegment?.toLowerCase() === daoData.name.toLowerCase() ?
    "about" :
    finalSegment;

  return (
    <aside className="block lg:hidden">
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const projectSlug = tab.key === "about" ? 
            `/project/${daoData.name.toLowerCase()}` : 
            `/project/${daoData.name.toLowerCase()}/${tab.key}`;
          
          return (
            <Link href={projectSlug} key={tab.key}>
              <button
                className={`-mb-px flex items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-hidden ${
                  selectedTab === tab.key
                    ? "bg-gunmetal"
                    : "text-muted-foreground hover:bg-grey-450 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            </Link>
          )
        })}
      </div>
    </aside>
  );
}

export function TabSelectorLG() {
  const daoData = useLegacyProjectStore((state) => state.daoData);
  const tabs = useProjectTabs();

  const pathname = usePathname();
  const finalSegment = pathname.split('/').pop();
  const selectedTab = finalSegment?.toLowerCase() === daoData.name.toLowerCase() ?
    "about" :
    finalSegment;

  return (
    <aside className="hidden max-w-54 lg:block">
      <div className="mb-6 flex min-w-[110px] flex-col items-start gap-2">
        {tabs.map((tab) => {
          const projectSlug = tab.key === "about" ? 
            `/project/${daoData.name.toLowerCase()}` : 
            `/project/${daoData.name.toLowerCase()}/${tab.key}`;

          return (
            <Link href={projectSlug} key={tab.key}>
              <button
                className={`-mb-px flex items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-hidden ${
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
            </Link>
          )
        })}
      </div>
    </aside>
  );
}
