"use client";

import { ParticipantsDocument, SuckerGroupDocument } from "@/generated/graphql";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { formatDate } from "@/lib/utils";
import {
  useJBProjectMetadataContext,
  useBendystrawQuery,
} from "juice-sdk-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Address, formatEther } from "viem";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useProjectContext } from "../../ProjectDataContext";

export function Header() {
  const { project, dailyTotals } = useProjectContext();
  const { metadata } = useJBProjectMetadataContext();

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
    return `+${percentage.toFixed(2)}`;
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
      suckerGroupId: suckerGroup.data?.suckerGroup?.id,
      balance_gt: 0,
    },
    limit: 1000, // BUG: will break once more than 1000 participants exist
  });

  const suckerGroupData = participants?.participants;

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
                  className="block overflow-hidden rounded-xl border-[3px] border-background"
                  alt={"Project Logo"}
                  width={120}
                  height={10}
                />
              </div>
              <div className="hidden sm:block">
                <Image
                  src={ipfsUriToGatewayUrl(logoUri)}
                  className="block overflow-hidden rounded-2xl border-[4px] border-background"
                  alt={"Project Logo"}
                  width={144}
                  height={144}
                />
              </div>
            </>
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded bg-[var(--card)]">
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
              <h5 className="text-base text-cerulean">
                <a
                  href={`https://x.com/@${twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{twitter}
                </a>
              </h5>
            )}
          </div>
          <div className="items-leading flex flex-col items-start sm:flex-row sm:items-center sm:gap-4">
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
              <div className="rounded-2xl bg-grey-450 p-[20px]">
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
                <p className="mt-1.5 text-sm font-light uppercase text-muted-foreground">
                  Raised
                </p>
              </div>

              <div className="rounded-2xl bg-grey-450 p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="w-full text-2xl font-semibold tracking-wider">
                    {suckerGroupData?.totalCount ?? (
                      <div className="activeSkeleton h-[32px] w-full max-w-[142px] rounded-md" />
                    )}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm font-light uppercase text-muted-foreground">
                  Payments
                </p>
              </div>

              <div className="rounded-2xl bg-grey-450 p-[20px]">
                <div className="flex h-fit items-center">
                  <div className="w-fit rounded-full bg-cerulean px-2 py-1 font-medium">
                    {weeklyVolumeChange != null ? (
                      `${weeklyVolumeChange}%`
                    ) : (
                      <div className="activeSkeleton h-[24px] w-[64px] rounded-md !bg-transparent" />
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-sm font-light uppercase text-muted-foreground">
                  Weekly Vol Change
                </p>
              </div>

              <div className="rounded-2xl bg-grey-450 p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="w-full">
                    {project?.owner ? (
                      <EthereumAddress
                        address={project?.owner as Address}
                        short
                        withEnsAvatar={false}
                        withEnsName
                        className="text-xl font-light"
                      />
                    ) : (
                      <div className="activeSkeleton h-[28px] w-full max-w-[142px] rounded-md" />
                    )}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm font-light uppercase text-muted-foreground">
                  Owner
                </p>
              </div>

              <div className="rounded-2xl bg-grey-450 p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="text-xl font-light">
                    {project?.createdAt ? (
                      formatDate(new Date(project.createdAt * 1000), true)
                    ) : (
                      <div className="activeSkeleton h-[28px] w-full max-w-[142px] rounded-md" />
                    )}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm font-light uppercase text-muted-foreground">
                  Date Created
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="max-w-screen absolute z-[-10] flex items-center justify-center overflow-hidden"
        style={{ transform: "translateY(-60%)" }}
      >
        {/* Left cloud - shifted slightly right */}
        <img
          className="z-[-10] w-screen select-none"
          src="https://cdn.inevitable.science/static/img/clouds/dao_cloud_left.webp"
          style={{ transform: "translateX(-40%)" }}
          alt=""
        />

        {/* Right cloud - shifted slightly left */}
        <img
          className="z-[-10] w-screen select-none"
          src="https://cdn.inevitable.science/static/img/clouds/dao_cloud_right.webp"
          style={{ transform: "translateX(40%)" }}
          alt=""
        />
      </div>
    </header>
  );
}
