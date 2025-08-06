import { Button } from "@/components/ui/button";
import { ParticipantsDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { formatNumber, formatTokenSymbol, truncateAddress } from "@/lib/utils";
import { useState } from "react";
import { twJoin } from "tailwind-merge";
import { ParticipantsTable } from "./ParticipantsTable";
import { Address, formatUnits } from "viem";
import Image from "next/image";
import { ParticipantsPieChart } from "./ParticipantsPieChart";
import { useNetworkData } from "../../NetworkDataContext";
import {
  JBChainId,
  useReadJbControllerPendingReservedTokenBalanceOf,
  useSuckersUserTokenBalance,
  jbControllerAbi,
  useJBContractContext,
  useReadJbSplitsSplitsOf
} from "juice-sdk-react";
import { jbProjectDeploymentAddresses, JBProjectToken, JBRulesetData, JBRulesetMetadata } from "juice-sdk-core";
import { useWatchAsset } from "wagmi";
import { useRulesetData } from "@/hooks/useRulesetData";
import { useSelectedSucker } from "../../../PayCard/SelectedSuckerContext";
import { useFetchProjectRulesets } from "@/hooks/useFetchProjectRulesets";
import { RESERVED_TOKEN_SPLIT_GROUP_ID } from "@/app/constants";

type TableView = "you" | "all" | "splits" ;

export function HoldersSection() {
  const {project, token, metadata, ruleset, rulesetMetadata, chainId, selectedSucker, suckers} = useNetworkData();
  const { projectId } = useJBContractContext();
  const { tokenData: rulesetData } = useRulesetData({
      ruleset: ruleset as  JBRulesetData,
      metadata: rulesetMetadata as JBRulesetMetadata,
      projectId: project.projectId
    });

  const [participantsView, setParticipantsView] = useState<TableView>("all");

  const totalOutstandingTokens = useTotalOutstandingTokens();

  const balanceQuery = useSuckersUserTokenBalance();
    const balances = balanceQuery?.data;
    const totalBalance = new JBProjectToken(
      balances?.reduce((acc, curr) => {
        return acc + curr.balance.value;
      }, 0n) ?? 0n
    );
    const tokenSymbol = formatTokenSymbol(token);

  const participantsQuery = useBendystrawQuery(ParticipantsDocument, {
    orderBy: "balance",
    orderDirection: "desc",
    where: {
      suckerGroupId: project.suckerGroupId,
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

    const { watchAsset, isSuccess, isPending } = useWatchAsset();

  const handleAddToken = () => {
    // Make sure token.data and necessary properties exist
    if (!token.data?.address || !token.data?.symbol || !token.data?.decimals) {
      console.error("Token information is incomplete.");
      return;
    }
    
    watchAsset({
      type: 'ERC20',
      options: {
        address: token.data.address as Address,
        symbol: token.data.symbol,
        decimals: token.data.decimals,
        image: metadata.data?.logoUri, 
      },
    });
  };

  const { data: pendingReserveTokenBalance } =
    useReadJbControllerPendingReservedTokenBalanceOf({
      chainId: selectedSucker?.peerChainId,
      address: selectedSucker?.peerChainId
        ? (jbProjectDeploymentAddresses.JBController[
            selectedSucker.peerChainId as JBChainId
          ] as Address)
        : undefined,
      args: ruleset && selectedSucker ? [projectId] : undefined,
    });
      
  return (
    <section>
      <div className="flex flex-col gap-4 w-full">
        {token?.data && (
          <div className="bg-grey-450 p-[12px] rounded-2xl">
            <div className="background-color p-[16px] rounded-xl">
              <h3 className="text-xl">
                {totalBalance && token.data && formatNumber(Number(formatUnits(totalBalance.value, token.data?.decimals)), false)}
              </h3>
              <p className="text-muted-foreground font-light uppercase">
                {tokenSymbol!= "$TOKEN" ? `Your ${tokenSymbol}` : "Your Balance"}
              </p>
            </div>
          </div>
        )}

        <div className="bg-grey-450 p-[12px] rounded-2xl grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          <div className="background-color p-[16px] rounded-xl">
          <div className="flex gap-2 items-end">
            {/* This h3 is already correctly handling a potential lack of token.data */}
            <h3 className="text-xl">
              {token.data?.name ? token.data.name : metadata.data?.name}
            </h3>
            {token.data && (
              <p className="text-muted-foreground font-light text-sm">
                {/* Use the actual token address from your data */}
                {truncateAddress(token.data.address as Address)}
              </p>
            )}
          </div>
          <p className="text-muted-foreground font-light uppercase">
            Project Token
          </p>
          {token.data && (
            <Button
              variant="link"
              className="h-6 px-0 w-fit flex items-center gap-1.5 font-normal uppercase"
              onClick={handleAddToken}
              disabled={isPending} // Disable the button while processing
            >
              {isPending ? 'Adding...' : isSuccess ? 'Added!' : 'Add To Metamask'}
              <Image alt="Metamask Logo" src="/assets/img/logo/metamask.svg" height={16} width={16} />
            </Button>
          )}
        </div>
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              {project.tokenSupply ? formatNumber(Number(formatUnits(project.tokenSupply, 18))) : "Token Error"}
            </h3>
            <p className="text-muted-foreground font-light uppercase">
              Total Supply
            </p>
          </div>
        </div>


        <div className="bg-grey-450 p-[12px] rounded-2xl grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              {pendingReserveTokenBalance && token.data?.decimals ? formatNumber(Number(formatUnits(pendingReserveTokenBalance, token.data?.decimals)), false) : 0}
            </h3>
            <p className="text-muted-foreground font-light uppercase">
              Pending Reserved Tokens
            </p>
          </div>

          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              {rulesetData && rulesetData.reservedRate}
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
