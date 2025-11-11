"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import { formatNumber } from "@/lib/utils";
import { formatUnits } from "juice-sdk-core";
import { ParticipantsDocument } from "@/generated/graphql";
import { JBChainId, useBendystrawQuery } from "juice-sdk-react";
import { Address } from "viem";
import { useIVXContext } from "../../DataProvider";

export function HoldersTable() {
  const { project, token } = useIVXContext();

  const participantsQuery = useBendystrawQuery(ParticipantsDocument, {
    orderBy: "balance",
    orderDirection: "desc",
    where: project?.suckerGroupId
      ? {
          suckerGroupId: project.suckerGroupId,
          balance_gt: 0,
        }
      : undefined,
  });

  const participantsDataAggregate =
    participantsQuery.data?.participants.items?.reduce(
      (acc, participant) => {
        if (!participant) return acc;
        const existingParticipant = acc[participant.address];
        return {
          ...acc,
          [participant.address]: {
            address: participant.address,
            balance:
              BigInt(existingParticipant?.balance ?? 0) +
              BigInt(participant.balance ?? 0),
            volume:
              BigInt(existingParticipant?.volume ?? 0) +
              BigInt(participant.volume ?? 0),
            chains: [
              ...(acc[participant.address]?.chains ?? []),
              participant.chainId as JBChainId,
            ],
          },
        };
      },
      {} as Record<string, any>
    ) ?? {};

  const participants = Object.values(participantsDataAggregate);

  return (
    <div className="flex h-[400px] flex-col overflow-auto rounded-2xl bg-grey-450 p-[12px] lg:h-full">
      <p className="py-1 text-sm uppercase text-muted-foreground">Holders</p>
      <div
        className="scrollbar-hide overflow-y-scroll pb-[56px]"
        style={{
          maskImage:
            "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
        }}
      >
        {participants.length === 0 && (
          <div className="activeSkeleton mt-2 flex h-[348px] w-full items-center justify-center rounded-xl" />
        )}
        {participants.map((participant) => (
          <div
            key={participant?.address}
            className="border-color flex flex-col border-b px-2 py-3"
          >
            <div className="text-md flex items-center justify-between font-light text-muted-foreground">
              <EthereumAddress
                address={participant?.address as Address}
                short
                withEnsAvatar={false}
                withEnsName
              />
              <div>
                <span className="whitespace-nowrap text-sm">
                  {formatNumber(
                    Number(
                      formatUnits(
                        participant.balance,
                        token.data?.decimals ?? 18
                      )
                    ),
                    true
                  )}{" "}
                  IVX
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
