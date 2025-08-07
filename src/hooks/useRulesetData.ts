import { useMemo } from "react";
import { useFormattedTokenIssuance } from "./useFormattedTokenIssuance";
import { JBRulesetData, JBRulesetMetadata, RulesetWeight, WeightCutPercent } from "juice-sdk-core";
import { format } from "date-fns";
import { useReadJbRulesetsAllOf } from "juice-sdk-react";
import { MAX_RULESET_COUNT } from "@/app/constants";

type UseRulesetDataProps = {
  ruleset?: JBRulesetData;
  metadata?: JBRulesetMetadata;
  projectId: number;
};

/**
 * A hook that takes raw Juicebox ruleset data and metadata for a specific ruleset,
 * formats it for display, and also fetches and returns all rulesets for the project.
 *
 * @param ruleset Optional raw ruleset data from a hook like `useJBRulesetContext`.
 * @param metadata Optional raw ruleset metadata from a hook like `useJbRulesetContext`.
 * @param projectId The ID of the project to fetch all rulesets for.
 * @returns An object containing:
 * - `cyclesData`, `tokenData`, `otherRulesData`: Formatted data for the specific ruleset passed in.
 * - `allRulesets`: An array of all semi-processed rulesets for the project.
 */
export function useRulesetData({ ruleset, metadata, projectId }: UseRulesetDataProps) {
  // This section formats the SINGLE ruleset passed as a prop
  const formattedTokenIssuance = useFormattedTokenIssuance({
    weight: ruleset?.weight,
    reservedPercent: metadata?.reservedPercent,
  });

  const start = ruleset?.start ? Number(ruleset.start) * 1000 : 0;

  // This new section fetches ALL rulesets for the project
  const { data: allRulesets, isLoading: isLoadingAllRulesets } = useReadJbRulesetsAllOf({
    // The arguments for the contract read.
    // We need a projectId to fetch the rulesets.
    args: projectId ? [BigInt(projectId), 0n, BigInt(MAX_RULESET_COUNT)] : undefined,
    query: {
      // Only run the query if projectId is valid.
      enabled: !!projectId,
      // The `select` function transforms the data returned by the hook.
      // Here, we're converting BigInts to the SDK's class instances for easier use.
      select(data) {
        return data.map((rs) => {
          return {
            ...rs,
            weight: new RulesetWeight(rs.weight),
            weightCutPercent: new WeightCutPercent(rs.weightCutPercent),
          };
        });
      },
    },
  });


  // Memoize the formatted cycles data for the single ruleset
  const cyclesData = useMemo(() => {
    return {
      /* totalDuration: duration > 0 ? formattedTime : 'Continuous', */
      startTime: start > 0 ? format(start, "yyyy-MM-dd, EEE, p zzz") : "-",
      /* payouts: 'Unlimited', // Placeholder - logic can be added here
      editDeadline: 'No deadline', // Placeholder - logic can be added here */
    };
  }, [ruleset]);

  // Memoize the formatted token data for the single ruleset
  const tokenData = useMemo(() => {
    return {
      payerIssuanceRate: formattedTokenIssuance,
      redemptionRate: metadata?.cashOutTaxRate ? `~${(BigInt(10_000) - metadata.cashOutTaxRate.value) / BigInt(100)}%` : "-",
      /* cashOutTax: metadata?.cashOutTaxRate ? `${metadata.cashOutTaxRate.value / BigInt(100)}%` : '-', */
      reservedRate: metadata?.reservedPercent ? `${metadata.reservedPercent.value / BigInt(100)}%` : "-",
      /* issuanceReductionRate: ruleset?.weightCutPercent ? `${ruleset.weightCutPercent.value / BigInt(1e7)}%` : '-', */
      ownerTokenMinting: metadata?.allowOwnerMinting ? "Enabled" : "Disabled",
      /* creditTransfers: metadata?.pauseCreditTransfers ? 'Enabled' : 'Disabled', */
      cashoutsEnabled: metadata?.useTotalSurplusForCashOuts ? "Enabled" : "Disabled",
    };
  }, [formattedTokenIssuance, metadata, ruleset]);

  // Memoize other rules data for the single ruleset
  const otherRulesData = useMemo(() => {
    const formatBool = (val: boolean | undefined) => (val ? "Yes" : "No");
    return {
      paysHalted: formatBool(metadata?.pausePay),
/*       holdFees: formatBool(metadata?.holdFees),
      canAddAccountingContexts: formatBool(metadata?.allowAddAccountingContext),
      ownerMustSendPayouts: formatBool(metadata?.ownerMustSendPayouts),
      canAddPriceFeed: formatBool(metadata?.allowAddPriceFeed),
      canAddCustomToken: formatBool(metadata?.allowSetCustomToken),
      dataHook:  metadata?.dataHook,
      useDataHookForCashOut: formatBool(metadata?.useDataHookForCashOut),
      useDataHookForPay: formatBool(metadata?.useDataHookForPay),
      setPaymentTerminals: formatBool(metadata?.allowSetTerminals),
      migratePaymentTerminal: formatBool(metadata?.allowTerminalMigration),
      migrateController: formatBool(metadata?.allowSetController), */
    };
  }, [metadata]);

  // The hook now returns the formatted data for the single ruleset,
  // AND the array of all rulesets for the project.
  return { cyclesData, tokenData, otherRulesData, allRulesets, isLoadingAllRulesets };
}