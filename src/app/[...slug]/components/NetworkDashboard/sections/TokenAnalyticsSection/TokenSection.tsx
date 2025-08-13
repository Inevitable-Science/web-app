"use client";

import { formatNumber, truncateAddress } from "@/lib/utils";
import { ChainLogo } from "@/components/ChainLogo";
import { TokenResponse } from "@/lib/types/AnalyticTypes";
import {
  JBChainId,
  useJBChainId,
  useSuckers,
} from "juice-sdk-react";
import { JB_CHAINS } from "juice-sdk-core";

import { Address } from "viem";
import { Loader2 } from "lucide-react";

import TokenChart from "./TokenChart";
import TokenStatsChart from "./TokenStatsChart";
import { useNetworkData } from "../../NetworkDataContext";


interface DescriptionSectionProps {
  data: TokenResponse | null;
}

function calculateRatio(value1: number | null | undefined, value2: number | null | undefined): string {
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

function getValuationLabel(aum: number | null, marketCap: number | null): string {
  if (
    !aum || !marketCap ||
    isNaN(aum) || isNaN(marketCap) ||
    aum <= 0 || marketCap <= 0
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
  const { analyticsData } = useNetworkData();
  const data = analyticsData?.tokenData;

  const chainId = useJBChainId();

  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;

  return (
    <section>

      <div className="bg-grey-450 rounded-2xl h-auto max-h-[550px] p-[12px] mb-4">
        <TokenChart organisation="cryodao"/>
      </div>

      {data ? (
        <div className="flex flex-col gap-4 w-full">
          <div className="bg-grey-450 p-[12px] rounded-2xl">
            <h3 className="text-xl pt-1 pb-3">AUM/MC Ratio</h3>

            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              <div className="background-color p-[16px] rounded-xl">
                <h3 className="text-xl">
                  {calculateRatio(data.assetsUnderManagement, data.selectedToken.marketCap)}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  {getValuationLabel(data.assetsUnderManagement, data.selectedToken.marketCap)}
                </p>
              </div>
              <div className="background-color p-[16px] rounded-2xl">
                <div className="flex gap-2 h-[24px] mb-[4px]">
                  {suckers?.map((pair) => {
                    if (!pair) return null;

                    const networkSlug =
                      JB_CHAINS[pair?.peerChainId as JBChainId].slug;
                    return (
                      <ChainLogo
                        key={pair.peerChainId}
                        chainId={pair.peerChainId as JBChainId}
                        width={24}
                        height={24}
                      />
                    );
                  })}
                </div>
                <p className="text-muted-foreground font-light uppercase">Networks</p>
              </div>
            </div>
          </div>



          <div className="bg-grey-450 p-[12px] rounded-2xl flex flex-col gap-3 py-5">
            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              <div className="background-color p-[16px] rounded-xl">
                <h3 className="text-xl">
                  {formatNumber(data.selectedToken.totalSupply)}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  Total Supply
                </p>
              </div>
              <div className="background-color p-[16px] rounded-2xl">
                <div className="text-xl">
                  ${formatNumber(data.selectedToken.marketCap)}
                </div>
                <p className="text-muted-foreground font-light uppercase">
                  Market Cap
                </p>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
              <div className="background-color p-[16px] rounded-xl">
                <h3 className="text-xl">
                  {formatNumber(data.selectedToken.averageBal)}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  Average Balance
                </p>
              </div>
              <div className="background-color p-[16px] rounded-2xl">
                <div className="text-xl">
                  {formatNumber(data.selectedToken.medianBal)}
                </div>
                <p className="text-muted-foreground font-light uppercase">
                  Median Balance
                </p>
              </div>
            </div>
          </div>


          {data.topHolders && (
            <div className="bg-grey-450 p-[12px] rounded-2xl">
              <div className="background-color p-[16px] rounded-xl mb-2">
                <h3 className="text-xl">
                  {data.selectedToken.totalHolders}
                </h3>
                <p className="text-muted-foreground font-light uppercase">Total Holders</p>
              </div>

              <h3 className="text-grey-50 uppercase text-sm py-1">Top Holders</h3>
              <div>
                {data.topHolders.slice(0, 5).map((holder, idx) => {
                  const { address, token_amount } = holder;

                  return (
                    <div
                      key={`${address}-${idx}`}
                      className="flex justify-between items-center py-3 border-b border-[#282828] text-grey-50 text-sm font-light"
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


          {/*{data.tokenDistribution && (
            <div className="bg-grey-450 p-[12px] rounded-2xl">
              <h3 className="text-grey-50 uppercase text-sm pt-1">Holder Distribution</h3>

              <div className="background-color p-[16px] rounded-xl mt-2">
                <h3 className="text-xl">
                  {data.selectedToken.totalHolders}
                </h3>
                <p className="text-muted-foreground font-light uppercase">Total Holders</p>
              </div>

              <div>
                {data.tokenDistribution.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 border-b border-[#282828] text-grey-50 text-sm font-light"
                  >
                    <div className="flex flex-col">
                      <span className="text-grey-300">{item.range} ({item.accounts} accounts)</span>
                    </div>
                    <div className="text-right">
                      <div className="text-grey-500">{item.percent_tokens_held?.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}*/}


          <div className="bg-grey-450 rounded-2xl h-auto max-h-[550px] p-[12px] mb-4">
            <TokenStatsChart organisation="cryodao" tokenName="cryo" />
          </div>


          {/*<pre>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>*/}
        </div>
      ) : (
        <div className="w-full flex justify-center my-[15vh]">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}
    </section>
  )
}