import EtherscanLink from "@/components/EtherscanLink";
import {
  ActivityEventsDocument,
  ActivityEventsQuery,
  CashOutTokensEvent,
  PayEvent,
} from "@/generated/graphql";
import { formatTokenSymbol } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { Ether, JB_CHAINS, JBProjectToken } from "juice-sdk-core";
import {
  JBChainId,
  useJBTokenContext,
  useBendystrawQuery,
  useJBProjectMetadataContext,
} from "juice-sdk-react";
import { useState, useEffect, useMemo } from "react";
import { Address } from "viem";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import StaticVolumeChart from "../../ActivityGraph";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Button } from "@/components/ui/button";
import { useProjectDataStore } from "../../../ProjectDataContext";

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
  //const { metadata } = useProjectContext();
  const { metadata } = useJBProjectMetadataContext();
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
  const project = useProjectDataStore(state => state.project);
  const suckerGroupId = project.suckerGroupId;

  const [indexNum, setIndexNum] = useState(0);
  const [currentData, setCurrentData] = useState<ActivityEventsQuery | null>(null);

  const activityEventsLimit = 45;
  const activityEventsOffset = indexNum * activityEventsLimit;
  const page = indexNum + 1;

  const {
    data: activityEvents,
    isLoading,
    isFetching
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

  useEffect(() => {
    if (activityEvents) {
      setCurrentData(activityEvents);
    }
  }, [activityEvents, isLoading]);

  const totalActivityEvents = currentData?.activityEvents.totalCount ?? 0;
  const totalPages = useMemo(() => {
    return totalActivityEvents ? Math.ceil(totalActivityEvents / activityEventsLimit) : 0;
  }, [totalActivityEvents]);

  return (
    <>
      <section className="mb-6 flex flex-col rounded-2xl bg-grey-450 p-[16px]">
        <StaticVolumeChart suckerGroupId={suckerGroupId} />
      </section>

      {!currentData ? (
        <div className="my-[15vh] flex w-full justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : currentData?.activityEvents.items && currentData.activityEvents.items.length > 0 ? (
        <>
        <div className="min-h-[150px]">
          {currentData.activityEvents.items?.map((event) => {
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
          </div>
            
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm font-light text-muted-foreground">
              Page {page} out of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIndexNum((prev) => Math.max(0, prev - 1))}
                disabled={page === 1 || isFetching}
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
                    disabled={isFetching}
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
                disabled={page === totalPages || isFetching}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm font-light text-muted-foreground">
              Showing {Math.min(activityEventsLimit, totalActivityEvents)} items out of {totalActivityEvents}
            </p>
          </div>
        </>
      ) : (
        <span className="text-md text-muted-foreground">
          No activity yet.
        </span>
      )}
    </>
  );
}
