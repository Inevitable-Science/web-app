"use client";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { useProjectDataStore } from "@/app/rev/[...slug]/ProjectDataContext";
import { ArrowRight } from "lucide-react";

interface TreasuryPreview {
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

export function DaoData() {
  const treasuryAnalytics = useProjectDataStore((state) => state.treasuryAnalytics);
  const tokenAnalytics = useProjectDataStore((state) => state.tokenAnalytics);
  const setSelectedTab = useProjectDataStore((state) => state.setSelectedTab);

  if (!treasuryAnalytics && !tokenAnalytics) return;

  return (
    <section className="mt-6 flex flex-col gap-6">
      {treasuryAnalytics && (
      <div className="rounded-2xl bg-grey-450 p-[12px]">
        <div className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <div className="background-color rounded-2xl p-[16px]">
            {treasuryAnalytics ? (
              <h4 className="mb-0.5 text-xl tracking-wider">
                ${formatNumber(Number(treasuryAnalytics.treasuryValue))}
              </h4>
            ) : (
              <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
            )}
            <p className="font-light uppercase text-muted-foreground">
              Treasury Holdings
            </p>
          </div>
          <div className="background-color rounded-2xl p-[16px]">
            {treasuryAnalytics ? (
              <h4 className="mb-0.5 text-xl tracking-wider">
                ${formatNumber(Number(treasuryAnalytics.assetsUnderManagement))}
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
          <ArrowRight height="20" width="20" />
        </Button>
      </div>
      )}

      {tokenAnalytics && (
      <div className="rounded-2xl bg-grey-450 p-[12px]">
        <div className="mb-2 flex flex-col gap-2">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <div className="background-color rounded-2xl p-[16px]">
              {tokenAnalytics ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  {formatNumber(
                    Number(tokenAnalytics?.selectedToken.averageBal)
                  )}
                </h4>
              ) : (
                <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
              )}
              <p className="font-light uppercase text-muted-foreground">
                Average {`${tokenAnalytics?.selectedToken.ticker} `}
                Balance
              </p>
            </div>
            <div className="background-color rounded-2xl p-[16px]">
              {tokenAnalytics ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  {formatNumber(
                    Number(tokenAnalytics.selectedToken.totalSupply)
                  )}
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
              {tokenAnalytics ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  $
                  {formatNumber(
                    Number(tokenAnalytics.selectedToken.marketCap)
                  )}
                </h4>
              ) : (
                <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
              )}
              <p className="font-light uppercase text-muted-foreground">
                Market Cap
              </p>
            </div>
            <div className="background-color rounded-2xl p-[16px]">
              {tokenAnalytics ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  {formatNumber(
                    Number(tokenAnalytics.selectedToken.totalHolders)
                  )}
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
          <ArrowRight height="20" width="20" />
        </Button>
      </div>
      )}
    </section>
  );
}
