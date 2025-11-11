"use client";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "@/lib/utils";
import { useProjectContext } from "@/app/[...slug]/ProjectDataContext";

interface TreasuryPreview {
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

export function DaoData({ setSelectedTab }: TreasuryPreview) {
  const { analyticsData } = useProjectContext();
  const data = analyticsData?.treasuryData;

  if (!analyticsData) return;

  return (
    <section className="mt-6 flex flex-col gap-6">
      <div className="rounded-2xl bg-grey-450 p-[12px]">
        <div className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <div className="background-color rounded-2xl p-[16px]">
            {data ? (
              <h4 className="mb-0.5 text-xl tracking-wider">
                ${formatNumber(Number(data.treasuryValue))}
              </h4>
            ) : (
              <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
            )}
            <p className="font-light uppercase text-muted-foreground">
              Treasury Holdings
            </p>
          </div>
          <div className="background-color rounded-2xl p-[16px]">
            {data ? (
              <h4 className="mb-0.5 text-xl tracking-wider">
                ${formatNumber(Number(data.assetsUnderManagement))}
              </h4>
            ) : (
              <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
            )}
            <p className="font-light uppercase text-muted-foreground">
              Assets Under Management
            </p>
          </div>
        </div>

        <Button
          onClick={() => setSelectedTab("activity")}
          variant="link"
          className="flex h-6 items-center gap-1.5 pl-2 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
        >
          Treasury Stats
          <ArrowRightIcon height="20" width="20" />
        </Button>
      </div>

      <div className="rounded-2xl bg-grey-450 p-[12px]">
        <div className="mb-2 flex flex-col gap-2">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <div className="background-color rounded-2xl p-[16px]">
              {data ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  {formatNumber(Number(analyticsData.tokenData?.selectedToken.averageBal))}
                </h4>
              ) : (
                <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
              )}
              <p className="font-light uppercase text-muted-foreground">
                Average {`${analyticsData?.daoData.nativeToken.mc_ticker} `}Balance
               </p>
            </div>
            <div className="background-color rounded-2xl p-[16px]">
              {data ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  {formatNumber(Number(analyticsData.tokenData?.selectedToken.totalSupply))}
                </h4>
              ) : (
                <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
              )}
              <p className="font-light uppercase text-muted-foreground">
                Total Supply
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <div className="background-color rounded-2xl p-[16px]">
              {data ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  ${formatNumber(Number(analyticsData.tokenData?.selectedToken.marketCap))}
                </h4>
              ) : (
                <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
              )}
              <p className="font-light uppercase text-muted-foreground">
                Market Cap
              </p>
            </div>
            <div className="background-color rounded-2xl p-[16px]">
              {data ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  {formatNumber(Number(analyticsData.tokenData?.selectedToken.totalHolders))}
                </h4>
              ) : (
                <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
              )}
              <p className="font-light uppercase text-muted-foreground">
                Total Holders
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setSelectedTab("analytics")}
          variant="link"
          className="flex h-6 items-center gap-1.5 pl-2 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
        >
          Analytics
          <ArrowRightIcon height="20" width="20" />
        </Button>
      </div>
    </section>
  );
};
