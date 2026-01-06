// src/components/NetworkDetailsTable.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  JBRulesetData,
  JBRulesetMetadata,
  ReservedPercent,
} from "juice-sdk-core";
import { useJBContractContext, useNativeTokenSurplus } from "juice-sdk-react";
import { useMemo, useState, useEffect } from "react";
import { useCountdownToDate } from "@/hooks/useCountdownToDate";
import { useFormatDaysAndHours } from "@/hooks/useFormatDuration";
import { useRulesetData } from "@/hooks/useRulesetData";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

import { formatEther } from "viem";
import { ChevronDown, ChevronRightIcon, ChevronUp } from "lucide-react";
import { decodeRulesetMetadata } from "@/lib/utils";
import {
  IssuancePriceChart,
  ProjectionRange,
} from "./issuanceChart/IssuancePriceChart";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";

export function NetworkDetailsTable() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  const [showRules, setShowRules] = useState<boolean>(true);
  const [range, setRange] = useState<ProjectionRange>("1y");

  // Get raw data from the context
  //const { ruleset: currentRuleset, project } = useProjectContext();
  const project = useRevnetDataStore((state) => state.project);
  const currentRuleset = useRevnetDataStore((state) => state.ruleset);
  const { data: nativeTokenSurplus } = useNativeTokenSurplus();
  const currentIssuance = useFormattedTokenIssuance({
    reservedPercent: new ReservedPercent(0),
  });

  const { allRulesets } = useRulesetData({
    projectId: project.projectId,
  });
  console.log(allRulesets, "all rulesets");

  const sortedRulesets = useMemo(() => {
    if (!allRulesets) return undefined;
    return [...allRulesets];
  }, [allRulesets]);

  useEffect(() => {
    // FIX: Only set the index if data is ready AND the index hasn't been set yet.
    if (sortedRulesets && currentRuleset && selectedStageIdx === null) {
      const currentIndex = sortedRulesets.findIndex(
        (rs) => rs.cycleNumber === currentRuleset.cycleNumber
      );

      if (currentIndex !== -1) {
        setSelectedStageIdx(currentIndex);
      } else {
        // Fallback: If current can't be found (edge case), default to the latest cycle.
        setSelectedStageIdx(
          sortedRulesets.length > 0 ? sortedRulesets.length - 1 : 0
        );
      }
    }
    // The dependency array is now safer because the logic inside prevents re-triggers.
  }, [sortedRulesets, currentRuleset, selectedStageIdx]);

  const displayedRuleset = useMemo(() => {
    // FIX: Handle the case where selectedStageIdx is null
    if (sortedRulesets === undefined || selectedStageIdx === null)
      return undefined;
    return sortedRulesets[selectedStageIdx] as JBRulesetData | undefined;
  }, [sortedRulesets, selectedStageIdx]);

  const decodedCurrentMetadata = useMemo(() => {
    if (allRulesets && displayedRuleset) {
      const decoded = decodeRulesetMetadata(displayedRuleset.metadata);
      return decoded;
    }
  }, [displayedRuleset, allRulesets]);

  // NEW: 5. Call the formatting hook with the **displayed** ruleset and metadata.
  const { cyclesData, tokenData, otherRulesData } = useRulesetData({
    ruleset: displayedRuleset,
    metadata: decodedCurrentMetadata as JBRulesetMetadata | undefined,
    projectId: project.projectId,
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

  const countdownOutput = useFormatDaysAndHours(
    useCountdownToDate(targetDateForCountdownHook) || 0
  );

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
    const reservedRateNumber = parseFloat(
      tokenData.reservedRate.replace("%", "")
    );
    if (isNaN(reservedRateNumber)) return 0;
    const payoutMultiplier = 1 - reservedRateNumber / 100;
    return surplusInEther * payoutMultiplier;
  }, [nativeTokenSurplus, tokenData?.reservedRate]);

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // NEW: Handlers for the cycle navigation buttons
  const handleNextCycle = () => {
    setSelectedStageIdx((prev) =>
      prev != undefined && prev != 0 ? Math.max(0, prev - 1) : null
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-grey-450 rounded-xl py-[16px] pr-[16px]">
        <div className="flex items-center justify-between pl-[16px]">
          <div className="mb-1">
            <p className="text-muted-foreground text-sm leading-[16px] font-light uppercase">
              Issuing
            </p>
            <h1 className="text-lg leading-[24px] font-light">
              {currentIssuance}
            </h1>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant={"graphRounded"}
              onClick={() => setRange("1y")}
              disabled={range === "1y"}
            >
              1y
            </Button>
            <Button
              variant={"graphRounded"}
              onClick={() => setRange("5y")}
              disabled={range === "5y"}
            >
              5y
            </Button>
            <Button
              variant={"graphRounded"}
              onClick={() => setRange("10y")}
              disabled={range === "10y"}
            >
              10y
            </Button>
            <Button
              variant={"graphRounded"}
              onClick={() => setRange("20y")}
              disabled={range === "20y"}
            >
              20y
            </Button>
            <Button
              variant={"graphRounded"}
              onClick={() => setRange("all")}
              disabled={range === "all"}
            >
              All
            </Button>
          </div>
        </div>

        <IssuancePriceChart range={range} />
      </div>

      <div className="bg-grey-450 rounded-2xl p-[12px]">
        {/* Top grid with cycle #, status, etc. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {/* NEW: Updated Cycle # display and wired up buttons */}
          <div className="background-color flex items-center justify-between rounded-xl p-[16px]">
            <div className="flex flex-col">
              <p className="text-muted-foreground text-sm font-light uppercase">
                Cycle
              </p>
              <h3 className="text-xl">
                {displayedRuleset?.cycleNumber ?? "-"}
              </h3>
            </div>
            <div className="flex gap-1">
              <Button
                variant={"ghost"}
                className="h-8 w-8 rounded p-0"
                onClick={handleNextCycle}
                disabled={selectedStageIdx === null}
              >
                <ChevronRightIcon height="24" width="24" />
              </Button>
            </div>
          </div>
          <div className="background-color rounded-xl p-[16px]">
            <h3 className="text-xl">
              {displayedRuleset
                ? Number(displayedRuleset.start) <= Date.now() / 1000
                  ? "Active"
                  : "Upcoming"
                : "-"}
            </h3>
            <p className="text-muted-foreground text-sm font-light uppercase">
              Status
            </p>
          </div>
          <div className="background-color flex items-center justify-center rounded-xl p-[16px]">
            <h3 className="text-center text-sm">
              {displayTimeRemaining ?? "-"}
            </h3>
          </div>
        </div>

        {/* Rules section */}
        <div className="background-color mt-3 rounded-xl p-[16px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-light uppercase">
                Rules for this cycle
              </p>
              <h3 className="text-xl">Details</h3>
            </div>
            <Button
              variant={"ghost"}
              className="h-8 w-8 rounded p-0"
              onClick={() => setShowRules((prev) => !prev)}
            >
              {showRules ? (
                <ChevronDown height="24" width="24" />
              ) : (
                <ChevronUp height="24" width="24" />
              )}
            </Button>
          </div>

          {showRules && (
            <>
              {/* Cycles Section */}
              <div className="mb-6">
                <h2 className="text-grey-50 mt-4">CYCLES</h2>
                <div>
                  {Object.entries(cyclesData).map(([key, value]) => (
                    <div
                      key={key}
                      className="border-grey-450 text-grey-50 flex items-center justify-between border-b py-3 text-sm font-light"
                    >
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
                    <div
                      key={key}
                      className="border-grey-450 text-grey-50 flex items-center justify-between border-b py-3 text-sm font-light"
                    >
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
                    <div
                      key={key}
                      className="border-grey-450 text-grey-50 flex items-center justify-between border-b py-3 text-sm font-light"
                    >
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

      <div className="bg-grey-450 flex flex-col gap-3 rounded-2xl p-[12px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <div className="background-color rounded-xl p-[16px]">
            <h3 className="text-xl">
              Ξ{parseFloat(formatEther(project.volume)).toFixed(2)}
            </h3>
            <p className="text-muted-foreground text-sm font-light uppercase">
              Total Raised
            </p>
          </div>
          <div className="background-color rounded-xl p-[16px]">
            <h3 className="text-xl">Ξ{availableToPayout.toFixed(2)}</h3>
            <p className="text-muted-foreground text-sm font-light uppercase">
              Overflow
            </p>
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
