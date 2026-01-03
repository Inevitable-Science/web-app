import { Button } from "@/components/ui/button";
import { ParticipantsDocument } from "@/generated/graphql";
import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { formatNumber, formatTokenSymbol, truncateAddress } from "@/lib/utils";
import { ParticipantsTable } from "./ParticipantsTable";
import { formatUnits } from "viem";
import Image from "next/image";
import { ParticipantsPieChart } from "./ParticipantsPieChart";
import { useProjectDataStore } from "../../../ProjectDataContext";
import {
  useSuckersUserTokenBalance,
  useJBContractContext,
  useBendystrawQuery,
  useJBChainId,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { JBProjectToken, JB_CHAINS, jbControllerAbi } from "juice-sdk-core";
import { useAccount, useReadContract, useWatchAsset } from "wagmi";
import { useRulesetData } from "@/hooks/useRulesetData";
import EtherscanLink from "@/components/EtherscanLink";

type TableView = "you" | "all" | "splits";

export function HoldersSection() {
  const { connector } = useAccount();

  const project = useProjectDataStore((state) => state.project);
  const ruleset = useProjectDataStore((state) => state.ruleset);
  const rulesetMetadata = useProjectDataStore((state) => state.rulesetMetadata);
  const { token } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();

  const { projectId, contracts, contractAddress } = useJBContractContext();
  const { tokenData: rulesetData } = useRulesetData({
    ruleset: ruleset,
    metadata: rulesetMetadata,
    projectId: project.projectId,
  });
  const chainId = useJBChainId();

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
        address: token.data.address,
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
    chainId: chainId,
    args: [projectId],
  });

  return (
    <section>
      <div className="flex w-full flex-col gap-4">
        {token?.data && (
          <div className="bg-grey-450 rounded-2xl p-[12px]">
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
              <p className="text-muted-foreground font-light uppercase">
                {tokenSymbol != "$TOKEN"
                  ? `Your ${tokenSymbol}`
                  : "Your Balance"}
              </p>
            </div>
          </div>
        )}

        <div className="bg-grey-450 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl p-[12px]">
          <div className="background-color rounded-xl p-[16px]">
            <div className="flex items-end gap-2">
              <h3 className="text-xl leading-[24px]">
                {token.data?.name ? token.data.name : metadata.data?.name}
              </h3>
              {token.data && (
                <EtherscanLink
                  value={token.data.address}
                  className="text-muted-foreground text-sm"
                  type={"token"}
                  truncateTo={4}
                  chain={JB_CHAINS[chainId ?? 1].chain}
                />
              )}
            </div>
            <p className="text-muted-foreground font-light uppercase">
              Project Token
            </p>
            {token.data && connector?.name === "MetaMask" && (
              <Button
                variant="link"
                className="flex h-6 w-fit items-center gap-1.5 px-0 text-sm font-normal text-nowrap uppercase"
                onClick={handleAddToken}
                disabled={isPending}
              >
                {isPending
                  ? "Adding..."
                  : isSuccess
                    ? "Added!"
                    : "Add To Metamask"}
                <Image
                  alt="Metamask Logo"
                  src="https://cdn.inevitable.science/static/img/logo/metamask.svg"
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
            <p className="text-muted-foreground font-light uppercase">
              Total Supply
            </p>
          </div>
        </div>

        <div className="bg-grey-450 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl p-[12px]">
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
            <p className="text-muted-foreground font-light uppercase">
              Pending Reserved Tokens
            </p>
          </div>

          <div className="background-color rounded-xl p-[16px]">
            <h3 className="text-xl">
              {rulesetData && rulesetData.reservedRate}
            </h3>
            <p className="text-muted-foreground font-light uppercase">
              Reserved Rate
            </p>
          </div>
        </div>

        <div className="bg-grey-450 flex h-[400px] items-center rounded-2xl p-[12px]">
          <ParticipantsPieChart />
        </div>

        <ParticipantsTable />
      </div>
    </section>
  );
}
