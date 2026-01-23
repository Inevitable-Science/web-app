"use client"
import { ArrowRight } from "lucide-react";
import { SelectedTabType, useRevnetDataStore } from "@/store/RevnetDataContext";
import { usePathname } from "next/navigation";
import Link from "next/link";

export interface TabType {
  key: SelectedTabType;
  label: string;
}

function useProjectTabs() {
  const tokenAnalytics = useRevnetDataStore((state) => state.tokenAnalytics);
  const treasuryAnalytics = useRevnetDataStore(
    (state) => state.treasuryAnalytics
  );

  const tabs = [
    { key: "about", label: "About" },
    { key: "tokens", label: "Tokens" },
    { key: "activity", label: "Activity" },
    { key: "cycles", label: "Cycles" },
    ...(tokenAnalytics ? [{ key: "analytics", label: "Analytics" }] : []),
    ...(treasuryAnalytics ? [{ key: "treasury", label: "Treasury" }] : []),
  ] as TabType[];

  return tabs;
}

export function TabSelectorSM() {
  const tabs = useProjectTabs();
  const slug = useRevnetDataStore(state => state.slug);
  
  const pathname = usePathname();
  const finalSegment = pathname.split("/").pop();
  const selectedTab =
    finalSegment?.toLowerCase() === slug.toLowerCase()
      ? "about"
      : finalSegment;

  return (
    <aside className="block lg:hidden">
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const projectSlug =
            tab.key === "about"
              ? `/rev/${slug}`
              : `/rev/${slug}/${tab.key}`;

          return (
            <Link href={projectSlug} key={tab.key}>
              <button
                className={`-mb-px flex cursor-pointer items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-hidden ${
                  selectedTab === tab.key
                    ? "bg-gunmetal"
                    : "text-muted-foreground hover:bg-grey-450 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            </Link>
          )}
        )}
      </div>
    </aside>
  );
}

export function TabSelectorLG() {
  const tabs = useProjectTabs();
  const slug = useRevnetDataStore(state => state.slug);

  const pathname = usePathname();
  const finalSegment = pathname.split("/").pop();
  const selectedTab =
    finalSegment?.toLowerCase() === slug.toLowerCase()
      ? "about"
      : finalSegment;

  return (
    <aside className="hidden max-w-54 lg:block">
      <div className="mb-6 flex min-w-[110px] flex-col items-start gap-2">
        {tabs.map((tab) => {
          const projectSlug =
            tab.key === "about"
              ? `/rev/${slug}`
              : `/rev/${slug}/${tab.key}`;

          return (
            <Link href={projectSlug} key={tab.key}>
              <button
                className={`-mb-px flex cursor-pointer items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-hidden ${
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
            </Link>
          )}
        )}
      </div>
    </aside>
  );
}
