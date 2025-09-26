/*"use client"
import { decodeRulesetMetadata } from "@/lib/utils";
import { useIVXContext } from "../../DataProvider";
import { useJBChainId, useJBContractContext, useJBRulesetContext, useJBTokenContext, useNativeTokenSurplus } from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import { useRulesetData } from "@/hooks/useRulesetData";
import { formatUnits, JBCoreContracts, JBRulesetData, JBRulesetMetadata, jbRulesetsAbi, ReservedPercent, RulesetWeight, WeightCutPercent } from "juice-sdk-core";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { commaNumber } from "@/lib/number";
import { useReadContract } from "wagmi";
import { MAX_RULESET_COUNT } from "@/app/constants";

export default function RuleTable() {
  const { analyticsData, ruleset: currentRuleset, project } = useIVXContext();
    const {
    projectId,
    contracts: { controller },
    contractAddress,
  } = useJBContractContext();
  const { token } = useJBTokenContext();
  const chainId = useJBChainId();
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const { ruleset, rulesetMetadata } = useJBRulesetContext();

  const { data: rulesets } = useReadContract({
    abi: jbRulesetsAbi,
    functionName: "allOf",
    address: contractAddress(JBCoreContracts.JBRulesets),
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
    query: {
      select(data) {
        return data
          .map((ruleset) => {
            return {
              ...ruleset,
              weight: new RulesetWeight(ruleset.weight),
              weightCutPercent: new WeightCutPercent(ruleset.weightCutPercent),
            };
          })
          .reverse();
      },
    },
  });
  const selectedStage = rulesets?.[selectedStageIdx];
  
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

  const devTax = rulesetMetadata?.data?.reservedPercent;

  const selectedStageBoost = selectedStateReservedTokenSplits?.[0];
  const reservedPercent = selectedStageMetadata?.data?.reservedPercent;

  const issuance = useFormattedTokenIssuance({
    weight: selectedStage?.weight,
    reservedPercent: new ReservedPercent(0), //selectedStageMetadata?.data?.reservedPercent
  });

  const autoIssuances = useAutoIssuances();
  const getAutoIssuancesTotalForStage = () => {
    if (!autoIssuances || !selectedStageIdx) return 0;
    const stageautoIssuances = autoIssuances.filter((a) => a.stage === selectedStageIdx + 1);
    return commaNumber(
      formatUnits(
        stageautoIssuances.reduce((acc, curr) => acc + BigInt(curr.count), 0n),
        token?.data?.decimals || 18,
      ),
    );
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
          <p>
            {devTax?.formatPercentage().toFixed(2)}%{" "}
            of issuance and buybacks to splits.
          </p>
          {selectedStage && (
          <p>
            {issuance} cut {selectedStage.weightCutPercent.formatPercentage()}% every{" "}
              {(selectedStage.duration / 86400).toString()} days
              {selectedStageBoost ? (
                <span className="text-md leading-6 text-zinc-700">
                  , split limit of {reservedPercent?.formatPercentage()}%.
                </span>
              ) : null}
          </p>
          )}
        </div>
      </div>
    </>
  )
}*/

"use client";

import {
  MAX_RULESET_COUNT,
  RESERVED_TOKEN_SPLIT_GROUP_ID,
} from "@/app/constants";
import { Button } from "@/components/ui/button";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { useTokenA } from "@/hooks/useTokenA";
import { commaNumber } from "@/lib/number";
import { formatTokenSymbol, rulesetStartDate } from "@/lib/utils";
import { differenceInDays, formatDate } from "date-fns";
import {
  CashOutTaxRate,
  jbControllerAbi,
  JBCoreContracts,
  jbRulesetsAbi,
  jbSplitsAbi,
  ReservedPercent,
  RulesetWeight,
  WeightCutPercent,
} from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";

