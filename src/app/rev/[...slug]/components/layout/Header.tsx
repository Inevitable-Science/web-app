"use client";

import {
  ParticipantsDocument,
  ProjectOperatorDocument,
  SuckerGroupDocument,
} from "@/generated/graphql";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { formatDate } from "@/lib/utils";
import {
  useJBProjectMetadataContext,
  useBendystrawQuery,
  useJBChainId,
  useJBContractContext,
} from "juice-sdk-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Address, formatEther } from "viem";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { JB_CHAINS } from "juice-sdk-core";

export function Header() {
  const project = useRevnetDataStore((state) => state.project);
  const dailyTotals = useRevnetDataStore((state) => state.dailyTotals);
  const { metadata } = useJBProjectMetadataContext();
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  const { data: operator, isLoading } = useBendystrawQuery(
    ProjectOperatorDocument,
    {
      chainId: Number(chainId),
      projectId: Number(projectId),
      version,
      skip: !chainId || !projectId || !version || version !== 5,
    }
  );

  const owner = (
    version === 4 || !operator?.permissionHolders?.items[0]?.operator
      ? project.owner
      : operator?.permissionHolders?.items[0]?.operator
  ) as Address;

  const [loadTimestamp] = useState(() => Math.floor(Date.now() / 1000));

  const weeklyVolumeChange = useMemo(() => {
    const aWeekAgoTimestamp = loadTimestamp - 7 * 24 * 60 * 60;

    const accPrevVolume = dailyTotals
      .filter((day) => day.date.getTime() / 1000 < aWeekAgoTimestamp)
      .reduce((acc, day) => acc + day.volume, 0n);

    const accCurVolume = dailyTotals
      .filter((day) => day.date.getTime() / 1000 >= aWeekAgoTimestamp)
      .reduce((acc, day) => acc + day.volume, 0n);

    if (accPrevVolume === 0n) {
      const percentage = accCurVolume > 0n ? 100 : 0;
      return percentage.toFixed(2);
    }

    const difference = accCurVolume - accPrevVolume;
    const percentage = (Number(difference) * 100) / Number(accPrevVolume);

    return `+${Math.abs(percentage).toFixed(2)}`;
  }, [dailyTotals, loadTimestamp]);

  const {
    name: projectName,
    logoUri,
    twitter,
    introImageUri,
    coverImageUri,
  } = metadata?.data ?? {};

  const suckerGroup = useBendystrawQuery(SuckerGroupDocument, {
    id: project?.suckerGroupId ?? "",
  });

  const { data: participants } = useBendystrawQuery(ParticipantsDocument, {
    where: {
      suckerGroupId: project.suckerGroupId,
      balance_gt: 0,
    },
    limit: 10, // Limit this to 10, items length is unused
  });

  return (
    <header>
      <div className="ctWrapper">
        <div className="relative h-[235px] sm:h-[215px]">
          <div className="absolute top-0 z-[-1] mt-[90px] h-[238px] w-full overflow-hidden rounded">
            {coverImageUri ? (
              <Image
                src={ipfsUriToGatewayUrl(coverImageUri)}
                alt={"project header image"}
                className="inset-0 h-full w-full rounded object-cover"
                width={600}
                height={400}
              />
            ) : (
              <div className="background-color inset-0 flex h-full w-full items-center justify-center rounded opacity-85">
                <Image
                  src="https://cdn.inevitable.science/static/img/branding/logo.svg"
                  alt="placeholder header image"
                  className="h-16 w-auto"
                  width={1800}
                  height={1200}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="ctWrapper mb-4 flex flex-col items-start gap-2 sm:mb-6">
        <div className="mx-4">
          {logoUri ? (
            <>
              <div className="sm:hidden">
                <Image
                  src={ipfsUriToGatewayUrl(logoUri)}
                  className="border-background block overflow-hidden rounded-xl border-[3px]"
                  alt={"Project Logo"}
                  width={120}
                  height={10}
                />
              </div>
              <div className="hidden sm:block">
                <Image
                  src={ipfsUriToGatewayUrl(logoUri)}
                  className="border-background block overflow-hidden rounded-2xl border-4"
                  alt={"Project Logo"}
                  width={144}
                  height={144}
                />
              </div>
            </>
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded bg-(--card)">
              <Image
                src="https://cdn.inevitable.science/static/img/branding/icon.svg"
                alt={"Inevitable Logo"}
                width={24}
                height={24}
              />
            </div>
          )}
        </div>

        <div className="w-full">
          <div className="mb-6 flex flex-wrap items-baseline gap-2 text-sm">
            {projectName ? (
              <h1 className="text-2xl font-light sm:text-3xl">{projectName}</h1>
            ) : (
              <div className="activeSkeleton h-[36px] w-[130px] rounded-lg opacity-70" />
            )}
            {twitter && (
              <h5 className="text-cerulean text-base">
                <a
                  href={`https://x.com/${twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {!twitter.startsWith("@") && "@"}
                  {twitter}
                </a>
              </h5>
            )}
          </div>
          <div className="items-leading flex flex-col items-start sm:flex-row sm:items-center sm:gap-4">
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="text-2xl font-semibold tracking-wider">
                    Ξ
                    {suckerGroup.data?.suckerGroup?.volume
                      ? parseFloat(
                          formatEther(
                            BigInt(suckerGroup.data.suckerGroup.volume)
                          )
                        ).toFixed(2)
                      : "0.00"}
                  </h3>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm font-light uppercase">
                  Raised
                </p>
              </div>

              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="w-full text-2xl font-semibold tracking-wider">
                    {participants?.participants?.totalCount ?? (
                      <div className="activeSkeleton h-[32px] w-full max-w-[142px] rounded-md" />
                    )}
                  </h3>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm font-light uppercase">
                  Payments
                </p>
              </div>

              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <div className="bg-cerulean w-fit rounded-full px-2 py-1 font-medium">
                    {weeklyVolumeChange != null ? (
                      `${weeklyVolumeChange}%`
                    ) : (
                      <div className="activeSkeleton h-[24px] w-[64px] rounded-md bg-transparent!" />
                    )}
                  </div>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm font-light uppercase">
                  Weekly Vol Change
                </p>
              </div>

              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="w-full">
                    {isLoading ? (
                      <div className="activeSkeleton h-[28px] w-full max-w-[142px] rounded-md" />
                    ) : (
                      <EthereumAddress
                        address={owner}
                        short
                        withEnsAvatar={false}
                        withEnsName
                        className="text-xl font-light"
                        chain={JB_CHAINS[chainId ?? 1].chain}
                      />
                    )}
                  </h3>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm font-light uppercase">
                  Owner
                </p>
              </div>

              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="text-xl font-light">
                    {project?.createdAt ? (
                      formatDate(new Date(project.createdAt * 1000), true)
                    ) : (
                      <div className="activeSkeleton h-[28px] w-full max-w-[142px] rounded-md" />
                    )}
                  </h3>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm font-light uppercase">
                  Date Created
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute -z-10 flex max-w-screen items-center justify-center overflow-hidden"
        style={{ transform: "translateY(-60%)" }}
      >
        {/* Left cloud - shifted slightly right */}
        <img
          className="-z-10 w-screen select-none"
          src="https://cdn.inevitable.science/static/img/clouds/dao_cloud_left.webp"
          style={{ transform: "translateX(-40%)" }}
          alt=""
        />

        {/* Right cloud - shifted slightly left */}
        <img
          className="-z-10 w-screen select-none"
          src="https://cdn.inevitable.science/static/img/clouds/dao_cloud_right.webp"
          style={{ transform: "translateX(40%)" }}
          alt=""
        />
      </div>
    </header>
  );
}
