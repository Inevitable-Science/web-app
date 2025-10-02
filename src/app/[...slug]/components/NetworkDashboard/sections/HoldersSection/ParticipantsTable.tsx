import { EthereumAddress } from "@/components/EthereumAddress";
import { prettyNumber } from "@/lib/number";
import { formatPortion, formatTokenSymbol } from "@/lib/utils";
import { formatUnits } from "juice-sdk-core";
import { Participant } from "@/generated/graphql";
import { JBChainId } from "juice-sdk-react";
import { Address } from "viem";
import { UseTokenReturnType } from "wagmi";
import { Loader2 } from "lucide-react";

export function ParticipantsTable({
  participants,
  token,
  totalSupply,
}: {
  participants: (Participant & { chains: JBChainId[] })[];
  token: UseTokenReturnType["data"] | null;
  totalSupply: bigint;
}) {
  if (participants.length === 0)
    return (
      <div className="my-[15vh] flex w-full justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="mt-2 flex flex-col">
      <h3 className="text-xl">{formatTokenSymbol(token?.symbol)} Holders</h3>
      {participants.map((participant) => (
        <div
          key={participant?.address}
          className="border-color flex flex-col border-b px-2 pb-4 pt-3 text-white"
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
              {token && (
                <span className="whitespace-nowrap">
                  {prettyNumber(
                    formatUnits(participant.balance, token.decimals, {
                      fractionDigits: 3,
                    })
                  )}{" "}
                  {formatTokenSymbol(token?.symbol)}{" "}
                  {participant.balance
                    ? formatPortion(BigInt(participant.balance), totalSupply)
                    : 0}
                  %
                </span>
              )}
            </div>
          </div>

          <div className="text-xs font-light uppercase text-grey-100">
            Ξ{formatUnits(participant.volume, 18, { fractionDigits: 3 })}{" "}
            Contributed
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
