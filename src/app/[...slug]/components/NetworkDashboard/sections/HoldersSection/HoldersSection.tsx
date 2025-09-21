import { Button } from "@/components/ui/button";
import { ParticipantsDocument } from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { formatNumber, formatTokenSymbol, truncateAddress } from "@/lib/utils";
import { ParticipantsTable } from "./ParticipantsTable";
import { Address, formatUnits } from "viem";
import Image from "next/image";
import { ParticipantsPieChart } from "./ParticipantsPieChart";
import { useNetworkData } from "../../NetworkDataContext";
import {
  useSuckersUserTokenBalance,
  useJBContractContext,
} from "juice-sdk-react";
import {
  JBProjectToken,
  JBRulesetData,
  JBRulesetMetadata,
  jbControllerAbi,
} from "juice-sdk-core";
import { useReadContract, useWatchAsset } from "wagmi";
import { useRulesetData } from "@/hooks/useRulesetData";

type TableView = "you" | "all" | "splits";

export function HoldersSection() {
  const {
    project,
    token,
    metadata,
    ruleset,
    rulesetMetadata,
    chainId,
  } = useNetworkData();
  const { projectId, contracts, contractAddress } = useJBContractContext();
  const { tokenData: rulesetData } = useRulesetData({
    ruleset: ruleset as JBRulesetData,
    metadata: rulesetMetadata as JBRulesetMetadata,
    projectId: project.projectId,
  });

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
              participant.chainId,
            ],
          },
        };
      },
      {} as Record<string, any>
    ) ?? {};

  const { watchAsset, isSuccess, isPending } = useWatchAsset();

  const handleAddToken = () => {
    // Make sure token.data and necessary properties exist
    if (!token.data?.address || !token.data?.symbol || !token.data?.decimals) {
      console.error("Token information is incomplete.");
      return;
    }

    watchAsset({
      type: "ERC20",
      options: {
        address: token.data.address as Address,
        symbol: token.data.symbol,
        decimals: token.data.decimals,
        image: metadata.data?.logoUri,
      },
    });
  };

  const { data: pendingReserveTokenBalance } = useReadContract({
    abi: jbControllerAbi,
    functionName: "pendingReservedTokenBalanceOf",
    address: contracts.controller.data ?? undefined,
    chainId,
    args: [projectId],
  });

  return (
    <section>
      <div className="flex w-full flex-col gap-4">
        {token?.data && (
          <div className="rounded-2xl bg-grey-450 p-[12px]">
            <div className="background-color rounded-xl p-[16px]">
              <h3 className="text-xl">
                {totalBalance &&
                  token.data &&
                  formatNumber(
                    Number(
                      formatUnits(totalBalance.value, token.data?.decimals)
                    ),
                    false
                  )}
              </h3>
              <p className="font-light uppercase text-muted-foreground">
                {tokenSymbol != "$TOKEN"
                  ? `Your ${tokenSymbol}`
                  : "Your Balance"}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl bg-grey-450 p-[12px]">
          <div className="background-color rounded-xl p-[16px]">
            <div className="flex items-end gap-2">
              {/* This h3 is already correctly handling a potential lack of token.data */}
              <h3 className="text-xl">
                {token.data?.name ? token.data.name : metadata.data?.name}
              </h3>
              {token.data && (
                <p className="text-sm font-light text-muted-foreground">
                  {/* Use the actual token address from your data */}
                  {truncateAddress(token.data.address as Address)}
                </p>
              )}
            </div>
            <p className="font-light uppercase text-muted-foreground">
              Project Token
            </p>
            {token.data && (
              <Button
                variant="link"
                className="flex h-6 w-fit items-center gap-1.5 px-0 font-normal uppercase"
                onClick={handleAddToken}
                disabled={isPending} // Disable the button while processing
              >
                {isPending
                  ? "Adding..."
                  : isSuccess
                    ? "Added!"
                    : "Add To Metamask"}
                <Image
                  alt="Metamask Logo"
                  src="/assets/img/logo/metamask.svg"
                  height={16}
                  width={16}
                />
              </Button>
            )}
          </div>
          <div className="background-color rounded-xl p-[16px]">
            <h3 className="text-xl">
              {project.tokenSupply
                ? formatNumber(Number(formatUnits(project.tokenSupply, 18)))
                : "Token Error"}
            </h3>
            <p className="font-light uppercase text-muted-foreground">
              Total Supply
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl bg-grey-450 p-[12px]">
          <div className="background-color rounded-xl p-[16px]">
            <h3 className="text-xl">
              {pendingReserveTokenBalance && token.data?.decimals
                ? formatNumber(
                    Number(
                      formatUnits(
                        pendingReserveTokenBalance,
                        token.data?.decimals
                      )
                    ),
                    false
                  )
                : 0}
            </h3>
            <p className="font-light uppercase text-muted-foreground">
              Pending Reserved Tokens
            </p>
          </div>

          <div className="background-color rounded-xl p-[16px]">
            <h3 className="text-xl">
              {rulesetData && rulesetData.reservedRate}
            </h3>
            <p className="font-light uppercase text-muted-foreground">
              Reserved Rate
            </p>
          </div>
        </div>

        <div className="flex h-[400px] items-center rounded-2xl bg-grey-450 p-[12px]">
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
