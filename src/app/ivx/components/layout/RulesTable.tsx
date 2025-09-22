"use client"
import { decodeRulesetMetadata } from "@/lib/utils";
import { useIVXContext } from "../../DataProvider";
import { useJBContractContext, useNativeTokenSurplus } from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import { useRulesetData } from "@/hooks/useRulesetData";
import { JBRulesetData, JBRulesetMetadata } from "juice-sdk-core";

export default function RuleTable() {
  const { analyticsData, ruleset: currentRuleset, project } = useIVXContext();
  const { projectId } = useJBContractContext();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number | null>(null);
  
  const [nextStageIdx, setNextStageIdx] = useState<number | null>(null);
  
  const { allRulesets, isLoadingAllRulesets } = useRulesetData({
    projectId: Number(projectId),
  });

  const sortedRulesets = useMemo(() => {
    if (!allRulesets) return undefined;
    return [...allRulesets];
  }, [allRulesets]);

  useEffect(() => {
    // FIX: Only set the index if data is ready AND the index hasn't been set yet.
    if (sortedRulesets && currentRuleset && selectedStageIdx === null && nextStageIdx === null) {
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

      if (selectedStageIdx === sortedRulesets.length) {
        setNextStageIdx(selectedStageIdx);
      } else {
        const nextIndex = Math.min((selectedStageIdx ?? 0) + 1, sortedRulesets.length);
        setNextStageIdx(nextIndex);
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

  const displayedRulesetSecond = useMemo(() => {
    // FIX: Handle the case where selectedStageIdx is null
    if (sortedRulesets === undefined || nextStageIdx === null)
      return undefined;
    return sortedRulesets[nextStageIdx] as JBRulesetData | undefined;
  }, [sortedRulesets, nextStageIdx]);

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
    projectId: Number(projectId),
  });

  const { cyclesData: secondCycleData, tokenData: secondTokenData, otherRulesData: secondRulesData } = useRulesetData({
    ruleset: displayedRulesetSecond,
    metadata: decodedCurrentMetadata as JBRulesetMetadata | undefined,
    projectId: Number(projectId),
  });

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return(
    <>
      <div className="">
        <div className="bg-grey-450 h-full rounded-2xl p-[12px]">
          <p className="text-grey-50 text-sm uppercase">Supply Schedule</p>
          <div className="">
            <div className="">
              <p>Issuing</p>
              <h3>{tokenData.payerIssuanceRate}</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}