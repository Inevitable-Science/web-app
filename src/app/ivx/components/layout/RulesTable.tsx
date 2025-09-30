"use client"
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { useProjectBaseToken } from "@/hooks/useTokenBaseToken";
import { ReservedPercent, JBCoreContracts, jbRulesetsAbi, RulesetWeight, WeightCutPercent, formatUnits, CashOutTaxRate } from "juice-sdk-core";
import { useJBChainId, useJBContractContext, useJBTokenContext } from "juice-sdk-react";
import { useReadContract } from "wagmi";
import { useIVXContext } from "../../DataProvider";
import { MAX_RULESET_COUNT } from "@/app/constants";
import { formatNumber, formatTokenSymbol, rulesetStartDate } from "@/lib/utils";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { commaNumber } from "@/lib/number";
import { differenceInDays, formatDate } from "date-fns";


export function RulesTable({ className }: { className?: string }) {
  const { 
    ruleset: primaryRuleset,
    rulesetMetadata: primaryRulesetMetadata,
  } = useIVXContext();
  
  const {
    projectId,
    contractAddress,
  } = useJBContractContext();

  const { token } = useJBTokenContext();
  const chainId = useJBChainId();
  const nativeToken = useProjectBaseToken();
  const autoIssuances = useAutoIssuances();

  const issuance = useFormattedTokenIssuance({
    reservedPercent: new ReservedPercent(0),
  });

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


  if (!primaryRuleset || !primaryRulesetMetadata) {
    return "Something went wrong";
  }

  const devTax = primaryRulesetMetadata.reservedPercent;

  const contributeAmount =
    Number(formatUnits(primaryRuleset.weight._value, token.data?.decimals ?? 18)) 
    / 100 
    * (100 - devTax.formatPercentage());


  const getAutoIssuancesTotalForCurrentStage = () => {
    if (!autoIssuances) return 0;
    const stageautoIssuances = autoIssuances.filter((a) => a.stage === primaryRuleset.cycleNumber + 1);
    return commaNumber(
      formatUnits(
        stageautoIssuances.reduce((acc, curr) => acc + BigInt(curr.count), 0n),
        token?.data?.decimals || 18,
      ),
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

  return (
    <>
      <div className="bg-grey-450 rounded-2xl p-[12px]">
        <p className="py-1 text-sm text-muted-foreground uppercase">Supply Schedule</p>

        <div className="grid grid-cols-2 gap-[12px] mt-1">
          <div className="background-color p-[12px] rounded-xl">
            <p className="text-md text-muted-foreground font-light uppercase">Issuing</p>
            <h3 className="text-lg">
              {issuance}
            </h3>
          </div>

          <div className="background-color p-[12px] rounded-xl">
            <p className="text-md text-muted-foreground font-light uppercase">Receive</p>
            <h3 className="text-lg">
              {formatNumber(contributeAmount, false)} {formatTokenSymbol(token.data?.symbol)} / {nativeToken.symbol}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground py-2 pl-1">
          {devTax.formatPercentage().toFixed(2)}%{" "}
          of issuance and buybacks to splits.
        </p>

        <div className="background-color p-[12px] rounded-2xl">
          <p className="text-sm text-muted-foreground py-1">
            IVX's issuance and cash out terms change automatically in permanent sequential stages.
          </p>
          <div className="
            mt-2 bg-grey-450 p-[12px] rounded-xl
            flex flex-col gap-0.5
            text-sm text-muted-foreground
          ">
            <p className="mb-1 uppercase">
              Stage {primaryRuleset.cycleNumber}{": "}
              {formatDate(new Date(Number(primaryRuleset.start) * 1000), "MMM dd, yyyy")} -{" "}
              {stageNextStart()}
              {stageDayDiff()}
            </p>

            <p>
              Paid Issuance:{" "}
              {issuance} cut {primaryRuleset.weightCutPercent.formatPercentage()}% every{" "}
              {(primaryRuleset.duration / 86400).toString()} days
            </p>

            <p>
              Auto Issuance:{" "}
              {getAutoIssuancesTotalForCurrentStage()} {formatTokenSymbol(token.data?.symbol)}
            </p>

            <p>
              Cash Out Tax Rate:{" "}
              {new CashOutTaxRate(
                  Number(primaryRulesetMetadata?.cashOutTaxRate.value ?? 0n),
                ).format()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};