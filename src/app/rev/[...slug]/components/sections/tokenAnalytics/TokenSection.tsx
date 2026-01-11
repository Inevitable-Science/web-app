"use client";

import { formatNumber, truncateAddress } from "@/lib/utils";
import { ChainLogo } from "@/components/ChainLogo";

import { Address } from "viem";
import { Loader2 } from "lucide-react";

import { TokenChart } from "@/components/analytics/TokenChart";
import { TokenStatsChart } from "@/components/analytics/TokenStatsChart";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

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
  const tokenAnalytics = useRevnetDataStore((state) => state.tokenAnalytics);
  const suckers = useRevnetDataStore((state) => state.suckers);

  return (
    <section>
      {tokenAnalytics?.selectedToken.ticker && (
        <div className="bg-grey-450 mb-4 h-auto max-h-[550px] rounded-2xl p-[12px]">
          <TokenChart tokenTicker={tokenAnalytics.selectedToken.ticker} />
        </div>
      )}

      {tokenAnalytics ? (
        <div className="flex w-full flex-col gap-4">
          <div className="bg-grey-450 rounded-2xl p-[12px]">
            <h3 className="pt-1 pb-3 text-xl">AUM/MC Ratio</h3>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {calculateRatio(
                    tokenAnalytics.assetsUnderManagement,
                    tokenAnalytics.selectedToken.marketCap
                  )}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  {getValuationLabel(
                    tokenAnalytics.assetsUnderManagement,
                    tokenAnalytics.selectedToken.marketCap
                  )}
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="mb-[4px] flex h-[24px]">
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
                <p className="text-muted-foreground font-light uppercase">
                  Networks
                </p>
              </div>
            </div>
          </div>

          <div className="bg-grey-450 flex flex-col gap-3 rounded-2xl p-[12px] py-5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {formatNumber(tokenAnalytics.selectedToken.totalSupply)}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  Total Supply
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="text-xl">
                  ${formatNumber(tokenAnalytics.selectedToken.marketCap)}
                </div>
                <p className="text-muted-foreground font-light uppercase">
                  Market Cap
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {formatNumber(tokenAnalytics.selectedToken.averageBal)}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  Average Balance
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="text-xl">
                  {formatNumber(tokenAnalytics.selectedToken.medianBal)}
                </div>
                <p className="text-muted-foreground font-light uppercase">
                  Median Balance
                </p>
              </div>
            </div>
          </div>

          {tokenAnalytics.topHolders && (
            <div className="bg-grey-450 rounded-2xl p-[12px]">
              <div className="background-color mb-2 rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {tokenAnalytics.selectedToken.totalHolders}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  Total Holders
                </p>
              </div>

              <h3 className="text-grey-50 py-1 text-sm uppercase">
                Top Holders
              </h3>
              <div>
                {tokenAnalytics.topHolders.slice(0, 5).map((holder, idx) => {
                  const { address, token_amount } = holder;

                  return (
                    <div
                      key={`${address}-${idx}`}
                      className="text-grey-50 flex items-center justify-between border-b border-[#282828] py-3 text-sm font-light"
                    >
                      <span>{truncateAddress(address as Address)}</span>
                      <a
                        href={`https://etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:border-grey-50 border-b border-transparent"
                      >
                        {formatNumber(token_amount, true)}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tokenAnalytics.selectedToken.ticker && (
            <div className="bg-grey-450 mb-4 h-auto max-h-[550px] rounded-2xl p-[12px]">
              <TokenStatsChart tokenTicker={tokenAnalytics.selectedToken.ticker} />
            </div>
          )}
        </div>
      ) : (
        <div className="my-[15vh] flex w-full justify-center">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}
    </section>
  );
}
