"use client";

import { EthereumAddress } from "@/components/EthereumAddress";
import { formatNumber } from "@/lib/utils";
import { formatUnits } from "juice-sdk-core";
import { ParticipantsDocument } from "@/generated/graphql";
import { JBChainId, useBendystrawQuery } from "juice-sdk-react";
import { Address } from "viem";
import { Loader2 } from "lucide-react";
import { useIVXContext } from "../../DataProvider";

export function HoldersTable() {
  const {
    project,
    token
  } = useIVXContext();

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

  if (participants.length === 0)
    return (
      <div className="my-[15vh] flex w-full justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="mt-2 flex flex-col rounded-2xl bg-grey-450 p-[12px]">
      <p className="py-1 text-sm uppercase text-grey-50">Holders</p>
      {participants.map((participant) => (
        <div
          key={participant?.address}
          className="border-color flex flex-col border-b px-2 py-3"
        >
          <div className="text-md flex items-center justify-between font-light text-grey-50">
            <EthereumAddress
              address={participant?.address as Address}
              short
              withEnsAvatar={false}
              avatarProps={{ size: "sm" }}
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
                )}
                {" "}
                IVX
              </span>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @media (max-width: 640px) {
          .flex.items-center.justify-between > div:last-child {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}