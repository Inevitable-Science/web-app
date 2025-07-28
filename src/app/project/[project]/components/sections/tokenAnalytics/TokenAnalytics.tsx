"use client";

import { useState, useEffect } from "react";
import { formatNumber, truncateAddress } from "@/lib/utils";
import { ChainLogo } from "@/components/ChainLogo";
import { TokenResponse } from '@/lib/types/AnalyticTypes';
import {
  JBChainId,
  useJBChainId,
  useSuckers,
} from "juice-sdk-react";
import { JB_CHAINS } from "juice-sdk-core";
import { useWatchAsset } from "wagmi";

import { Address, formatUnits } from "viem";
import { Loader2 } from "lucide-react";

import TokenChart from "@/app/[...slug]/components/NetworkDashboard/sections/TokenAnalyticsSection/TokenChart";
import TokenStatsChart from "@/app/[...slug]/components/NetworkDashboard/sections/TokenAnalyticsSection/TokenStatsChart";
import { useData } from "../../../DataProvider";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { useAccount } from "wagmi";
import { getBalance } from '@wagmi/core'
import { wagmiConfig } from "@/lib/wagmiConfig";


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
  const { analyticsData } = useData();
  const data = analyticsData?.tokenData;

  const suckersQuery = useSuckers();
  const suckers = suckersQuery.data;

  const { watchAsset, isSuccess, isPending } = useWatchAsset();
  
  const handleAddToken = () => {
    // Make sure token.data and necessary properties exist
    if (!data?.selectedToken.address || !data.selectedToken.name /*|| !data.selectedToken.decimals*/) {
      console.error("Token information is incomplete.");
      return;
    }
    
    watchAsset({
      type: 'ERC20',
      options: {
        address: data?.selectedToken.address as Address,
        symbol: data.selectedToken.name,
        decimals: 18,
        image: data.selectedToken.logoUrl || "", 
      },
    });
  };

  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<string>("");
  

  useEffect(() => {
    if (!address || !isConnected) {
      return;
    }

    const fetchBalance = async () => {
      try {
        const balanceResults = await getBalance(wagmiConfig, {
          address,
          token: data?.selectedToken.address as Address,
        });

        const raw = Number(formatUnits(balanceResults.value, balanceResults.decimals));
        let formatted: string;

        if (raw < 1000) {
          formatted = raw.toFixed(2);
        } else {
          formatted = formatNumber(raw, true);
        }
        

        setBalance(formatted);
      } catch (err) {
        console.error("Error fetching token balances:", err);
      }
    };

    fetchBalance();
  }, [address, isConnected]);

  return (
    <section>

      {data?.name && (
        <div className="bg-grey-450 rounded-2xl h-auto max-h-[550px] p-[12px]">
          <TokenChart organisation={data?.name}/>
        </div>
      )}

      <div className="bg-grey-450 p-[12px] my-4 rounded-2xl grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <div className="background-color p-[16px] rounded-xl">
          <div className="flex gap-2 items-end">
            {/* This h3 is already correctly handling a potential lack of token.data */}
            <h3 className="text-xl">
              {data?.selectedToken.name}
            </h3>
            {data?.selectedToken && (
              <p className="text-muted-foreground font-light text-sm">
                {/* Use the actual token address from your data */}
                {truncateAddress(data?.selectedToken.address as Address)}
              </p>
            )}
          </div>
          <p className="text-muted-foreground font-light uppercase">
            Project Token
          </p>
          {data?.selectedToken && (
            <Button
              variant="link"
              className="h-6 px-0 w-fit flex items-center gap-1.5 font-normal uppercase"
              onClick={handleAddToken}
              disabled={isPending} // Disable the button while processing
            >
              {isPending ? 'Adding...' : isSuccess ? 'Added!' : 'Add To Metamask'}
              <Image alt="Metamask Logo" src="/assets/img/logo/metamask.svg" height={16} width={16} />
            </Button>
          )}
        </div>
          <div className="background-color p-[16px] rounded-xl">
            <h3 className="text-xl">
              {balance}
            </h3>
            <p className="text-muted-foreground font-light uppercase">
              Your Balance
            </p>
          </div>
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
              <div className="background-color p-[16px_16px_10px_16px] rounded-2xl">
                <div className="flex h-[28px] [&>*:not(:first-child)]:relative [&>*:not(:first-child)]:right-2">
                  {data?.selectedToken?.networks?.map((network, index) => (
                    <span key={index}>
                      {network === "eth" && (
                        <Image alt="Token Logo" width={28} height={28} src="/assets/img/logo/mainnet.svg" />
                      )}
                      {network === "base" && (
                        <Image alt="Token Logo" width={28} height={28} src="/assets/img/logo/base.svg" />
                      )}
                      {network === "opt" && (
                        <Image alt="Token Logo" width={28} height={28} src="/assets/img/logo/optimism.svg" />
                      )}
                      {network === "arb" && (
                        <Image alt="Token Logo" width={25} height={25} src="/assets/img/logo/arbitrum.svg" />
                      )}
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground font-light uppercase mt-[8px]">Networks</p>
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

          {data.selectedToken.ticker && data.selectedToken.name && (
            <div className="bg-grey-450 rounded-2xl h-auto max-h-[550px] p-[12px] mb-4">
              <TokenStatsChart organisation={data.selectedToken.ticker} tokenName={data.selectedToken.name} />
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex justify-center my-[15vh]">
          <Loader2 className="animate-spin" size={32} />
        </div>
      )}
    </section>
  )
}