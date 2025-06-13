// src/hooks/useRulesetData.ts

import { useMemo } from 'react';
import { useFormattedTokenIssuance } from './useFormattedTokenIssuance';
import { JBRulesetData, JBRulesetMetadata } from 'juice-sdk-core';
import { format } from 'date-fns';
import { useBoostRecipient } from './useBoostRecipient';
// import { useFormatDaysAndHours } from "@/hooks/useFormatDuration";

// Define the shape of the data our hook will receive
type UseRulesetDataProps = {
  ruleset: JBRulesetData | undefined;
  metadata: JBRulesetMetadata | undefined;
};

/**
 * A hook that takes raw Juicebox ruleset data and metadata, and returns it
 * in a formatted structure suitable for display in tables or lists in this web-app.
 *
 * @param ruleset Raw ruleset data from a hook like `useJBRulesetContext`.
 * @param metadata Raw ruleset metadata from a hook like `useJBRulesetContext`.
 * @returns Three structured objects: `cyclesData`, `tokenData`, and `otherRulesData`.
 */
export function useRulesetData({ ruleset, metadata }: UseRulesetDataProps) {
  // Call other hooks internally to get formatted values
  const formattedTokenIssuance = useFormattedTokenIssuance({
    weight: ruleset?.weight,
    reservedPercent: metadata?.reservedPercent,
  });

  const start = ruleset?.start ? Number(ruleset.start) * 1000 : 0;
  // const duration = ruleset?.duration ? Number(ruleset.duration) : 0;
  /* const formattedTime = useFormatDaysAndHours(duration? duration : 0); */

  // Memoize the formatted cycles data
  const cyclesData = useMemo(() => {
    return {
      /* totalDuration: duration > 0 ? formattedTime : 'Continuous', */
      startTime: start > 0 ? format(start, 'yyyy-MM-dd, EEE, p zzz') : '-',
      /* payouts: 'Unlimited', // Placeholder - logic can be added here
      editDeadline: 'No deadline', // Placeholder - logic can be added here */
    };
  }, [ruleset]);

  // Memoize the formatted token data
  const tokenData = useMemo(() => {
    return {
      payerIssuanceRate: formattedTokenIssuance,
      redemptionRate: metadata?.cashOutTaxRate ? `~${(BigInt(10_000) -metadata.cashOutTaxRate.value) / BigInt(100)}%` : '-',
      /* cashOutTax: metadata?.cashOutTaxRate ? `${metadata.cashOutTaxRate.value / BigInt(100)}%` : '-', */
      reservedRate: metadata?.reservedPercent ? `${metadata.reservedPercent.value / BigInt(100)}%` : '-',
      /* issuanceReductionRate: ruleset?.weightCutPercent ? `${ruleset.weightCutPercent.value / BigInt(1e7)}%` : '-', */
      ownerTokenMinting: metadata?.allowOwnerMinting ? 'Enabled' : 'Disabled',
      /* creditTransfers: metadata?.pauseCreditTransfers ? 'Enabled' : 'Disabled', */
      cashoutsEnabled: metadata?.useTotalSurplusForCashOuts ? 'Enabled' : 'Disabled',
    };
  }, [formattedTokenIssuance, metadata, ruleset]);

  // Memoize other rules data
  const otherRulesData = useMemo(() => {
    const formatBool = (val: boolean | undefined) => (val ? 'Yes' : 'No');
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

  return { cyclesData, tokenData, otherRulesData };
}