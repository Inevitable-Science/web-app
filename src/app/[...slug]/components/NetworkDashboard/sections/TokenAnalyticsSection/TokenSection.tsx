"use client";

import { formatNumber, formatDate, truncateAddress } from "@/lib/utils";
import { ChainLogo } from "@/components/ChainLogo";
import { TokenResponse } from '@/lib/types/AnalyticTypes';
import {
  JBChainId,
  useJBChainId,
  useSuckers,
} from "juice-sdk-react";
import { JB_CHAINS } from "juice-sdk-core";
import Link from "next/link";

import { Address } from "viem";
import { LinkIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";

interface DescriptionInterface {
  treasuryHoldings: string;
  assetsUnderManagement: string | number;
  totalHolders: string;
  totalSupply: string | number;
  latestPrice: number;
  latestMarketCap: number;
  tokenName: string;
}

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

export function TokenSection({ data }: DescriptionSectionProps) {
  const chainId = useJBChainId();

  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;

  return (
    <section>
      {data ? (
        <div className="flex flex-col gap-4 w-full">
          <div className="bg-grey-450 p-[12px] rounded-2xl">
            <h3 className="text-grey-50 uppercase text-sm mb-[8px] py-1">Top Holders</h3>
            
          </div>

          <div className="bg-grey-450 p-[12px] rounded-2xl">
            <h3 className="text-xl pt-1 pb-3">AUM/MC Ratio</h3>

            <div className="grid grid-cols-2 gap-3">
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
            <div className="grid grid-cols-2 gap-3">
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

            <div className="grid grid-cols-2 gap-3">
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


          <pre>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      ) : (
        <div className="w-full flex justify-center my-[15vh]">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}
    </section>
  )
}