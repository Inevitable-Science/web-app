'use client';

import { FC, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { formatNumber } from '@/lib/utils';

interface DaoData {
  treasuryHoldings: string;
  assetsUnderManagement: string | number;
  totalHolders: string;
  totalSupply: string | number;
  latestPrice: number;
  latestMarketCap: number;
  tokenName: string;
}

interface TreasuryPreview {
  data: DaoData | null;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}


export const DaoData: FC<TreasuryPreview> = ({ data, setSelectedTab }) => {

  //if (isLoading) return <div>Loading...</div>;
  //if (error) return <div>Error: {error}</div>;
  //if (!data) return <div>No data available</div>;

  return (
    <section className="flex flex-col gap-6 mt-6">
      <div className="bg-grey-450 p-[12px] rounded-2xl">
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] mb-2">
          <div className="background-color p-[16px] rounded-2xl">
            {data ? (
            <h4 className="text-xl mb-0.5 tracking-wider">
              ${formatNumber(Number(data.treasuryHoldings))}
            </h4>
            ) : (
              <div className="activeSkeleton h-[28px] w-[142px] mb-1 rounded"></div>
            )}
            <p className="text-muted-foreground font-light uppercase">Treasury Holdings</p>
          </div>
          <div className="background-color p-[16px] rounded-2xl">
            {data ? (
            <h4 className="text-xl mb-0.5 tracking-wider">
              ${formatNumber(Number(data.assetsUnderManagement))}
            </h4>
            ) : (
              <div className="activeSkeleton h-[28px] w-[142px] mb-1 rounded"></div>
            )}
            <p className="text-muted-foreground font-light uppercase">Assets Under Management</p>
          </div>
        </div>

        <Button 
          onClick={() => setSelectedTab("activity")}
          variant="link" 
          className="h-6 pl-2 flex items-center gap-1.5 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
        >
          Treasury Stats
          <ArrowRightIcon height="20" width="20" />
        </Button>
      </div>


      <div className="bg-grey-450 p-[12px] rounded-2xl">
        <div className="flex flex-col gap-2 mb-2">
          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <div className="background-color p-[16px] rounded-2xl">
              {data ? (
              <h4 className="text-xl mb-0.5 tracking-wider">
                ${formatNumber(Number(data.latestPrice))}
              </h4>
              ) : (
                <div className="activeSkeleton h-[28px] w-[142px] mb-1 rounded"></div>
              )}
              <p className="text-muted-foreground font-light uppercase">{data ? data.tokenName : ""} Price</p>
            </div>
            <div className="background-color p-[16px] rounded-2xl">
              {data ? (
              <h4 className="text-xl mb-0.5 tracking-wider">
                {formatNumber(Number(data.totalSupply))}
              </h4>
              ) : (
                <div className="activeSkeleton h-[28px] w-[142px] mb-1 rounded"></div>
              )}
              <p className="text-muted-foreground font-light uppercase">Total Supply</p>
            </div>
          </div>

          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            <div className="background-color p-[16px] rounded-2xl">
              {data ? (
              <h4 className="text-xl mb-0.5 tracking-wider">
                ${formatNumber(Number(data.latestMarketCap))}
              </h4>
              ) : (
                <div className="activeSkeleton h-[28px] w-[142px] mb-1 rounded"></div>
              )}
              <p className="text-muted-foreground font-light uppercase">Market Cap</p>
            </div>
            <div className="background-color p-[16px] rounded-2xl">
              {data ? (
              <h4 className="text-xl mb-0.5 tracking-wider">
                {formatNumber(Number(data.totalHolders))}
              </h4>
              ) : (
                <div className="activeSkeleton h-[28px] w-[142px] mb-1 rounded"></div>
              )}
              <p className="text-muted-foreground font-light uppercase">Total Holders</p>
            </div>
          </div>
        </div>

        <Button 
          onClick={() => setSelectedTab("analytics")}
          variant="link" 
          className="h-6 pl-2 flex items-center gap-1.5 font-normal uppercase transition-[gap] duration-150 hover:gap-3"
        >
          Analytics
          <ArrowRightIcon height="20" width="20" />
        </Button>
      </div>
    </section>
  );
};