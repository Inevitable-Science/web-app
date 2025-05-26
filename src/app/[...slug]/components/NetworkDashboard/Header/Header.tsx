"use client";

import { ChainLogo } from "@/components/ChainLogo";
import EtherscanLink from "@/components/EtherscanLink";
import {
  ParticipantsDocument,
  ProjectDocument,
  SuckerGroupDocument,
} from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
// import { useTotalOutstandingTokens } from "@/hooks/useTotalOutstandingTokens";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { formatTokenSymbol } from "@/lib/utils";
import { ForwardIcon } from "@heroicons/react/24/solid";
import { JB_CHAINS } from "juice-sdk-core";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
  useSuckers,
} from "juice-sdk-react";
import Image from "next/image";
import Link from "next/link";
import { TvlDatum } from "./TvlDatum";
import { useMemo } from "react";

export function Header() {
  const { projectId } = useJBContractContext();
  const chainId = useJBChainId();
  const { metadata } = useJBProjectMetadataContext();
  const { token } = useJBTokenContext();

  const project = useBendystrawQuery(ProjectDocument, {
    chainId: Number(chainId),
    projectId: Number(projectId),
  });
  const suckerGroup = useBendystrawQuery(SuckerGroupDocument, {
    id: project.data?.project?.suckerGroupId ?? "",
  });

  const { data: participants } = useBendystrawQuery(ParticipantsDocument, {
    where: {
      suckerGroupId: suckerGroup.data?.suckerGroup?.id,
      balance_gt: 0,
    },
    limit: 1000 // TODO will break once more than 1000 participants exist
  });

  const contributorsCount = useMemo(() => {
    // de-dupe participants who are on multiple chains
    const participantWallets = participants?.participants.items.reduce(
      (acc, curr) =>
        acc.includes(curr.address) ? acc : [...acc, curr.address],
      [] as string[]
    );

    return participantWallets?.length;
  }, [participants?.participants]);

  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;
  const { name: projectName, logoUri } = metadata?.data ?? {};

  // const totalSupply = useTotalOutstandingTokens();
  // const totalSupplyFormatted =
  //   totalSupply && token?.data
  //     ? formatUnits(totalSupply, token.data.decimals)
  //     : null;

  return (
    <header>
      <div className="absolute top-0 w-full h-64 overflow-hidden z-[-10]">
          <img
            src="https://juicebox.money/_next/image?url=https%3A%2F%2Fjbm.infura-ipfs.io%2Fipfs%2FQmbtfkWtVocZnakQucppwBEFxdnJsRoMpFKbjtDbkQbapc&w=3840&q=75&dpl=dpl_GPDUQpfXZdursdZ7JpC6ufhYvi65"
            alt="Your image"
            className="inset-0 w-full h-full object-cover mt-16"
          />
      </div>
      <div className="ctWrapper flex flex-col items-start items-start gap-4 pt-48 sm:pt-40 sm:mb-6 mb-4 mx-8">
        {/*<img className="absolute w-full z-[-10] max-h-48 top-[64px]" src="https://juicebox.money/_next/image?url=https%3A%2F%2Fjbm.infura-ipfs.io%2Fipfs%2FQmbtfkWtVocZnakQucppwBEFxdnJsRoMpFKbjtDbkQbapc&w=3840&q=75&dpl=dpl_GPDUQpfXZdursdZ7JpC6ufhYvi65" />*/}
        {logoUri ? (
          <>
            <div className="sm:hidden">
              <Image
                src={ipfsUriToGatewayUrl(logoUri)}
                className="overflow-hidden block border-[3px] border-background rounded-xl"
                alt={"revnet logo"}
                width={120}
                height={10}
              />
            </div>
            <div className="sm:block hidden">
              <Image
                src={ipfsUriToGatewayUrl(logoUri)}
                className="overflow-hidden block border-[4px] border-background rounded-2xl"
                alt={"revnet logo"}
                width={144}
                height={144}
              />
            </div>
          </>
        ) : (
          <div className="rounded bg-[var(--card)] h-36 w-36 flex items-center justify-center">
            {/*<ForwardIcon className="h-5 w-5 text-zinc-700" />*/}
            <Image
                src="./assets/img/branding/icon.svg"
                alt={"Inevitable Logo"}
                width={24}
                height={24}
            />
          </div>
        )}

        <div>
          <div className="flex flex-col items-baseline sm:flex-row sm:gap-2 mb-2">
            <span className="text-3xl font-bold">
              {token?.data ? (
                <EtherscanLink value={token.data.address} type="token">
                  {formatTokenSymbol(token)}
                </EtherscanLink>
              ) : null}
            </span>
            <div className="text-sm flex gap-2 items-baseline">
              <h1 className="text-2xl font-medium">{projectName}</h1>
            </div>
            <div className="text-sm flex gap-2 items-baseline">
              {suckers?.map((pair) => {
                if (!pair) return null;

                const networkSlug =
                  JB_CHAINS[pair?.peerChainId as JBChainId].slug;
                return (
                  <Link
                    className="underline"
                    key={networkSlug}
                    href={`/${networkSlug}:${pair.projectId}`}
                  >
                    <ChainLogo
                      chainId={pair.peerChainId as JBChainId}
                      width={18}
                      height={18}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex sm:flex-row flex-col sm:items-center items-leading sm:gap-4 items-start">
            <TvlDatum />
            <div className="sm:text-xl text-lg">
              <span className="font-medium text-black-500">
                {contributorsCount ?? 0}
              </span>{" "}
              <span className="text-muted-foreground">
                {contributorsCount === 1 ? "owner" : "owners"}
              </span>
            </div>
            {/* <div className="sm:text-xl text-lg">
              <span className="font-medium text-black-500">
                {`${prettyNumber(totalSupplyFormatted ?? 0)}`}
              </span>{" "}
              <span className="text-zinc-500">{formatTokenSymbol(token)} outstanding</span>
            </div> */}
            {/* <div className="sm:text-xl text-lg">
              <span className="font-medium text-black-500">
                {!cashOutLoading
                  ? `$${Number(cashOutValue).toFixed(4)}`
                  : "..."}
              </span>{" "}
              <span className="text-zinc-500">cash out value</span>
            </div> */}
          </div>
        </div>
      </div>
    </header>
  );
}
