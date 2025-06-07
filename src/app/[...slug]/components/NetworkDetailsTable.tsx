// src/components/NetworkDetailsTable.tsx

import {
  MAX_RULESET_COUNT,
} from "@/app/constants";
import { Button } from "@/components/ui/button";
import {
  JBRulesetData,
  JBRulesetMetadata,
  RulesetWeight,
  WeightCutPercent,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useReadJbRulesetsAllOf,
  useJBRulesetContext,
} from "juice-sdk-react";
import { useMemo, useState } from "react";
import { PriceSection } from "./NetworkDashboard/sections/PriceSection";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useFormatDaysAndHours } from "@/hooks/useFormatDuration";
import { useRulesetData } from "@/hooks/useRulesetData"; // 1. Import your new hook

import { ChevronDownIcon, ChevronUpIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export function NetworkDetailsTable() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);
  const [showRules, setShowRules] = useState<boolean>(true);

  // Get raw data from the context
  const { ruleset, rulesetMetadata } = useJBRulesetContext();
  const rulesetDataHolder = ruleset?.data;

  // 2. Call your custom hook to get all the formatted data in one place
  const { cyclesData, tokenData, otherRulesData } = useRulesetData({
    ruleset: ruleset?.data as  JBRulesetData,
    metadata: rulesetMetadata?.data as JBRulesetMetadata,
  });

  // --- Logic that remains component-specific (like countdowns) stays here ---
  const targetDateForCountdownHook = useMemo(() => {
    if (rulesetDataHolder?.start !== undefined && rulesetDataHolder?.duration !== undefined) {
      const s = Number(rulesetDataHolder.start);
      const d = Number(rulesetDataHolder.duration);
      if (!isNaN(s) && !isNaN(d) && (s > 0 || d > 0) ) {
        return new Date((s + d) * 1000);
      }
    }
    return undefined;
  }, [rulesetDataHolder?.start, rulesetDataHolder?.duration]);

  const countdownOutput = useCountdownToDate(targetDateForCountdownHook);
  const formattedCountdown = useFormatDaysAndHours(countdownOutput? countdownOutput : 0);

  // --- Logic for selecting different historical stages (rulesets) also stays ---
  const { projectId } = useJBContractContext();
  const { data: rulesets } = useReadJbRulesetsAllOf({
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
    query: {
      select(data) {
        return data.map((rs) => ({
          ...rs,
          weight: new RulesetWeight(rs.weight),
          weightCutPercent: new WeightCutPercent(rs.weightCutPercent),
        })).reverse();
      },
    },
  });

  const selectedStage = rulesets?.[selectedStageIdx];
  if (!selectedStage) return null;

  const formatLabel = (key: string) => {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
  };

  return (
    <div>
      <div className="bg-grey-450 p-[12px] rounded-2xl mb-4">
        {/* Top grid with cycle #, status, etc. */}
        <div className="grid grid-cols-3 gap-3">
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">{rulesetDataHolder?.cycleNumber ?? '-'}</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Cycle #</p>
          </div>
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              {rulesetDataHolder ? (rulesetDataHolder.start <= (Date.now() / 1000) ? "Unlocked" : "Locked") : '-'}
            </h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Status</p>
          </div>
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">{formattedCountdown ?? '-'}</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Time Remaining</p>
          </div>
        </div>

        {/* Rules section */}
        <div className="background-color p-[16px] rounded-xl mt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-light uppercase">Current Cycle</p>
              <h3 className="text-xl">Rules</h3>
            </div>
            <Button variant={"ghost"} className="w-8 h-8 p-0 rounded" onClick={() => setShowRules(prev => !prev)}>
              {showRules ? <ChevronDownIcon height="24" width="24" /> : <ChevronUpIcon height="24" width="24" />}
            </Button>
          </div>
          
          {showRules && (
            <>
              {/* Cycles Section */}
              <div className="mb-6">
                <h2 className="text-grey-50 mt-4">CYCLES</h2>
                <div>
                  {/* 3. Consume the data from the hook */}
                  {Object.entries(cyclesData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm py-3 border-b border-grey-450 text-grey-50 font-light">
                      <span>{formatLabel(key)}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Token Section */}
              <div className="mb-6">
                <h2 className="text-grey-50 mt-4">TOKEN</h2>
                <div>
                  {Object.entries(tokenData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm py-3 border-b border-grey-450 text-grey-50 font-light">
                      <span>{formatLabel(key)}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Rules Section */}
              <div>
                <h2 className="text-grey-50 mt-4">OTHER RULES</h2>
                <div>
                  {Object.entries(otherRulesData).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center text-sm py-3 border-b border-grey-450 text-grey-50 font-light">
                      <span>{formatLabel(key)}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Treasury section */}
      <div className="bg-grey-450 p-[12px] rounded-2xl flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">Ξ1,113.88</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">TREASURY BALANCE</p>
          </div>
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">None</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">OVERFLOW</p>
          </div>
        </div>
        <div className="background-color p-[16px] rounded-xl">
          <h3 className="text-xl">Ξ0</h3>
          <p className="text-sm text-muted-foreground font-light uppercase">AVAILABLE TO PAYOUT</p>
        </div>
        <div className="background-color p-[16px] rounded-xl">
          <p className="text-sm text-muted-foreground font-light uppercase">AVAILABLE TO PAYOUT</p>
          <div className="flex items-center justify-between my-1">
            <h3 className="text-xl">daohydra.eth</h3>
            <p className="text-sm">100%</p>
          </div>
          <Button variant="link" className="h-6 pl-0 flex items-center gap-1.5 font-normal uppercase transition-[gap] duration-150 hover:gap-3">
            Treasury Stats
            <ArrowRightIcon height="20" width="20" />
          </Button>
        </div>
      </div>

      <div className="mt-2 text-black text-md max-w-sm sm:max-w-full">
        <PriceSection className="mb-2" />
      </div>
    </div>
  );
}