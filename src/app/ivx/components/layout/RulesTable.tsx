"use client";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import {
  ReservedPercent,
  JBCoreContracts,
  jbRulesetsAbi,
  RulesetWeight,
  WeightCutPercent,
  formatUnits,
  CashOutTaxRate,
} from "juice-sdk-core";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useReadContract } from "wagmi";
import { useIVXContext } from "../../DataProvider";
import { MAX_RULESET_COUNT } from "@/app/constants";
import { formatNumber, formatTokenSymbol, rulesetStartDate } from "@/lib/utils";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { commaNumber } from "@/lib/number";
import { differenceInDays, formatDate } from "date-fns";

export function RulesTable() {
  const { ruleset: primaryRuleset, rulesetMetadata: primaryRulesetMetadata } =
    useIVXContext();

  const { projectId, contractAddress } = useJBContractContext();

  const { token } = useJBTokenContext();
  const chainId = useJBChainId();
  const nativeToken = useProjectBaseToken();
  const autoIssuances = useAutoIssuances();

  const issuance = useFormattedTokenIssuance({
    reservedPercent: new ReservedPercent(0),
  });

  const { data: rulesets, isLoading } = useReadContract({
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

  if (!primaryRuleset || !primaryRulesetMetadata || isLoading) {
    return (
      <div className="rounded-2xl bg-grey-450 p-[12px]">
        <p className="py-1 text-sm uppercase text-muted-foreground">
          Supply Schedule
        </p>
        <div className="activeSkeleton h-[calc(100%-28px)] w-full items-center justify-center rounded-xl" />
      </div>
    );
  }

  const devTax = primaryRulesetMetadata.reservedPercent;

  const contributeAmount =
    (Number(
      formatUnits(primaryRuleset.weight._value, token.data?.decimals ?? 18)
    ) /
      100) *
    (100 - devTax.formatPercentage());

  const getAutoIssuancesTotalForCurrentStage = () => {
    if (!autoIssuances) return 0;
    const stageautoIssuances = autoIssuances.filter(
      (a) => a.stage === primaryRuleset.cycleNumber + 1
    );
    return commaNumber(
      formatUnits(
        stageautoIssuances.reduce((acc, curr) => acc + BigInt(curr.count), 0n),
        token?.data?.decimals || 18
      )
    );
  };

  const stageNextStart = () => {
    const selectedRuleset = rulesets?.[primaryRuleset.cycleNumber];
    const selectedStart = rulesetStartDate(selectedRuleset);

    const nextRuleset = rulesets?.[primaryRuleset.cycleNumber - 1];
    const nextStart = rulesetStartDate(nextRuleset);
    if (!nextStart || !selectedStart) return "Forever";

    return formatDate(nextStart, "MMM dd, yyyy");
  };

  const stageDayDiff = () => {
    const selectedRuleset = rulesets?.[primaryRuleset.cycleNumber];
    const selectedStart = rulesetStartDate(selectedRuleset);

    const nextRuleset = rulesets?.[primaryRuleset.cycleNumber - 1];
    const nextStart = rulesetStartDate(nextRuleset);
    if (!nextStart || !selectedStart) return "";

    const days = differenceInDays(nextStart, selectedStart);
    return `, ${days} days`;
  };

  console.log(primaryRuleset.weightCutPercent._value, primaryRuleset.duration, issuance, "PRP");

  return (
    <>
      <div className="rounded-2xl bg-grey-450 p-[12px]">
        <p className="py-1 text-sm uppercase text-muted-foreground">
          Supply Schedule
        </p>

        <div className="mt-1 flex flex-col gap-[8px] md:grid md:grid-cols-2 md:gap-[12px]">
          <div className="background-color rounded-xl p-[12px]">
            <p className="text-md font-light uppercase text-muted-foreground">
              Issuing
            </p>
            <h3 className="text-lg">{issuance}</h3>
          </div>

          <div className="background-color rounded-xl p-[12px]">
            <p className="text-md font-light uppercase text-muted-foreground">
              Receive
            </p>
            <h3 className="text-lg">
              {formatNumber(contributeAmount, false)}{" "}
              {formatTokenSymbol(token.data?.symbol)} / {nativeToken.symbol}
            </h3>
          </div>
        </div>

        <p className="py-2 pl-1 text-sm text-muted-foreground">
          {devTax.formatPercentage().toFixed(2)}% of issuance and buybacks to
          splits.
        </p>

        <div className="background-color rounded-2xl p-[12px]">
          <p className="py-1 text-sm text-muted-foreground">
            IVX's issuance and cash out terms change automatically in permanent
            sequential stages.
          </p>
          <div className="mt-2 flex flex-col gap-1 rounded-xl bg-grey-450 p-[12px] text-sm text-muted-foreground md:gap-0.5">
            <p className="mb-1 uppercase">
              Stage {primaryRuleset.cycleNumber}
              {": "}
              {formatDate(
                new Date(Number(primaryRuleset.start) * 1000),
                "MMM dd, yyyy"
              )}{" "}
              - {stageNextStart()}
              {stageDayDiff()}
            </p>

            <p>
              Paid Issuance: {issuance}
              {!!primaryRuleset.weightCutPercent._value &&
                !!primaryRuleset.duration && (
                <>
                  {" "}cut{" "}
                  {primaryRuleset.weightCutPercent.formatPercentage()}% every{" "}
                  {(primaryRuleset.duration / 86400).toString()} days
                </>
              )}
            </p>

            <p>
              Auto Issuance: {getAutoIssuancesTotalForCurrentStage()}{" "}
              {formatTokenSymbol(token.data?.symbol)}
            </p>

            <p>
              Cash Out Tax Rate:{" "}
              {new CashOutTaxRate(
                Number(primaryRulesetMetadata?.cashOutTaxRate.value ?? 0n)
              ).format()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
