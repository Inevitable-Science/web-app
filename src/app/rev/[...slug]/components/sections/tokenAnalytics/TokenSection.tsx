"use client";

import { formatNumber, truncateAddress } from "@/lib/utils";
import { ChainLogo } from "@/components/ChainLogo";
import { JBChainId, useJBChainId, useSuckers } from "juice-sdk-react";
import { JB_CHAINS } from "juice-sdk-core";

import { Address } from "viem";
import { Loader2 } from "lucide-react";

import { TokenChart } from "@/components/analytics/TokenChart";
import { TokenStatsChart } from "@/components/analytics/TokenStatsChart";
import { useProjectContext } from "../../../ProjectDataContext";

function calculateRatio(
  value1: number | null | undefined,
  value2: number | null | undefined
): string {
  // Handle null/undefined or zero inputs
  if (!value1 || !value2) {
    return "-- --";
  }

  // Handle invalid numbers
  if (isNaN(value1) || isNaN(value2)) {
    return "-- ---";
  }

  const maxValue = Math.max(value1, value2);
  const normalized1 = (value1 / maxValue) * 10;
  const normalized2 = (value2 / maxValue) * 10;

  const rounded1 = Math.round(normalized1 * 10) / 10;
  const rounded2 = Math.round(normalized2 * 10) / 10;

  return `${rounded1} : ${rounded2}`;
}

function getValuationLabel(
  aum: number | null,
  marketCap: number | null
): string {
  if (
    !aum ||
    !marketCap ||
    isNaN(aum) ||
    isNaN(marketCap) ||
    aum <= 0 ||
    marketCap <= 0
  ) {
    return "--";
  }

  const ratio = aum / marketCap;

  if (ratio >= 1.2) return "UNDERVALUED";
  if (ratio >= 0.8) return "FAIR";
  if (ratio >= 0.4) return "STRETCHED";
  return "STRETCHED";
}

export function TokenSection() {
  const { analyticsData, suckers } = useProjectContext();
  const data = analyticsData?.tokenData;

  //const suckersQuery = useSuckers();
  //const suckers = suckersQuery.data;

  return (
    <section>
      {analyticsData?.daoData.name && (
        <div className="mb-4 h-auto max-h-[550px] rounded-2xl bg-grey-450 p-[12px]">
          <TokenChart daoName={analyticsData?.daoData.name} />
        </div>
      )}

      {data ? (
        <div className="flex w-full flex-col gap-4">
          <div className="rounded-2xl bg-grey-450 p-[12px]">
            <h3 className="pb-3 pt-1 text-xl">AUM/MC Ratio</h3>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {calculateRatio(
                    data.assetsUnderManagement,
                    data.selectedToken.marketCap
                  )}
                </h3>
                <p className="font-light uppercase text-muted-foreground">
                  {getValuationLabel(
                    data.assetsUnderManagement,
                    data.selectedToken.marketCap
                  )}
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="flex h-[24px] mb-[4px]">
                  {suckers?.map((pair) => {
                    if (!pair) return null;
                    return (
                      <div className="w-[18px]" key={pair.peerChainId}>
                        <ChainLogo
                          chainId={pair.peerChainId}
                          width={24}
                          height={24}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="font-light uppercase text-muted-foreground">
                  Networks
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-grey-450 p-[12px] py-5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {formatNumber(data.selectedToken.totalSupply)}
                </h3>
                <p className="font-light uppercase text-muted-foreground">
                  Total Supply
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="text-xl">
                  ${formatNumber(data.selectedToken.marketCap)}
                </div>
                <p className="font-light uppercase text-muted-foreground">
                  Market Cap
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {formatNumber(data.selectedToken.averageBal)}
                </h3>
                <p className="font-light uppercase text-muted-foreground">
                  Average Balance
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="text-xl">
                  {formatNumber(data.selectedToken.medianBal)}
                </div>
                <p className="font-light uppercase text-muted-foreground">
                  Median Balance
                </p>
              </div>
            </div>
          </div>

          {data.topHolders && (
            <div className="rounded-2xl bg-grey-450 p-[12px]">
              <div className="background-color mb-2 rounded-xl p-[16px]">
                <h3 className="text-xl">{data.selectedToken.totalHolders}</h3>
                <p className="font-light uppercase text-muted-foreground">
                  Total Holders
                </p>
              </div>

              <h3 className="py-1 text-sm uppercase text-grey-50">
                Top Holders
              </h3>
              <div>
                {data.topHolders.slice(0, 5).map((holder, idx) => {
                  const { address, token_amount } = holder;

                  return (
                    <div
                      key={`${address}-${idx}`}
                      className="flex items-center justify-between border-b border-[#282828] py-3 text-sm font-light text-grey-50"
                    >
                      <span>{truncateAddress(address as Address)}</span>
                      <a
                        href={`https://etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-b border-transparent hover:border-grey-50"
                      >
                        {formatNumber(token_amount, true)}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-4 h-auto max-h-[550px] rounded-2xl bg-grey-450 p-[12px]">
            <TokenStatsChart daoName="cryodao" tokenName="cryo" /> {/* TODO: change */}
          </div>
        </div>
      ) : (
        <div className="my-[15vh] flex w-full justify-center">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}
    </section>
  );
}
