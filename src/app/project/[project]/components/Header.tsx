"use client";
import Image from "next/image";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Address } from "viem";
import { useData } from "../DataProvider";


export function Header() {
  const { analyticsData } = useData();

  return (
    <header>
      <div className="ctWrapper">
        <div className="relative sm:h-[215px] h-[235px]">
          <div className="absolute top-0 w-full h-[328px] overflow-hidden z-[-1] rounded">
            {/* "FE_TODO: You may need to adjust these sizes." */}
            {analyticsData?.daoData?.logo ? (
              <Image
                src={analyticsData?.daoData?.backdrop}
                alt={"Project Logo"}
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
          {analyticsData?.daoData?.logo ? (
            <>
              <div className="sm:hidden">
                <Image
                  src={analyticsData?.daoData?.logo}
                  className="overflow-hidden bg-[var(--card)] block border-[3px] border-background rounded-xl"
                  alt={"Project Logo"}
                  width={120}
                  height={10}
                />
              </div>
              <div className="sm:block hidden">
                <Image
                  src={analyticsData?.daoData?.logo}
                  className="overflow-hidden bg-[var(--card)] block border-[4px] border-background rounded-2xl"
                  alt={"Project Logo"}
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
                <h1 className="text-2xl sm:text-3xl font-light">{analyticsData?.daoData?.name}</h1>
                <h5 className="text-cerulean text-base">
                  <a
                    href={`https://x.com/@${analyticsData?.daoData?.socials.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{analyticsData?.daoData?.socials.x}
                  </a>
                </h5>
              </div>
            </div>
          </div>
          <div className="flex sm:flex-row flex-col sm:items-center items-leading sm:gap-4 items-start">
            <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
              <div className="bg-grey-450 p-[20px] rounded-2xl">
                <div className="h-fit flex items-center">
                  <h3 className="text-2xl font-semibold tracking-wider">
                    Ξ{analyticsData?.daoData?.eth_raised}
                  </h3>
                </div>
                <p className="uppercase text-muted-foreground font-light text-sm mt-1.5">Raised</p>
              </div>

              <div className="bg-grey-450 p-[20px] rounded-2xl">
                <div className="h-fit flex items-center">
                  <h3 className="text-2xl font-semibold tracking-wider w-full">
                    {analyticsData?.daoData?.payments}
                  </h3>
                </div>
                <p className="uppercase text-muted-foreground font-light text-sm mt-1.5">Payments</p>
              </div>

              <div className="bg-grey-450 p-[20px] rounded-2xl">
                <div className="h-fit flex items-center">
                  <h3 className="w-full">
                    {analyticsData?.treasuryData?.treasury.address ? (
                    <EthereumAddress
                      address={analyticsData?.treasuryData?.treasury.address as Address}
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
                    {analyticsData?.daoData?.description ? (
                      <>
                        {analyticsData.daoData.date_created}
                      </>
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
          className="absolute z-[-10] max-w-screen flex justify-center items-center overflow-hidden"
          style={{ transform: "translateY(-60%)" }}
        >
          {/* Left cloud - shifted slightly right */}
          <img
            className="z-[-10] select-none w-screen"
            src="/assets/img/clouds/dao_cloud_left.webp"
            style={{ transform: "translateX(-40%)" }}
            alt=""
          />

          {/* Right cloud - shifted slightly left */}
          <img
            className="z-[-10] select-none w-screen"
            src="/assets/img/clouds/dao_cloud_right.webp"
            style={{ transform: "translateX(40%)" }}
            alt=""
          />
        </div>
    </header>
  );
}