export function RulesTable() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const {
    projectId,
    contracts: { controller },
    contractAddress,
  } = useJBContractContext();
  const chainId = useJBChainId();

  const { token } = useJBTokenContext();
  const tokenA = useTokenA();

  // TODO(perf) duplicate call, move to a new context
  const { data: rulesets } = useReadContract({
    abi: jbRulesetsAbi,
    functionName: "allOf",
    address: contractAddress(JBCoreContracts.JBRulesets),
    chainId,
    args: [projectId, 0n, BigInt(MAX_RULESET_COUNT)],
    query: {
      select(data) {
        return data
          .map((ruleset) => {
            return {
              ...ruleset,
              weight: new RulesetWeight(ruleset.weight),
              weightCutPercent: new WeightCutPercent(ruleset.weightCutPercent),
            };
          })
          .reverse();
      },
    },
  });

  const selectedStage = rulesets?.[selectedStageIdx];

  const selectedStageMetadata = useReadContract({
    abi: jbControllerAbi,
    functionName: "getRulesetOf",
    chainId,
    address: controller.data ?? undefined,
    args: selectedStage?.id ? [projectId, BigInt(selectedStage.id)] : undefined,
    query: {
      select([, rulesetMetadata]) {
        return {
          ...rulesetMetadata,
          cashOutTaxRate: new CashOutTaxRate(rulesetMetadata.cashOutTaxRate),
          reservedPercent: new ReservedPercent(rulesetMetadata.reservedPercent),
        };
      },
    },
  });

  const { data: selectedStateReservedTokenSplits } = useReadContract({
    abi: jbSplitsAbi,
    functionName: "splitsOf",
    chainId,
    address: contractAddress(JBCoreContracts.JBSplits),
    args:
      selectedStage && selectedStage
        ? [projectId, BigInt(selectedStage.id), RESERVED_TOKEN_SPLIT_GROUP_ID]
        : undefined,
  });
  const selectedStageBoost = selectedStateReservedTokenSplits?.[0];
  const reservedPercent = selectedStageMetadata?.data?.reservedPercent;
  const stages = rulesets?.reverse();
  const nextStageIdx = Math.max(
    stages?.findIndex((stage) => stage.start > Date.now() / 1000) ?? -1,
    1 // lower bound should be 1 (the minimum 'next stage' is 1)
  );
  const currentStageIdx = nextStageIdx - 1;

  const len = rulesets?.length ?? 0;
  const reverseSelectedIdx = len - selectedStageIdx - 1;
  const stageDayDiff = () => {
    const selectedRuleset = rulesets?.[reverseSelectedIdx];
    const selectedStart = rulesetStartDate(selectedRuleset);

    const nextRuleset = rulesets?.[reverseSelectedIdx - 1];
    const nextStart = rulesetStartDate(nextRuleset);
    if (!nextStart || !selectedStart) return "";

    const days = differenceInDays(nextStart, selectedStart);
    return `, ${days} days`;
  };

  const stageNextStart = () => {
    const selectedRuleset = rulesets?.[reverseSelectedIdx];
    const selectedStart = rulesetStartDate(selectedRuleset);

    const nextRuleset = rulesets?.[reverseSelectedIdx - 1];
    const nextStart = rulesetStartDate(nextRuleset);
    if (!nextStart || !selectedStart) return "forever";

    return formatDate(nextStart, "MMM dd, yyyy");
  };

  const issuance = useFormattedTokenIssuance({
    weight: selectedStage?.weight,
    reservedPercent: new ReservedPercent(0), //selectedStageMetadata?.data?.reservedPercent
  });

  const autoIssuances = useAutoIssuances();
  const getAutoIssuancesTotalForStage = () => {
    if (!autoIssuances) return 0;
    const stageautoIssuances = autoIssuances.filter(
      (a) => a.stage === selectedStageIdx + 1
    );
    return commaNumber(
      formatUnits(
        stageautoIssuances.reduce((acc, curr) => acc + BigInt(curr.count), 0n),
        token?.data?.decimals || 18
      )
    );
  };
  if (!selectedStage) return null;

  return (
    <div className="text-md max-w-sm text-black sm:max-w-full">
      <h3 className="text-md font-semibold">Current</h3>
      <h3 className="text-md mt-6 font-semibold">All</h3>
      <div className="mb-2 mt-2 font-light italic text-black">
        {formatTokenSymbol(token)}'s issuance and cash out terms change
        automatically in permanent sequential stages.
      </div>
      <div className="mb-2">
        <div className="mb-2 flex gap-4">
          {rulesets?.map((ruleset, idx) => {
            return (
              <Button
                variant={
                  selectedStageIdx === idx ? "tab-selected" : "bottomline"
                }
                className={twJoin(
                  "text-md text-zinc-400",
                  selectedStageIdx === idx && "text-inherit"
                )}
                key={ruleset.id.toString() + idx}
                onClick={() => setSelectedStageIdx(idx)}
              >
                Stage {idx + 1}
                {idx === currentStageIdx && (
                  <span className="ml-1 h-2 w-2 rounded-full border-[2px] border-orange-200 bg-orange-400"></span>
                )}
              </Button>
            );
          })}
        </div>
        <div className="text-md mb-2 text-zinc-500">
          {formatDate(
            new Date(Number(selectedStage.start) * 1000),
            "MMM dd, yyyy"
          )}{" "}
          - {stageNextStart()}
          {stageDayDiff()}
        </div>
        <div className="grid gap-1 gap-x-8 overflow-x-scroll sm:grid-cols-1">
          <div className="grid grid-cols-2 sm:col-span-1 sm:grid-cols-4 sm:px-0">
            <dt className="text-md font-medium leading-6 text-zinc-900">
              <div className="flex flex-row space-x-1">
                <div>Paid issuance</div>
                <div className="max-w-md space-y-2 p-2">
                  <div className="space-y-1">
                    <h3 className="text-black-500 font-bold">Paid Issuance</h3>
                    <p className="text-md text-black-400">
                      Determines how many {formatTokenSymbol(token)} are created
                      when this revnet receives funds during a stage.
                    </p>

                    <div className="text-md mt-4 text-zinc-600">
                      <span className="italic">
                        Note:
                        <ul className="list-inside list-disc space-y-2 pl-4">
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              If there's a market for {formatTokenSymbol(token)}{" "}
                              / {tokenA.symbol} offering a better price, all{" "}
                              {tokenA.symbol} paid in will be used to buyback
                              instead of feeding the revnet. Uniswap is used as
                              the market.
                            </div>
                          </li>
                        </ul>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-black-500 font-bold">Split limit</h3>
                    <p className="text-md text-black-400">
                      Determines how much of {formatTokenSymbol(token)} issuance
                      is set aside to be split among recipients defined by the
                      split operator during a stage.
                    </p>
                    <p className="text-md text-black-400">
                      The operator is the account that can change the split
                      recipients, within the permanent split limit amount of a
                      stage. See the "Owners" table for the current breakdown.
                    </p>
                    <div className="text-md mt-4 text-zinc-600">
                      <span className="italic">
                        Note:
                        <ul className="list-inside list-disc space-y-2 pl-4">
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              Splits apply to both issuance and buybacks.
                            </div>
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              You can write and deploy a custom split hook that
                              automatically receives and processes the split{" "}
                              {formatTokenSymbol(token)}. See{" "}
                              <a
                                className="underline"
                                target="_blank"
                                href="https://docs.juicebox.money/v4/build/hooks/split-hook/"
                              >
                                {" "}
                                the docs.
                              </a>
                            </div>
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              If there are splits, the operator can change the
                              distribution of the split limit to new
                              destinations at any time.
                            </div>
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              The operator can be a multisig, a DAO, an LLC, a
                              core team, an airdrop stockpile, a staking rewards
                              contract, or some other address.
                            </div>
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              The operator is set once and is not bound by
                              stages. The operator can hand off this
                              responsibility to another address at any time, or
                              relinquish it altogether.
                            </div>
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              A revnet can have different split destinations on
                              each chain it exists on, but they're all bound by
                              the same total split limit percentage.
                            </div>
                          </li>
                        </ul>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </dt>
            <dd className="text-md whitespace-nowrap leading-6 text-zinc-700">
              {issuance} cut {selectedStage.weightCutPercent.formatPercentage()}
              % every {(selectedStage.duration / 86400).toString()} days
              {selectedStageBoost ? (
                <span className="text-md leading-6 text-zinc-700">
                  , split limit of {reservedPercent?.formatPercentage()}%.
                </span>
              ) : null}
            </dd>
          </div>
          <div className="grid grid-cols-2 sm:col-span-1 sm:grid-cols-4 sm:px-0">
            <dt className="text-md font-medium leading-6 text-zinc-900">
              <div className="flex flex-row space-x-1">
                <div>Auto issuance</div>
                <div className="max-w-md space-y-2 p-2">
                  <div className="space-y-1">
                    <h3 className="text-black-500 font-bold">Auto issuance</h3>
                    <p className="text-md text-black-400">
                      An amount of {formatTokenSymbol(token)} that is inflated
                      automatically once the stage starts. See the "Owners"
                      table for the breakdown.
                    </p>
                  </div>
                </div>
              </div>
            </dt>
            <dd className="text-md whitespace-nowrap leading-6 text-zinc-700">
              {getAutoIssuancesTotalForStage()} {formatTokenSymbol(token)}
            </dd>
          </div>
          <div className="grid grid-cols-2 sm:col-span-1 sm:grid-cols-4 sm:px-0">
            <dt className="text-md font-medium leading-6 text-zinc-900">
              <div className="flex flex-row space-x-1">
                <div>Cash out tax rate</div>
                <div className="max-w-md space-y-2 p-2">
                  <div className="space-y-1">
                    <h3 className="text-black-500 font-bold">
                      Cash out tax rate
                    </h3>
                    <p className="text-md text-black-400">
                      The only way for anyone to access{" "}
                      {formatTokenSymbol(token)} revenue is by cashing out or
                      taking out a loan against their {formatTokenSymbol(token)}
                      , both offered by the revnet out of the box.
                    </p>
                    <p className="text-md text-black-400">
                      A tax can be added that makes the cost of cashing out and
                      borrowing money more expensive.
                    </p>
                    <p className="text-md text-black-400">
                      This can be used to reward {formatTokenSymbol(token)}{" "}
                      holders who stick around while others cash out, with the
                      tradeoff of making loans more expensive.
                    </p>
                    <p className="text-md text-black-400">
                      It is expressed as a value from 0 to 1.
                    </p>
                    <div className="text-md mt-4 text-zinc-600">
                      <span className="italic">
                        Note:
                        <ul className="list-inside list-disc space-y-2 pl-4">
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              The heavier the tax, the less that can be accessed
                              by cashing out or taking out a loan at any given
                              time, and the more that is left to share between
                              remaining holders who cash out later.
                            </div>
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              Loans are an automated source of revenue for{" "}
                              {formatTokenSymbol(token)}. By making loans more
                              expensive, a heavier cash out tax reduces
                              potential loan revenue.
                            </div>
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              Given 100 {tokenA.symbol} in the revnet, 100 total
                              supply of {formatTokenSymbol(token)}, and 10{" "}
                              {formatTokenSymbol(token)} being cashed out, a tax
                              rate of 0 would yield a cash out value of 10{" "}
                              {tokenA.symbol}, 0.2 would yield 8.2{" "}
                              {tokenA.symbol}, 0.5 would yield 5.5{" "}
                              {tokenA.symbol}, and 0.8 would yield 2.8{" "}
                              {tokenA.symbol}.
                            </div>
                          </li>
                          <li className="flex">
                            <span className="mr-2">•</span>
                            <div>
                              The formula for the amount of {tokenA.symbol}{" "}
                              received when cashing out is `(ax/s) * ((1-r) +
                              xr/s)` where: `r` is the cash out tax rate, `a` is
                              the amount in the revnet being accessed, `s` is
                              the current token supply of{" "}
                              {formatTokenSymbol(token)}, `x` is the amount of{" "}
                              {formatTokenSymbol(token)} being cashed out.
                            </div>
                          </li>
                        </ul>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </dt>
            <dd className="text-md leading-6 text-zinc-700">
              {new CashOutTaxRate(
                Number(selectedStageMetadata?.data?.cashOutTaxRate.value ?? 0n)
              ).format()}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
