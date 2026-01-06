import { ArrowRightIcon } from "lucide-react";
import { useLegacyProjectStore } from "../../../../store/LegacyProjectContext";
import { TabTypeArray } from "./DaoPage";

export function TabSelectorSM({ tabs }: { tabs: TabTypeArray[] }) {
  const selectedTab = useLegacyProjectStore((state) => state.selectedTab);
  const setSelectedTab = useLegacyProjectStore((state) => state.setSelectedTab);

  return (
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
  );
}

export function TabSelectorLG({ tabs }: { tabs: TabTypeArray[] }) {
  const selectedTab = useLegacyProjectStore((state) => state.selectedTab);
  const setSelectedTab = useLegacyProjectStore((state) => state.setSelectedTab);

  return (
    <aside className="hidden max-w-54 lg:block">
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
              <ArrowRightIcon height="18" width="18" />
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}
