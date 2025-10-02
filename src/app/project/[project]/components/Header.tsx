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
        <div className="relative h-[235px] sm:h-[215px]">
          <div className="absolute top-0 z-[-1] h-[328px] w-full overflow-hidden rounded">
            {analyticsData?.daoData?.logo ? (
              <Image
                src={analyticsData?.daoData?.backdrop}
                alt={"Project Logo"}
                className="inset-0 mt-[90px] h-full w-full rounded object-cover"
                width={600}
                height={400}
              />
            ) : (
              <Image
                src="https://juicebox.money/_next/image?url=https%3A%2F%2Fjbm.infura-ipfs.io%2Fipfs%2FQmbtfkWtVocZnakQucppwBEFxdnJsRoMpFKbjtDbkQbapc&w=3840&q=75&dpl=dpl_GPDUQpfXZdursdZ7JpC6ufhYvi65"
                alt="placeholder header image"
                className="inset-0 mt-[90px] h-full w-full rounded object-cover"
                width={600}
                height={400}
              />
            )}
          </div>
        </div>
      </div>
      <div className="ctWrapper mb-4 flex flex-col items-start gap-2 sm:mb-6">
        <div className="mx-4">
          {analyticsData?.daoData?.logo ? (
            <>
              <div className="sm:hidden">
                <Image
                  src={analyticsData?.daoData?.logo}
                  className="block overflow-hidden rounded-xl border-[3px] border-background bg-[var(--card)]"
                  alt={"Project Logo"}
                  width={120}
                  height={10}
                />
              </div>
              <div className="hidden sm:block">
                <Image
                  src={analyticsData?.daoData?.logo}
                  className="block overflow-hidden rounded-2xl border-[4px] border-background bg-[var(--card)]"
                  alt={"Project Logo"}
                  width={144}
                  height={144}
                />
              </div>
            </>
          ) : (
            <div className="flex h-36 w-36 items-center justify-center rounded bg-[var(--card)]">
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-12 gap-y-2">
            <div className="mb-2 flex flex-col items-baseline sm:flex-row sm:gap-2">
              <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <h1 className="text-2xl font-light sm:text-3xl">
                  {analyticsData?.daoData?.name}
                </h1>
                <h5 className="text-base text-cerulean">
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
          <div className="items-leading flex flex-col items-start sm:flex-row sm:items-center sm:gap-4">
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
              <div className="rounded-2xl bg-grey-450 p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="text-2xl font-semibold tracking-wider">
                    Ξ{analyticsData?.daoData?.eth_raised}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm font-light uppercase text-muted-foreground">
                  Raised
                </p>
              </div>

              <div className="rounded-2xl bg-grey-450 p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="w-full text-2xl font-semibold tracking-wider">
                    {analyticsData?.daoData?.payments}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm font-light uppercase text-muted-foreground">
                  Payments
                </p>
              </div>

              <div className="rounded-2xl bg-grey-450 p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="w-full">
                    {analyticsData?.treasuryData?.treasury.address ? (
                      <EthereumAddress
                        address={
                          analyticsData?.treasuryData?.treasury
                            .address as Address
                        }
                        short
                        withEnsAvatar={false}
                        withEnsName
                        avatarProps={{ size: "sm" }}
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
                    {analyticsData?.daoData?.description ? (
                      <>{analyticsData.daoData.date_created}</>
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
          src="/assets/img/clouds/dao_cloud_left.webp"
          style={{ transform: "translateX(-40%)" }}
          alt=""
        />

        {/* Right cloud - shifted slightly left */}
        <img
          className="z-[-10] w-screen select-none"
          src="/assets/img/clouds/dao_cloud_right.webp"
          style={{ transform: "translateX(40%)" }}
          alt=""
        />
      </div>
    </header>
  );
}
