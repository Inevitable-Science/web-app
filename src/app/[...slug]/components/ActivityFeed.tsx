import { sdk } from "@farcaster/frame-sdk";
import Image from "next/image";
import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import FarcasterAvatar from "@/components/FarcasterAvatar";
import { FarcasterProfilesProvider } from "@/components/FarcasterAvatarContext";
import {
  ActivityEventsDocument,
  CashOutTokensEvent,
  PayEvent,
  ProjectDocument,
} from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { formatTokenSymbol } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { Ether, JB_CHAINS, JBProjectToken } from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useState, useEffect, useMemo } from "react";
import { Address, formatEther } from "viem";

import { Loader2 } from "lucide-react";
import StaticVolumeChart, { ProjectTimelineRange, ProjectTimelineView } from "./NetworkDashboard/Components/ActivityGraph";
import { useVolumeData } from "@/hooks/useVolumeData";

// DATA_TODO: Add functionality to view changes to the project rules

type ProjectTimelinePoint = {
  timestamp: number
  volume: number
  balance: number
  trendingScore: number
}

const sampleData: ProjectTimelinePoint[] = [
  { timestamp: Math.floor(Date.now() / 1000) - 30 * 24 * 3600, volume: 5, balance: 10, trendingScore: 200 },
  { timestamp: Math.floor(Date.now() / 1000) - 25 * 24 * 3600, volume: 7, balance: 12, trendingScore: 250 },
  { timestamp: Math.floor(Date.now() / 1000) - 20 * 24 * 3600, volume: 10, balance: 15, trendingScore: 300 },
  { timestamp: Math.floor(Date.now() / 1000) - 15 * 24 * 3600, volume: 8, balance: 13, trendingScore: 280 },
  { timestamp: Math.floor(Date.now() / 1000) - 10 * 24 * 3600, volume: 12, balance: 18, trendingScore: 320 },
  { timestamp: Math.floor(Date.now() / 1000) - 5 * 24 * 3600, volume: 15, balance: 20, trendingScore: 350 },
  { timestamp: Math.floor(Date.now() / 1000), volume: 18, balance: 22, trendingScore: 400 },
]



type PayActivityItemData = {
  id: string;
  amount: Ether;
  beneficiary: Address;
  beneficiaryTokenCount?: JBProjectToken;
  timestamp: number;
  txHash: string;
};

