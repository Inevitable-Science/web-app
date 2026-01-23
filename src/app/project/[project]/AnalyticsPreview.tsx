"use client";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useLegacyProjectStore } from "@/store/LegacyProjectContext";
import Link from "next/link";

export function AnalyticsPreview() {
  const treasuryAnalytics = useLegacyProjectStore(
    (state) => state.treasuryAnalytics
  );
  const tokenAnalytics = useLegacyProjectStore((state) => state.tokenAnalytics);
  const daoData = useLegacyProjectStore((state) => state.daoData);

  if (!treasuryAnalytics && !tokenAnalytics) return;

  return (
    <section className="my-4 flex flex-col gap-4">
      {treasuryAnalytics && (
        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <div className="mb-2 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <div className="background-color rounded-2xl p-[16px]">
              {treasuryAnalytics ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  ${formatNumber(Number(treasuryAnalytics.treasuryValue))}
                </h4>
              ) : (
                <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
              )}
              <p className="text-muted-foreground font-light uppercase">
                Treasury Holdings
              </p>
            </div>
            <div className="background-color rounded-2xl p-[16px]">
              {treasuryAnalytics ? (
                <h4 className="mb-0.5 text-xl tracking-wider">
                  $
                  {formatNumber(
                    Number(treasuryAnalytics.assetsUnderManagement)
                  )}
                </h4>
              ) : (
                <div className="activeSkeleton mb-1 h-[28px] w-[142px] rounded"></div>
              )}
              <p className="text-muted-foreground font-light uppercase">
                Assets Under Management
              </p>
            </div>
          </div>

          <Link href={`/project/${daoData.name.toLowerCase()}/treasury`}>
            <Button
              variant="link"
              className="flex h-6 items-center gap-1.5 pl-2 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
            >
              Treasury Stats
              <ArrowRight height="20" width="20" />
            </Button>
          </Link>
        </div>
      )}

      {tokenAnalytics && (
        <div className="bg-grey-450 rounded-2xl p-[12px]">
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
                <p className="text-muted-foreground font-light uppercase">
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
                <p className="text-muted-foreground font-light uppercase">
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
                <p className="text-muted-foreground font-light uppercase">
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
                <p className="text-muted-foreground font-light uppercase">
                  Total Holders
                </p>
              </div>
            </div>
          </div>

          <Link href={`/project/${daoData.name.toLowerCase()}/analytics`}>
            <Button
              variant="link"
              className="flex h-6 items-center gap-1.5 pl-2 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
            >
              Analytics
              <ArrowRight height="20" width="20" />
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
