import {
  MAX_RULESET_COUNT,
  RESERVED_TOKEN_SPLIT_GROUP_ID,
} from "@/app/constants";
import { Button } from "@/components/ui/button";
import { useNativeTokenSymbol } from "@/hooks/useNativeTokenSymbol";
import { differenceInDays, formatDate } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ReservedPercent,
  CashOutTaxRate,
  RulesetWeight,
  WeightCutPercent,
} from "juice-sdk-core";
import {
  useJBContractContext,
  useReadJbControllerGetRulesetOf,
  useReadJbRulesetsAllOf,
  useReadJbSplitsSplitsOf,
  useJBTokenContext,
  useJBChainId
} from "juice-sdk-react";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { PriceSection } from "./NetworkDashboard/sections/PriceSection";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { formatTokenSymbol, rulesetStartDate } from "@/lib/utils";
import { useAutoIssuances } from "@/hooks/useAutoIssuances";
import { commaNumber } from "@/lib/number";
import { formatUnits } from "viem";

import { ChevronDownIcon, ArrowRightIcon } from "@heroicons/react/24/outline";


export function NetworkDetailsTable() {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const {
    projectId,
    contracts: { controller },
  } = useJBContractContext();
  const chainId = useJBChainId();

  const { data: rulesets } = useReadJbRulesetsAllOf({
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

  if (!selectedStage) return null;

  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div>
      <div className="bg-grey-450 p-[12px] rounded-2xl mb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">05</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Cycle #</p>
          </div>

          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">Unlocked</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Status</p>
          </div>

          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">-</h3>
            <p className="text-sm text-muted-foreground font-light uppercase">Remaining Time</p>
          </div>
        </div>


        <div className="background-color p-[16px] rounded-xl mt-3">
          <div className="">
            <p className="text-sm text-muted-foreground font-light uppercase">Current Cycle</p>
            <div className="flex items-center justify-between">
              <h3 className="text-xl">Rules</h3>
              <Button variant={"ghost"} className="w-8 h-8 p-0 rounded">
                <ChevronDownIcon height="24" width="24" />
              </Button>
            </div>
          </div>

          
          {/* Cycles Section */}
          <div className="mb-6">
            <h2 className="text-grey-50 mt-4">CYCLES</h2>
            <div>
              {Object.entries(cyclesData.cycles).map(([key, value]) => (
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
              {Object.entries(tokenData.token).map(([key, value]) => (
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
              {Object.entries(otherRulesData.otherRules).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm py-3 border-b border-grey-450 text-grey-50 font-light">
                  <span>{formatLabel(key)}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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

          <Button 
            variant="link" 
            className="h-6 pl-0 flex items-center gap-1.5 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
          >
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


// Define the data types for TypeScript
interface Cycles {
  duration: string;
  startTime: string;
  payouts: string;
  editDeadline: string;
}

interface Token {
  totalIssuanceRate: string;
  payerIssuanceRate: string;
  reservedRate: string;
  issuanceReductionRate: string;
  redemptionRate: string;
  ownerTokenMinting: string;
  tokenTransfers: string;
}

interface OtherRules {
  paymentsToTheProject: string;
  halts: string;
  setPaymentTerminals: string;
  setController: string;
  migratePaymentTerminal: string;
  migrateController: string;
}

interface DaoInfoProps {}

// JSON data embedded in the component (you can also import from separate files)
const cyclesData: { cycles: Cycles } = {
  cycles: {
    duration: "Not set",
    startTime: "2025-01-06, Monday, 03:00:11 PM UTC",
    payouts: "Unlimited",
    editDeadline: "No deadline",
  },
};

const tokenData: { token: Token } = {
  token: {
    totalIssuanceRate: "14,000 HYDRA/ETH",
    payerIssuanceRate: "7,000 HYDRA/ETH",
    reservedRate: "50%",
    issuanceReductionRate: "0%",
    redemptionRate: "100%",
    ownerTokenMinting: "Enabled",
    tokenTransfers: "Enabled",
  },
};

const otherRulesData: { otherRules: OtherRules } = {
  otherRules: {
    paymentsToTheProject: "Disabled",
    halts: "Disabled",
    setPaymentTerminals: "Disabled",
    setController: "Disabled",
    migratePaymentTerminal: "Disabled",
    migrateController: "Disabled",
  },
};