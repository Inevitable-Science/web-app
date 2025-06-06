"use client";

import { useEffect, useState } from "react";
import { formatNumber, formatDate, truncateAddress } from "@/lib/utils";
import { TreasuryResponse } from '@/lib/types/AnalyticTypes'
import { Address } from "viem";
import TreasuryPieChart from "./TreasuryPieChart";

interface DescriptionSectionProps {
  data: TreasuryResponse | null;
}

export function TreasurySection({ data }: DescriptionSectionProps) {

  return (
      <section className="flex flex-col gap-4">

        <div className="grid grid-cols-2 gap-3 bg-grey-450 p-[12px] rounded-2xl">
          <div className="background-color p-[16px] rounded-2xl">
            <h4 className="text-xl mb-0.5 tracking-wider">
              ${formatNumber(Number(data?.assetsUnderManagement))}
            </h4>
            <p className="text-muted-foreground font-light uppercase">Assets Manged</p>
          </div>

          <div className="background-color p-[16px] rounded-2xl">
            <h4 className="text-xl mb-0.5 tracking-wider">
              {data?.lastUpdated && (
                formatDate(data.lastUpdated)
              )}
            </h4>
            <p className="text-muted-foreground font-light uppercase">Last Updated</p>
          </div>
        </div>

        <div className="bg-grey-450 p-[12px] rounded-2xl">
          <h3 className="text-grey-50 uppercase text-sm mb-[8px]">Treasury Holdings</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="background-color p-[16px] rounded-2xl">
              <a className="text-xl mb-0.5 tracking-wider underline">
                {data?.treasury.ens_name}
              </a>
              <p className="text-muted-foreground font-light uppercase">Treasury Wallet</p>
            </div>

            <div className="background-color p-[16px] rounded-2xl">
              <h4 className="text-xl mb-0.5 tracking-wider">
                ${formatNumber(Number(data?.treasuryValue))}
              </h4>
              <p className="text-muted-foreground font-light uppercase">Total Holdings</p>
            </div>
          </div>

          <div 
            className="mt-2 max-h-[400px] overflow-y-auto scrollbar-hide pb-12"
            style={{
              maskImage: 'linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)', // For Safari
            }}
          >

            {data?.treasuryTokens
              ?.slice() 
              .sort((a, b) => b.totalValue - a.totalValue)
              .map((token, index) => {
                const percentage =
                  token.totalValue > 0
                    ? ((token.totalValue / data?.treasuryValue) * 100).toFixed(2)
                    : '0.00';

                return (
                  <div key={index} className="py-3 border-b border-color">
                    <div className="flex items-center justify-between text-grey-50 font-light">
                      <p>
                        {token.contractAddress
                          ? truncateAddress(token.contractAddress as Address)
                          : 'Native Token'}
                      </p>
                      <p>{percentage}%</p>
                    </div>

                    <div className="flex items-center justify-between font-light">
                      <p>{token.metadata.symbol}</p>
                      <p>${token.totalValue.toLocaleString()}</p>
                    </div>
                  </div>
                );
            })}
          </div>
        </div>

        {data?.treasuryTokens && (
          <TreasuryPieChart filteredData={data?.treasuryTokens} />
        )}



        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </section>
  );
}