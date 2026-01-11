import { ArrowRight } from "lucide-react";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { TabType } from "./PageLayout";

export function TabSelectorSM({ tabs }: { tabs: TabType[] }) {
  const selectedTab = useRevnetDataStore((state) => state.selectedTab);
  const setSelectedTab = useRevnetDataStore((state) => state.setSelectedTab);

  return (
    <aside className="block lg:hidden">
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button
            key={`${tab.key}-${index}`}
            onClick={() => setSelectedTab(tab.key)}
            className={`-mb-px flex cursor-pointer items-center gap-2 rounded-full px-[12px] py-[8px] transition-colors duration-150 focus:outline-hidden ${
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
  );
}

export function TabSelectorLG({ tabs }: { tabs: TabType[] }) {
  const selectedTab = useRevnetDataStore((state) => state.selectedTab);
  const setSelectedTab = useRevnetDataStore((state) => state.setSelectedTab);

  return (
    <aside className="hidden max-w-54 lg:block">
      <div className="mb-6 flex min-w-[110px] flex-col items-start gap-2">
        {tabs.map((tab, index) => (
          <button
            key={`${tab.key}-${index}`}
            onClick={() => setSelectedTab(tab.key)}
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
        ))}
      </div>
    </aside>
  );
}
