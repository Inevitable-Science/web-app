import Image from "next/image";
import { EthereumAddress } from "@/components/EthereumAddress";
import { Address } from "viem";
import { useLegacyProjectStore } from "../DataProvider";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";

export function Header() {
  const daoData = useLegacyProjectStore((state) => state.daoData);
  const treasuryAnalytics = useLegacyProjectStore(
    (state) => state.treasuryAnalytics
  );

  return (
    <header>
      <div className="ctWrapper">
        <div className="relative h-[235px] sm:h-[215px]">
          <div className="absolute top-0 z-[-1] mt-[90px] h-[238px] w-full overflow-hidden rounded">
            {daoData?.logo ? (
              <Image
                src={daoData?.backdrop}
                alt={"Project Logo"}
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
          {daoData?.logo ? (
            <>
              <div className="sm:hidden">
                <Image
                  src={daoData?.logo}
                  className="border-background block overflow-hidden rounded-xl border-[3px] bg-(--card)"
                  alt={"Project Logo"}
                  width={120}
                  height={10}
                />
              </div>
              <div className="hidden sm:block">
                <Image
                  src={daoData?.logo}
                  className="border-background block overflow-hidden rounded-2xl border-4 bg-(--card)"
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
          <div className="mb-4 flex flex-wrap items-center justify-between gap-x-12 gap-y-2">
            <div className="mb-2 flex flex-col items-baseline sm:flex-row sm:gap-2">
              <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                <h1 className="text-2xl font-light sm:text-3xl">
                  {daoData?.name}
                </h1>
                <h5 className="text-cerulean text-base">
                  <a
                    href={`https://x.com/@${daoData?.socials.x}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    @{daoData?.socials.x}
                  </a>
                </h5>
              </div>
            </div>
          </div>
          <div className="items-leading flex flex-col items-start sm:flex-row sm:items-center sm:gap-4">
            <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="text-2xl font-semibold tracking-wider">
                    Ξ{daoData?.eth_raised}
                  </h3>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm font-light uppercase">
                  Raised
                </p>
              </div>

              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="w-full text-2xl font-semibold tracking-wider">
                    {daoData?.payments}
                  </h3>
                </div>
                <p className="text-muted-foreground mt-1.5 text-sm font-light uppercase">
                  Payments
                </p>
              </div>

              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="w-full">
                    {treasuryAnalytics?.treasury.address ? (
                      <EthereumAddress
                        address={treasuryAnalytics.treasury.address as Address}
                        chain={JB_CHAINS[treasuryAnalytics.treasury.chain_id as JBChainId].chain}
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
                <p className="text-muted-foreground mt-1.5 text-sm font-light uppercase">
                  Owner
                </p>
              </div>

              <div className="bg-grey-450 rounded-2xl p-[20px]">
                <div className="flex h-fit items-center">
                  <h3 className="text-xl font-light">
                    {daoData?.description ? (
                      <>{daoData.date_created}</>
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
