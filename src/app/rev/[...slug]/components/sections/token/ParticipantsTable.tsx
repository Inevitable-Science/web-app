"use client"
import { EthereumAddress } from "@/components/EthereumAddress";
import { prettyNumber } from "@/lib/number";
import { formatNumber, formatPortion, formatTokenSymbol } from "@/lib/utils";
import { formatUnits, JB_CHAINS } from "juice-sdk-core";
import { ParticipantsDocument, ParticipantsQuery } from "@/generated/graphql";
import { JBChainId, useBendystrawQuery, useJBTokenContext } from "juice-sdk-react";
import { Address } from "viem";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { useEffect, useMemo, useState } from "react";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { Button } from "@/components/ui/button";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import Image from "next/image";

export function ParticipantsTable() {
  const project = useRevnetDataStore((state) => state.project);
  const { token } = useJBTokenContext();
  const totalSupply = useTotalOutstandingTokens();
  const baseToken = useProjectBaseToken();

  const [offsetInt, setOffsetInt] = useState(0);
  const [currentData, setCurrentData] = useState<ParticipantsQuery["participants"] | null>(null);

  const page = offsetInt + 1;
  const pageLimit = 45;

  const { data: participantsQuery, isFetching } = useBendystrawQuery(ParticipantsDocument, {
    orderBy: "balance",
    orderDirection: "desc",
    where: {
      suckerGroupId: project.suckerGroupId,
      balance_gt: 0,
    },
    limit: pageLimit,
    offset: offsetInt * pageLimit
  });

  const participants = participantsQuery?.participants ?? null;
  const totalParticipants = currentData?.totalCount ?? 0;

  useEffect(() => {
    if (participants) {
      setCurrentData(participants);
    }
  }, [participants]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalParticipants / pageLimit);
  }, [totalParticipants]);


  if (!currentData) {
    return (
      <div className="my-[15vh] flex w-full justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  };

  return (
    <div className="mt-2 flex flex-col">
      <h3 className="text-xl">{formatTokenSymbol(token?.data?.symbol)} Holders</h3>
      {currentData.items.map((participant, index) => {
        const contributionAmount = parseFloat(formatUnits(participant.volume, baseToken.decimals));

        return (
        <div
          key={`${participant?.address}-${index}`}
          className="border-color flex flex-col border-b px-2 pt-3 pb-4 text-white"
        >
          <div className="text-md text-grey-50 flex items-center justify-between font-light">
            <EthereumAddress
              address={participant?.address as Address}
              chain={JB_CHAINS[participant.chainId as JBChainId].chain}
              short
              withEnsAvatar={false}
              withEnsName
            />
            <div>
              {token && (
                <span className="whitespace-nowrap">
                  {prettyNumber(
                    formatUnits(participant.balance, token?.data?.decimals ?? 18, {
                      fractionDigits: 3,
                    })
                  )}{" "}
                  {formatTokenSymbol(token?.data?.symbol)}{" "}
                  </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-grey-100 text-xs font-light uppercase flex items-center">
              {baseToken.isNative ? "Ξ" : (
                <Image
                  src={
                    "https://cdn.inevitable.science/static/img/logo/usdc.svg"
                  }
                  className="mr-1"
                  alt={`USDC Logo`}
                  width={12}
                  height={12}
                />
              )}
              {contributionAmount === 0
                ? "0"
                : contributionAmount < 0.001
                  ? "<0.001"
                  : formatNumber(contributionAmount)
              }
              {" "}Contributed
            </div>

            <span className="text-grey-100 text-xs font-light uppercase">
                {participant.balance
                ? formatPortion(BigInt(participant.balance), totalSupply)
                : 0}
              %
            </span>
          </div>
        </div>
        )}
      )}

      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-muted-foreground text-sm font-light">
          Page {page} out of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setOffsetInt((prev) => Math.max(0, prev - 1))}
            disabled={page === 1 || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: 3 }, (_, i) => {
            const start = Math.max(1, Math.min(page - 1, totalPages - 2));

            const pageNum = start + i;
            if (pageNum > totalPages) return null;

            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                className={`${pageNum === page ? "border-color border" : ""} font-light`}
                onClick={() => setOffsetInt(pageNum - 1)}
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
              setOffsetInt((prev) => Math.min(totalPages + 1, prev + 1))
            }
            disabled={page === totalPages || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm font-light">
          Showing {Math.min(pageLimit, totalParticipants)} items
          out of {totalParticipants}
        </p>
      </div>
    </div>
  );
}
