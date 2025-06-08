import { Button } from "@/components/ui/button";
import { ParticipantsDocument, ProjectDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { formatNumber, truncateAddress } from "@/lib/utils";
import {
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { DistributeReservedTokensButton } from "../../../DistributeReservedTokensButton";
//import { ParticipantsPieChart } from "../../../ParticipantsPieChart";
//import { ParticipantsTable } from "../../../ParticipantsTable";
import { ParticipantsTable } from "./ParticipantsTable";
//import { UserTokenBalanceCard } from "../../../UserTokenBalanceCard/UserTokenBalanceCard";
//import { SplitsSection } from "./SplitsSection";
//import { YouSection } from "./YouSection";
import { Address } from "viem";
import Image from "next/image";
import { ParticipantsPieChart } from "./ParticipantsPieChart";

type TableView = "you" | "all" | "splits" ;

export function HoldersSection() {
  const chainId = useJBChainId();

  const [participantsView, setParticipantsView] = useState<TableView>("all");
  const { projectId } = useJBContractContext();
  const { token } = useJBTokenContext();

  const totalOutstandingTokens = useTotalOutstandingTokens();

  const project = useBendystrawQuery(ProjectDocument, {
    projectId: Number(projectId),
    chainId: Number(chainId),
  });

  const participantsQuery = useBendystrawQuery(ParticipantsDocument, {
    orderBy: "balance",
    orderDirection: "desc",
    where: {
      suckerGroupId: project.data?.project?.suckerGroupId,
      balance_gt: 0,
    },
  });

  const participantsDataAggregate =
    participantsQuery.data?.participants.items?.reduce((acc, participant) => {
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
            participant.chainId,
          ],
        },
      };
    }, {} as Record<string, any>) ?? {};

  const ownersTab = (view: TableView, label: string) => {
    return (
      <Button
        variant={participantsView === view ? "tab-selected" : "bottomline"}
        className={twJoin(
          "text-md",
          participantsView === view && "text-inherit"
        )}
        onClick={() => setParticipantsView(view)}
      >
        {label}
      </Button>
    );
  };

  /*return (
    <div>
        <div className="text-color text-md">
          <div className="mb-2">
            {/* View Tabs * /}
            <div className="flex flex-row space-x-4 mb-3">
              {ownersTab("all", "All")}
              {ownersTab("you", "You")}
              {ownersTab("splits", "Splits")}
            </div>

            {/* ========================= * /}
            {/* ========= Views ========= * /}
            {/* ========================= * /}

            {/* All Section * /}
            <div className={participantsView === "all" ? "" : "hidden"}>
              <div className="space-y-4 p-2 pb-0 sm:pb-2">
                <p className="text-md font-light italic">
                  {formatTokenSymbol(token)} owners are accounts who either paid in, received splits, received auto issuance, or traded for them on the secondary market.
                </p>
              </div>
              <div className="flex lg:flex-row flex-col max-h-140 sm:items-start items-center sm:border-t border-color">
                <div className="w-1/3">
                  <ParticipantsPieChart
                    participants={Object.values(participantsDataAggregate)}
                    totalSupply={totalOutstandingTokens}
                    token={token?.data}
                  />
                </div>
                <div className="overflow-auto p-2 rounded-tl-none border-color sm:border-t-[0px] border w-full">
                  <div>
                    <ParticipantsTable
                      participants={Object.values(participantsDataAggregate)}
                      token={token?.data}
                      totalSupply={totalOutstandingTokens}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* You Section * /}
            <div className={participantsView === "you" ? "" : "hidden"}>
              <YouSection totalSupply={totalOutstandingTokens} />
            </div>

            {/* Splits Section * /}
            <div className={participantsView === "splits" ? "" : "hidden"}>
              <SplitsSection />
              <DistributeReservedTokensButton />
            </div>

          </div>
        </div>
    </div>
  );*/

  return (
    <section>
      <div className="flex flex-col gap-4 w-full">
        <div className="bg-grey-450 p-[12px] rounded-2xl">
          <div className="background-color p-[16px] rounded-xl mt-2">
            <h3 className="text-xl">
              0 tokens {/* DATA_TODO: Add functionality to view tokens */}
            </h3>
            <p className="text-muted-foreground font-light uppercase">
              Your Balance
            </p>
          </div>
        </div>

        <div className="bg-grey-450 p-[12px] rounded-2xl grid grid-cols-2 gap-3">
          <div className="background-color p-[16px] rounded-xl">
            <div className="flex gap-2 items-end">
              <h3 className="text-xl">
                HYDRA {/* DATA_TODO: Add functionality to view token name/symbol without $ */}
              </h3>
              <p className="text-muted-foreground font-light text-sm">
                {truncateAddress("0xaF04f0912E793620824F4442b03F4d984Af29853" as Address)} {/* DATA_TODO: Add functionality to view tokens contract address */}
              </p>
            </div>
            <p className="text-muted-foreground font-light uppercase">
              Project Token
            </p>
            <Button 
              variant="link" 
              className="h-6 px-0 w-fit flex items-center gap-1.5 font-normal uppercase"
            >
              Add To Metamask {/* DATA_TODO: Add functionality to add token to metamask */}
              <Image alt="Metamask Logo" src="/assets/img/logo/metamask.svg" height={16} width={16} />
            </Button>
          </div>

          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              {formatNumber(18600000, true)} {/* DATA_TODO: Add functionality to fetch token total supply ps. leave the second arg as true, for a sortened output */}
            </h3>
            <p className="text-muted-foreground font-light uppercase">
              Total Supply
            </p>
          </div>
        </div>


        <div className="bg-grey-450 p-[12px] rounded-2xl grid grid-cols-2 gap-3">
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              {formatNumber(0, true)} {/* DATA_TODO: Add functionality to view reserved token amount */}
            </h3>
            <p className="text-muted-foreground font-light uppercase">
              Reserved Token
            </p>
          </div>

          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              50% {/* DATA_TODO: Add functionality to view reserve rate */}
            </h3>
            <p className="text-muted-foreground font-light uppercase">
              Reserved Rate
            </p>
          </div>
        </div>

        <div className="bg-grey-450 h-[400px] flex items-center p-[12px] rounded-2xl">
          <ParticipantsPieChart
            participants={Object.values(participantsDataAggregate)}
            totalSupply={totalOutstandingTokens}
            token={token?.data}
          />
        </div>

        <ParticipantsTable
          participants={Object.values(participantsDataAggregate)}
          token={token?.data}
          totalSupply={totalOutstandingTokens}
        />
      </div>
    </section>
  );
}
