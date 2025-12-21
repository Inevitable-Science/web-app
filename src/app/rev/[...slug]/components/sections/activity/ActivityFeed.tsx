import EtherscanLink from "@/components/EtherscanLink";
import {
  ActivityEventsDocument,
  CashOutTokensEvent,
  PayEvent,
  ProjectDocument,
} from "@/generated/graphql";
import { formatTokenSymbol } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { Ether, JB_CHAINS, JBProjectToken } from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
  useBendystrawQuery,
} from "juice-sdk-react";
import { useState, useEffect, useMemo } from "react";
import { Address, Chain, formatEther } from "viem";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import StaticVolumeChart, {
  ProjectTimelineRange,
  ProjectTimelineView,
} from "../../ActivityGraph";
import { useVolumeData } from "@/hooks/useVolumeData";
import { useProjectContext } from "../../../ProjectDataContext";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Button } from "@/components/ui/button";

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
  const chain = JB_CHAINS[payEvent.chainId].chain;

  if (!payEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(payEvent.amount)),
    beneficiary: payEvent.beneficiary,
    beneficiaryTokenCount: new JBProjectToken(
      BigInt(payEvent.newlyIssuedTokenCount)
    ),
    memo: payEvent.memo,
  };

  const formattedDate = formatDistance(payEvent.timestamp * 1000, new Date(), {
    addSuffix: true,
  });

  return (
    <div className="border-color mb-1 min-h-[80px] border-b pb-2">
      <div className="flex items-center justify-between">
        <h3 className="font-light text-grey-50">PAID</h3>
        <div className="text-md mb-2 font-light text-grey-50">
          <EtherscanLink type="tx" value={payEvent.txHash} chain={chain}>
            {formattedDate}
          </EtherscanLink>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-color font-light">
          Ξ{activityItemData.amount.format(6)}
        </div>

        <div className="text-md flex flex-wrap items-center gap-1 font-light text-grey-100">
          <EthereumAddress
            address={activityItemData.beneficiary as Address}
            chain={chain}
            short
            withEnsName
          />
        </div>
      </div>
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
  const { metadata } = useProjectContext();
  const chain = JB_CHAINS[cashOutEvent.chainId].chain;

  if (!cashOutEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(cashOutEvent.reclaimAmount)),
    beneficiary: cashOutEvent.beneficiary,
    cashOutCount: new JBProjectToken(BigInt(cashOutEvent.cashOutCount)),
  };

  const formattedDate = formatDistance(
    cashOutEvent.timestamp * 1000,
    new Date(),
    {
      addSuffix: true,
    }
  );

  return (
    <div className="border-color mb-1 border-b pb-2">
      <div className="flex items-center justify-between">
        <div className="text-md mb-2 text-zinc-500">
          <h3 className="font-light text-grey-50">WITHDREW</h3>
        </div>
        <div className="text-md mb-2 flex items-center gap-1 font-light text-grey-50">
          <EtherscanLink
            className="hover:underline"
            type="tx"
            value={cashOutEvent.txHash}
          >
            {formattedDate}
          </EtherscanLink>
        </div>
      </div>
      <div className="text-md flex flex-wrap items-center justify-between gap-1 pb-4">
        <div className="text-color flex items-center gap-1 font-light">
          {activityItemData.cashOutCount?.format(6)}{" "}
          {formatTokenSymbol(
            token?.data?.symbol ? token?.data?.symbol : metadata?.data?.name
          )}
        </div>

        <div className="text-md font-light text-grey-100">
          <EthereumAddress
            className="hover:underline"
            address={activityItemData.beneficiary as Address}
            chain={chain}
            short
            withEnsName
          />
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();
  const [isOpen, setIsOpen] = useState(true);

  // --- 1. Manage the chart's state here in the parent ---
  const [view, setView] = useState<ProjectTimelineView>("volume");
  const [range, setRange] = useState<ProjectTimelineRange>(30); // Default to 30 days
  const [indexNum, setIndexNum] = useState(0);

  const activityEventsLimit = 45;
  const activityEventsOffset = indexNum * activityEventsLimit;
  const page = indexNum + 1;

  const { data: project } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    version: Number(version),
    skip: !chainId || !projectId || !version,
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
    return dailyTotals.map((day) => ({
      timestamp: Math.floor(day.date.getTime() / 1000),
      volume: Number(formatEther(day.volume)),
      balance: 0,
      trendingScore: 0,
    }));
  }, [dailyTotals]);

  const {
    data: activityEvents,
    isLoading,
    isFetching,
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
      limit: activityEventsLimit,
      offset: activityEventsOffset
    },
    {
      pollInterval: 5000,
      enabled: !!suckerGroupId,
    }
  );

  const totalActivityEvents = activityEvents?.activityEvents.totalCount;
  const totalPages = useMemo(() => {
    return totalActivityEvents ? Math.ceil(totalActivityEvents / activityEventsLimit) : 0;
  }, [totalActivityEvents]);

  return (
    <>
      <section className="mb-6 flex flex-col rounded-2xl bg-grey-450 p-[16px]">
        <StaticVolumeChart suckerGroupId={suckerGroupId} />
      </section>

      {isOpen && (
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="my-[15vh] flex w-full justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : activityEvents?.activityEvents.items &&
            activityEvents.activityEvents.items.length > 0 ? (
              <>
                {activityEvents.activityEvents.items?.map((event) => {
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
                })}
                
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-sm font-light text-muted-foreground">
                    Page {page} out of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIndexNum((prev) => Math.max(0, prev - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: 3 }, (_, i) => {
                      const start = Math.max(
                        1,
                        Math.min(page - 1, totalPages - 2)
                      );

                      const pageNum = start + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          className={`${pageNum === page ? "border-color border" : ""} font-light`}
                          onClick={() => setIndexNum(pageNum - 1)} // indexNum is page - 1
                        >
                          {pageNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setIndexNum((prev) => Math.min(totalPages + 1, prev + 1))
                      }
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-light text-muted-foreground">
                    Showing {activityEventsLimit} items out of {totalActivityEvents}
                  </p>
                </div>
              </>
          ) : (
            <span className="text-md text-muted-foreground">
              No activity yet.
            </span>
          )}
        </div>
      )}
    </>
  );
}
