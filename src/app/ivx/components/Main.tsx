"use client"
import { useIVXContext } from "../DataProvider";
import { IvxPageHeader } from "./layout/Header";
import { IvxTreasuryAnalytics } from "./layout/TreasuryAnalytics";
import RuleTable from "./layout/RulesTable";
import { PortfolioPeformance } from "./layout/PortfolioPeformance";
import { HoldersTable } from "./layout/HoldersTable";

export default function MainIvxLayout() {
  const { analyticsData, ruleset: currentRuleset, project } = useIVXContext();

  return(
    <>
      <div className="">
        <div className="absolute z-[-1] bg-[url('/assets/img/ivx_backdrop.png')] bg-cover bg-center w-full h-[70vh]"></div>
        <div className="ctWrapper pt-[140px]">
          <div className="grid gap-4 grid-cols-[420px_1fr]">
            <h1 className="text-5xl font-extralight">
              This Is Where the <span className="text-primary">Impossible</span> Begins.
            </h1>
            <p className="text-md font-light md:text-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>

          <div className="my-[82px]">
            <IvxPageHeader />

            <div className="flex flex-col gap-[12px]">
              <IvxTreasuryAnalytics />

              <div className="">
                <RuleTable />

                <PortfolioPeformance />
              </div>

              <div>
                <HoldersTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}