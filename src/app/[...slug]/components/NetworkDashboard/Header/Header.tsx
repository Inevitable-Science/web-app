"use client";

import {
  ParticipantsDocument,
  SuckerGroupDocument,
} from "@/generated/graphql";
import { useBendystrawQuery } from "@/graphql/useBendystrawQuery";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { formatDate } from "@/lib/utils";
import {
  useJBProjectMetadataContext,
} from "juice-sdk-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Address, formatEther, size } from "viem";
import { EthereumAddress } from "@/components/EthereumAddress";
import { useNetworkData } from "../NetworkDataContext";

export function Header() {
  const { project, dailyTotals } = useNetworkData();
  const { metadata } = useJBProjectMetadataContext(); // Still needed for UI metadata

  const [loadTimestamp] = useState(() => Math.floor(Date.now() / 1000));

  const weeklyVolumeChange = useMemo(() => {
    const aWeekAgoTimestamp = loadTimestamp - 7 * 24 * 60 * 60;

    const accPrevVolume = dailyTotals
      .filter((day) => day.date.getTime() / 1000 < aWeekAgoTimestamp)
      .reduce((acc, day) => acc + day.volume, 0n);

    const accCurVolume = dailyTotals
      .filter((day) => day.date.getTime() / 1000 >= aWeekAgoTimestamp)
      .reduce((acc, day) => acc + day.volume, 0n);

    if (accPrevVolume === 0n) return accCurVolume > 0n ? "New" : 0;

    const difference = accCurVolume - accPrevVolume;
    const percentage = (Number(difference) * 100) / Number(accPrevVolume);
    return percentage.toFixed(2);
  }, [dailyTotals, loadTimestamp]);

  const { name: projectName, logoUri, twitter, introImageUri } = metadata?.data ?? {};

  const suckerGroup = useBendystrawQuery(SuckerGroupDocument, {
    id: project?.suckerGroupId ?? "",
  });

  const { data: participants } = useBendystrawQuery(ParticipantsDocument, {
    where: {
      suckerGroupId: suckerGroup.data?.suckerGroup?.id,
      balance_gt: 0,
    },
    limit: 1000 // BUG: will break once more than 1000 participants exist
  });

  const suckerGroupData = participants?.participants;

  return (
    <header>
      <div className="ctWrapper">
        <div className="relative sm:h-[215px] h-[235px]">
          <div className="absolute top-0 w-full h-[328px] overflow-hidden z-[-1] rounded">
            {/* "FE_TODO: You may need to adjust these sizes." */}
            { introImageUri ? (
              <Image
                src={ipfsUriToGatewayUrl(introImageUri)}
                alt={"project header image"}
                className="inset-0 w-full h-full object-cover mt-[90px] rounded"
                width={600}
                height={400}
              />
            ) : (
              <Image
                src="https://juicebox.money/_next/image?url=https%3A%2F%2Fjbm.infura-ipfs.io%2Fipfs%2FQmbtfkWtVocZnakQucppwBEFxdnJsRoMpFKbjtDbkQbapc&w=3840&q=75&dpl=dpl_GPDUQpfXZdursdZ7JpC6ufhYvi65" 
                alt="placeholder header image"
                className="inset-0 w-full h-full object-cover mt-[90px] rounded"
                width={600}
                height={400}
              />
            )}
          </div>
        </div>
      </div>
      <div className="ctWrapper flex flex-col items-start items-start gap-2 sm:mb-6 mb-4">
        <div className="mx-4">
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
              <Image
                  src="./assets/img/branding/icon.svg"
                  alt={"Inevitable Logo"}
                  width={24}
                  height={24}
              />
            </div>
          )}
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between gap-x-12 gap-y-2 mb-4 flex-wrap">
            <div className="flex flex-col items-baseline sm:flex-row sm:gap-2 mb-2">
              <div className="text-sm flex flex-wrap gap-x-2 items-baseline">
                <h1 className="text-2xl sm:text-3xl font-light">{projectName}</h1>
                <h5 className="text-cerulean text-base">
                  <a href={`https://x.com/@${twitter}`}>@{twitter}</a>
                </h5>
              </div>
            </div>
          </div>
          <div className="flex sm:flex-row flex-col sm:items-center items-leading sm:gap-4 items-start">
            <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
              <div className="bg-grey-450 p-[20px] rounded-2xl">
                <div className="h-fit flex items-center">
                  <h3 className="text-2xl font-semibold tracking-wider">
                    Ξ{project?.volume ? parseFloat(formatEther(BigInt(project.volume))).toFixed(2) : "0.00"}
                  </h3>
                </div>
                <p className="uppercase text-muted-foreground font-light text-sm mt-1.5">Raised</p>
              </div>

              <div className="bg-grey-450 p-[20px] rounded-2xl">
                <div className="h-fit flex items-center">
                  <h3 className="text-2xl font-semibold tracking-wider w-full">
                    {suckerGroupData?.totalCount ?? <div className="activeSkeleton h-[32px] max-w-[142px] w-full rounded-md"/> }
                  </h3>
                </div>
                <p className="uppercase text-muted-foreground font-light text-sm mt-1.5">Payments</p>
              </div>

              <div className="bg-grey-450 p-[20px] rounded-2xl">
                <div className="h-fit flex items-center">
                  <div className="bg-cerulean w-fit rounded-full px-2 py-1 font-medium">
                    { weeklyVolumeChange != null ? `${weeklyVolumeChange}%` : <div className="activeSkeleton h-[24px] w-[64px] !bg-transparent rounded-md"/> }
                  </div>
                </div>
                <p className="uppercase text-muted-foreground font-light text-sm mt-1.5">Weekly Vol Change</p>
              </div>

              <div className="bg-grey-450 p-[20px] rounded-2xl">
                <div className="h-fit flex items-center">
                  <h3 className="w-full">
                    {project?.owner ? (
                    <EthereumAddress
                      address={project?.owner as Address}
                      short
                      withEnsAvatar={false}
                      withEnsName
                      avatarProps={{ size: "sm" }} 
                      className="text-xl font-light"
                    />
                    ) : (
                      <div className="activeSkeleton h-[28px] max-w-[142px] w-full rounded-md"/>
                    )
                    }
                  </h3>
                </div>
                <p className="uppercase text-muted-foreground font-light text-sm mt-1.5">Owner</p>
              </div>

              <div className="bg-grey-450 p-[20px] rounded-2xl">
                <div className="h-fit flex items-center">
                  <h3 className="text-xl font-light">
                    {project?.createdAt ? (
                      formatDate(new Date(project.createdAt * 1000), true)
                    ) : (
                      <div className="activeSkeleton h-[28px] max-w-[142px] w-full rounded-md"/>
                    )
                    }
                  </h3>
                </div>
                <p className="uppercase text-muted-foreground font-light text-sm mt-1.5">Date Created</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div 
          className="absolute z-[-10] w-screen flex justify-center items-center overflow-hidden"
          style={{ transform: "translateY(-60%)" }}
        >
          {/* Left cloud - shifted slightly right */}
          <img 
            className="z-[-10] select-none w-screen" 
            src="/assets/img/clouds/dao_cloud_left.png" 
            style={{ transform: "translateX(-40%)" }}
          />

          {/* Right cloud - shifted slightly left */}
          <img 
            className="z-[-10] select-none w-screen" 
            src="/assets/img/clouds/dao_cloud_right.png" 
            style={{ transform: "translateX(40%)" }}
          />
        </div>
    </header>
  );
}