function PayActivityItem(
  payEvent: Pick<
    PayEvent,
    | "amount"
    | "beneficiary"
    | "newlyIssuedTokenCount"
    | "timestamp"
    | "txHash"
    | "memo"
  > & { chainId: JBChainId; identity?: any }
) {
  const { token } = useJBTokenContext();
  const composeCast = sdk.actions.composeCast;
  const chainId = payEvent.chainId;
  const chain = JB_CHAINS[chainId].chain;

  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    const checkMiniApp = async () => {
      const result = await sdk.isInMiniApp();
      setIsMiniApp(result);
    };
    checkMiniApp();
  }, []);

  if (!token?.data || !payEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(payEvent.amount)),
    beneficiary: payEvent.beneficiary,
    beneficiaryTokenCount: new JBProjectToken(
      BigInt(payEvent.newlyIssuedTokenCount)
    ),
    memo: payEvent.memo,
  };

  // Compose Farcaster handle or fallback to address
  const handle = payEvent.identity?.username
    ? `@${payEvent.identity.username}`
    : `${payEvent.beneficiary.slice(0, 6)}…`;

  const shareText = `⏩ ${handle} paid ${activityItemData.amount.format(4)} ETH and received ${activityItemData.beneficiaryTokenCount?.format(2)} ${token.data?.symbol} — "${activityItemData.memo}"`;

  const formattedDate = formatDistance(payEvent.timestamp * 1000, new Date(), {
    addSuffix: true,
  });

  const embedUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="border-b border-color pb-2 mb-1 min-h-[80px]">
      <div className="flex items-center justify-between">
        <h3 className="text-grey-50 font-light">PAID</h3>
        <div className="text-md font-light text-grey-50 mb-2">
          <EtherscanLink type="tx" value={payEvent.txHash} chain={chain}>
            {formattedDate}
          </EtherscanLink>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-color font-light">
          Ξ{activityItemData.amount.format(6)}
        </div>

        <div className="flex items-center gap-1 font-light text-grey-100 text-md flex-wrap">
          <FarcasterAvatar
            address={activityItemData.beneficiary as Address}
            withAvatar={false}
            short
            chain={chain}
          />
        </div>
      </div>
      
      {activityItemData.memo && (
        <div className="pb-4 mt-1">
          {isMiniApp ? (
            <button
              onClick={() =>
                composeCast({
                  text: shareText,
                  embeds: [embedUrl],
                })
              }
              className="text-sm text-grey-50 font-light text-left hover:underline"
            >
              {activityItemData.memo}
            </button>
          ) : (
            <div className="text-sm text-grey-50 font-light">
              "{activityItemData.memo}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RedeemActivityItem(
  cashOutEvent: Pick<
    CashOutTokensEvent,
    "reclaimAmount" | "beneficiary" | "txHash" | "timestamp" | "cashOutCount"
  > & { chainId: JBChainId; identity?: any }
) {
  const { token } = useJBTokenContext();
  const composeCast = sdk.actions.composeCast;

  const [isMiniApp, setIsMiniApp] = useState(false);

  useEffect(() => {
    const checkMiniApp = async () => {
      const result = await sdk.isInMiniApp();
      setIsMiniApp(result);
    };
    checkMiniApp();
  }, []);

  if (!token?.data || !cashOutEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(cashOutEvent.reclaimAmount)),
    beneficiary: cashOutEvent.beneficiary,
    cashOutCount: new JBProjectToken(BigInt(cashOutEvent.cashOutCount)),
  };

  const handle = cashOutEvent.identity?.username
    ? `@${cashOutEvent.identity.username}`
    : `${cashOutEvent.beneficiary.slice(0, 6)}…`;

  const shareText = `⏩ ${handle} redeemed ${activityItemData.cashOutCount?.format(2)} ${token.data.symbol} for ${activityItemData.amount.format(4)} ETH`;

  const formattedDate = formatDistance(
    cashOutEvent.timestamp * 1000,
    new Date(),
    {
      addSuffix: true,
    }
  );

  const embedUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="border-b border-color pb-2 mb-1">
      <div className="flex items-center justify-between">
        <div className="text-md text-zinc-500 mb-2">
          <h3 className="text-grey-50 font-light">WITHDREW</h3>
        </div>
        <div className="flex items-center gap-1 text-md font-light text-grey-50 mb-2">
          <EtherscanLink className="hover:underline" type="tx" value={cashOutEvent.txHash}>
            {formattedDate}
          </EtherscanLink>
        </div>
      </div>
      <div className="flex items-center justify-between pb-4 gap-1 text-md flex-wrap">
        <div className="flex items-center gap-1 text-color font-light">
          {activityItemData.cashOutCount?.format(6)}{" "}
          {formatTokenSymbol(token.data.symbol)}
        </div>

        <div className="font-light text-grey-100 text-md">
          <FarcasterAvatar
            className="hover:underline"
            address={activityItemData.beneficiary as Address}
            withAvatar={false}
            short
          />
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const [isOpen, setIsOpen] = useState(true);

  // --- 1. Manage the chart's state here in the parent ---
  const [view, setView] = useState<ProjectTimelineView>('volume');
  const [range, setRange] = useState<ProjectTimelineRange>(30); // Default to 30 days

  const { data: project } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    skip: !chainId || !projectId,
  });
  const suckerGroupId = project?.project?.suckerGroupId;

  // --- 2. Make the data fetching dynamic based on the `range` state ---
  const [loadTimestamp] = useState(() => Math.floor(Date.now() / 1000));
  const startTimestamp = useMemo(() => {
    // Calculate the start timestamp based on the selected range
    return loadTimestamp - range * 24 * 60 * 60;
  }, [loadTimestamp, range]);

  const { dailyTotals, isLoading: isChartLoading } = useVolumeData({
    suckerGroupId,
    startTimestamp,
    endTimestamp: loadTimestamp,
  });

  // --- 3. Format the fetched data for the chart ---
  const formattedChartData = useMemo(() => {
    return dailyTotals.map(day => ({
      timestamp: Math.floor(day.date.getTime() / 1000),
      volume: Number(formatEther(day.volume)),
      // You can add logic for these later if needed
      balance: 0,
      trendingScore: 0,
    }));
  }, [dailyTotals]);

  const {
    data: activityEvents,
    isLoading,
    isFetching, // optional if you want to show loading on polling
  } = useBendystrawQuery(
    ActivityEventsDocument,
    {
      orderBy: "timestamp",
      orderDirection: "desc",
      where: suckerGroupId
        ? {
            suckerGroupId,
            OR: [{ payEvent_not: null }, { cashOutTokensEvent_not: null }],
          }
        : undefined,
    },
    {
      pollInterval: 5000,
      enabled: !!suckerGroupId,
    }
  );

  return (
    <FarcasterProfilesProvider
      addresses={
        activityEvents?.activityEvents.items?.flatMap((e) =>
          e?.payEvent || e?.cashOutTokensEvent
            ? [
                (e?.payEvent?.beneficiary ||
                  e?.cashOutTokensEvent?.beneficiary) as `0x${string}`,
              ]
            : []
        ) ?? []
      }
    >



      <section className="flex flex-col mb-6 bg-grey-450 p-[16px] rounded-2xl">
        <StaticVolumeChart
          suckerGroupId={suckerGroupId}
        />
      </section>



      {isOpen && (
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="w-full flex justify-center my-[15vh]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : activityEvents?.activityEvents.items &&
          activityEvents.activityEvents.items.length > 0 ? (
            activityEvents.activityEvents.items?.map((event) => {
              if (event?.payEvent) {
                return (
                  <PayActivityItem
                    key={event.id}
                    chainId={event.chainId as JBChainId}
                    {...event.payEvent}
                  />
                );
              }
              if (event?.cashOutTokensEvent) {
                return (
                  <RedeemActivityItem
                    key={event.id}
                    chainId={event.chainId as JBChainId}
                    {...event.cashOutTokensEvent}
                  />
                );
              }

              return null;
            })
          ) : (
            <span className="text-muted-foreground text-md">No activity yet.</span>
          )}
        </div>
      )}
    </FarcasterProfilesProvider>
  );
}
