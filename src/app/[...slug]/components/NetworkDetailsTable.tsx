// src/components/NetworkDetailsTable.tsx
import { Button } from "@/components/ui/button";
import {
  JBRulesetData,
  JBRulesetMetadata,
} from "juice-sdk-core";
import {
  useNativeTokenSurplus,
} from "juice-sdk-react";
import { useMemo, useState, useEffect } from "react";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useFormatDaysAndHours } from "@/hooks/useFormatDuration";
import { useRulesetData } from "@/hooks/useRulesetData";
import { useNetworkData } from "./NetworkDashboard/NetworkDataContext";

import { ChevronDownIcon, ChevronUpIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { formatEther } from "viem";
import { SplitsSection } from "./NetworkDashboard/sections/HoldersSection/SplitsSection";
import { ChevronRightIcon } from "lucide-react";
import { decodeRulesetMetadata} from "@/lib/utils";

interface NetworkDetailsParams {
  analyticsError: string | null;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

export function NetworkDetailsTable() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  const [showRules, setShowRules] = useState<boolean>(true);

  // Get raw data from the context
  const { ruleset: currentRuleset, project } = useNetworkData();
  const { data: nativeTokenSurplus } = useNativeTokenSurplus();

  const { allRulesets, isLoadingAllRulesets } = useRulesetData({
    projectId: project.projectId
  });

  const sortedRulesets = useMemo(() => {
    if (!allRulesets) return undefined;
    return [...allRulesets];
  }, [allRulesets]);

  useEffect(() => {
  // FIX: Only set the index if data is ready AND the index hasn't been set yet.
  if (sortedRulesets && currentRuleset && selectedStageIdx === null) {
    const currentIndex = sortedRulesets.findIndex(rs => rs.cycleNumber === currentRuleset.cycleNumber);

    if (currentIndex !== -1) {
      setSelectedStageIdx(currentIndex);
    } else {
      // Fallback: If current can't be found (edge case), default to the latest cycle.
      setSelectedStageIdx(sortedRulesets.length > 0 ? sortedRulesets.length - 1 : 0);
    }
  }
  // The dependency array is now safer because the logic inside prevents re-triggers.
}, [sortedRulesets, currentRuleset, selectedStageIdx]);

  const displayedRuleset = useMemo(() => {
  // FIX: Handle the case where selectedStageIdx is null
  if (sortedRulesets === undefined || selectedStageIdx === null) return undefined;
  return sortedRulesets[selectedStageIdx] as JBRulesetData | undefined;
}, [sortedRulesets, selectedStageIdx]);

  const decodedCurrentMetadata = useMemo (() => {
    if (allRulesets && displayedRuleset) {
    const decoded = decodeRulesetMetadata(displayedRuleset.metadata);
    return decoded;
    }
  }, [displayedRuleset, allRulesets]);

  // NEW: 5. Call the formatting hook with the **displayed** ruleset and metadata.
  const { cyclesData, tokenData, otherRulesData } = useRulesetData({
    ruleset: displayedRuleset,
    metadata: decodedCurrentMetadata as JBRulesetMetadata | undefined,
    projectId: project.projectId
  });

  // FIX 1: Make the target date for the countdown hook dynamic
  const targetDateForCountdownHook = useMemo(() => {
    if (!displayedRuleset) return undefined;

    const start = Number(displayedRuleset.start); // In seconds
    const duration = Number(displayedRuleset.duration); // In seconds
    const nowInSeconds = Date.now() / 1000;

    // Don't need a countdown for continuous or already ended cycles
    if (duration === 0 || start + duration < nowInSeconds) {
      return undefined;
    }

    // If the cycle is UPCOMING, countdown to the START time
    if (start > nowInSeconds) {
      return new Date(start * 1000);
    }

    // If the cycle is ACTIVE, countdown to the END time
    return new Date((start + duration) * 1000);
  }, [displayedRuleset]);

  const countdownOutput = useFormatDaysAndHours(useCountdownToDate(targetDateForCountdownHook) || 0);

    // FIX 2: Create a final display string that handles all cycle states
  const displayTimeRemaining = useMemo(() => {
    if (!displayedRuleset) return "-";

    const start = Number(displayedRuleset.start);
    const duration = Number(displayedRuleset.duration);
    const nowInSeconds = Date.now() / 1000;

    // Case 1: Continuous cycle. Highest priority.
    if (duration === 0) {
      return "Unlocked";
    }

    // Case 2: Cycle has already ended.
    if (start + duration < nowInSeconds) {
      return null;
    }

    // Case 3: Cycle is upcoming.
    if (start > nowInSeconds) {
      // The `countdownOutput` is now correctly counting down to the start time.
      // We can add a prefix for clarity.
      return `Starts in ${countdownOutput ?? "..."}`;
    }

    // Case 4: Cycle is active.
    // The `countdownOutput` is correctly counting down to the end time.
    return countdownOutput ?? "...";

  }, [displayedRuleset, countdownOutput]);

  const availableToPayout = useMemo(() => {
    if (!nativeTokenSurplus || !tokenData?.reservedRate) return 0;
    const surplusInEther = parseFloat(formatEther(nativeTokenSurplus));
    const reservedRateNumber = parseFloat(tokenData.reservedRate.replace("%", ""));
    if (isNaN(reservedRateNumber)) return 0;
    const payoutMultiplier = 1 - (reservedRateNumber / 100);
    return surplusInEther * payoutMultiplier;
  }, [nativeTokenSurplus, tokenData?.reservedRate]);

  const formatLabel = (key: string) => {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
  };

  // NEW: Handlers for the cycle navigation buttons
  const handleNextCycle = () => {
    setSelectedStageIdx(prev => (prev != undefined && prev != 0) ? Math.max(0, prev - 1) : null);
  };

  return (
    <div>
      <div className="bg-grey-450 p-[12px] rounded-2xl mb-4">
        {/* Top grid with cycle #, status, etc. */}
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          {/* NEW: Updated Cycle # display and wired up buttons */}
          <div className="background-color p-[16px] rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground font-light uppercase">Cycle</p>
              <h3 className="text-xl">
                {displayedRuleset?.cycleNumber ?? "-"}
              </h3>
            </div>
            <div className="flex gap-1">
              <Button variant={"ghost"} className="w-8 h-8 p-0 rounded" onClick={handleNextCycle} disabled={selectedStageIdx === null}>
                <ChevronRightIcon height="24" width="24" />
              </Button>
            </div>
          </div>
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              {displayedRuleset ? (Number(displayedRuleset.start) <= (Date.now() / 1000) ? "Active" : "Upcoming") : "-"}
            </h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Status</p>
          </div>
          <div className="background-color p-[16px] rounded-xl flex items-center justify-center">
            <h3 className="text-sm text-center">{displayTimeRemaining ?? "-"}</h3>
          </div>
        </div>

        {/* Rules section */}
        <div className="background-color p-[16px] rounded-xl mt-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-light uppercase">Rules for this cycle</p>
              <h3 className="text-xl">Details</h3>
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

      {/* --- The rest of the component remains the same --- */}

      <div className="bg-grey-450 p-[12px] rounded-2xl flex flex-col gap-3">
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">Ξ{parseFloat(formatEther(project.volume)).toFixed(2)}</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Total Raised</p>
          </div>
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">Ξ{availableToPayout.toFixed(2)}</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Overflow</p>
          </div>
        </div>
        {/*<div className="background-color p-[16px] rounded-xl">
          <p className="text-sm text-muted-foreground font-light uppercase">Payouts</p>
            <SplitsSection/>

            {analyticsData?.treasuryData && (
              <Button
                onClick={() => setSelectedTab("treasury")}
                variant="link"
                className="h-6 pl-0 flex items-center gap-1.5 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
              >
                Treasury Stats
                <ArrowRightIcon height="20" width="20" />
              </Button>
            )}
        </div>*/}
      </div>
    </div>
  );
}