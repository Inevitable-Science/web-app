import EtherscanLink from "@/components/EtherscanLink";
import {
  ActivityEventsDocument,
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
} from "juice-sdk-react";
import { Address } from "viem";

import { useIVXContext } from "../../DataProvider";
import { EthereumAddress } from "@/components/EthereumAddress";

// todo cleanup

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
  const chainId = payEvent.chainId;
  const chain = JB_CHAINS[chainId].chain;

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
    <div className="border-color border-b pb-2">
      <div className="my-1 flex items-center justify-between">
        <h3 className="text-muted-foreground font-light">IN</h3>
        <div className="text-md text-muted-foreground font-light">
          <EtherscanLink type="tx" value={payEvent.txHash} chain={chain}>
            {formattedDate}
          </EtherscanLink>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-color font-light">
          Ξ{activityItemData.amount.format(6)}
        </div>

        <div className="text-md text-grey-100 flex flex-wrap items-center gap-1 font-light">
          <EthereumAddress
            className="hover:underline"
            address={activityItemData.beneficiary as Address}
            chain={chain}
            withEnsName
            short
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
  const { metadata } = useIVXContext();
  const chain = JB_CHAINS[cashOutEvent.chainId].chain;

  if (!cashOutEvent) return null;

  const activityItemData = {
    amount: new Ether(BigInt(cashOutEvent.reclaimAmount)),
    beneficiary: cashOutEvent.beneficiary,
    cashOutCount: new JBProjectToken(BigInt(cashOutEvent.cashOutCount)),
    chain: cashOutEvent.chainId,
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
          <h3 className="text-muted-foreground font-light">WITHDREW</h3>
        </div>
        <div className="text-md text-muted-foreground mb-2 flex items-center gap-1 font-light">
          <EtherscanLink
            className="hover:underline"
            type="tx"
            value={cashOutEvent.txHash}
            chain={chain}
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

        <div className="text-md text-grey-100 font-light">
          <EthereumAddress
            className="hover:underline"
            address={activityItemData.beneficiary as Address}
            chain={JB_CHAINS[activityItemData.chain].chain}
            withEnsName
            short
          />
        </div>
      </div>
    </div>
  );
}

export function TransactionTable() {
  const { project } = useIVXContext();
  const suckerGroupId = project?.suckerGroupId;

  const { data: activityEvents, isLoading } = useBendystrawQuery(
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
      limit: 100, // only most recent 100 events
      offset: 0,
    },
    {
      pollInterval: 5000,
      enabled: !!suckerGroupId,
    }
  );

  return (
    <div className="bg-grey-450 relative flex h-full flex-col rounded-2xl p-[12px]">
      <p className="text-muted-foreground py-1 text-sm uppercase">
        Transactions
      </p>
      <div
        className="scrollbar-hide flex max-h-[340px] flex-col gap-1 overflow-y-scroll"
        style={{
          maskImage:
            "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
        }}
      >
        {isLoading || !activityEvents ? (
          <div className="activeSkeleton mt-2 flex h-[348px] w-full items-center justify-center rounded-xl" />
        ) : activityEvents.activityEvents.items?.length > 0 ? (
          <div className="pb-[48px]">
            {activityEvents.activityEvents.items.map((event) => {
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
        ) : (
          <span className="text-md text-muted-foreground my-24 text-center">
            No activity yet.
          </span>
        )}
      </div>
    </div>
  );
}
