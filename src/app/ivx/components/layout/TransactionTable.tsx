import EtherscanLink from "@/components/EtherscanLink";
import FarcasterAvatar from "@/components/FarcasterAvatar";
import { FarcasterProfilesProvider } from "@/components/FarcasterAvatarContext";
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
import { useState } from "react";
import { Address } from "viem";

import { Loader2 } from "lucide-react";
import { useIVXContext } from "../../DataProvider";

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
      <div className="flex items-center my-1 justify-between">
        <h3 className="font-light text-grey-50">IN</h3>
        <div className="text-md font-light text-grey-50">
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
          <FarcasterAvatar
            address={activityItemData.beneficiary as Address}
            withAvatar={false}
            short
            chain={chain}
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

export function TransactionTable() {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();
  const [isOpen, setIsOpen] = useState(true);


  const { data: project } = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
    version: Number(version),
    skip: !chainId || !projectId || !version,
  });
  const suckerGroupId = project?.project?.suckerGroupId;

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
    <div className="bg-grey-450 h-full rounded-2xl p-[12px] relative flex flex-col">
      <p className="py-1 text-sm uppercase text-grey-50">Transactions</p>

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
        {isOpen && (
          <div className="overflow-y-scroll scrollbar-hide pb-[48px] flex flex-col gap-1 max-h-[340px]"
            style={{
              maskImage:
                "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
            }}
          >
            {isLoading ? (
              <div className="flex w-full h-[348px] justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : activityEvents?.activityEvents.items &&
              activityEvents.activityEvents.items.length > 0 ? (
              activityEvents.activityEvents.items.map((event) => {
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
              <span className="text-md text-muted-foreground text-center mt-24">
                No activity yet.
              </span>
            )}
          </div>
        )}
      </FarcasterProfilesProvider>
    </div>
  );
}