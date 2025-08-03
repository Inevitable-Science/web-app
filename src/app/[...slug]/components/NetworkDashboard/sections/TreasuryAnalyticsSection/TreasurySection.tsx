"use client";

import { formatNumber, formatDate, truncateAddress } from "@/lib/utils";
import { Address } from "viem";
import { LinkIcon } from "@heroicons/react/24/solid";
import { Loader2, RotateCw } from "lucide-react";

import TreasuryPieChart from "./TreasuryPieChart";
import TreasuryChart from "./TreasuryChart";
import { useState } from "react";
import { useNetworkData } from "../../NetworkDataContext";

export function TreasurySection() {
  const { analyticsData } = useNetworkData();
  const data = analyticsData?.treasuryData;

  const [responseData, setResponseData] = useState("");

  const refreshData = async (): Promise<void> => {
    try {
      const response = await fetch(`https://inev.profiler.bio/treasury/refresh/${data?.name}`, {
        method: 'POST',
      });

      const responseJson = await response.json();

      if (!response.ok) {
        setResponseData(responseJson.error);
        return;
        //throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setResponseData(responseJson.message);
    } catch (error) {
      console.error('Request failed:', error);
      setResponseData("Failed to refresh");
    }
  };


  return (
      <section>
        {data ? (
          <div className="flex flex-col gap-4 w-full">
            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] bg-grey-450 p-[12px] rounded-2xl">
              <div className="background-color p-[16px] rounded-2xl">
                <h4 className="text-xl mb-0.5 tracking-wider">
                  ${formatNumber(Number(data.assetsUnderManagement))}
                </h4>
                <p className="text-muted-foreground font-light uppercase">Assets Manged</p>
              </div>

              <div className="background-color p-[16px] rounded-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl mb-0.5 tracking-wider">
                    {data?.lastUpdated && (
                      formatDate(data.lastUpdated)
                    )}
                  </h4>

                  <RotateCw onClick={refreshData} className="text-grey-100 cursor-pointer" />
                </div>
                <p className="text-muted-foreground font-light">
                  {responseData ? (responseData) : ("LAST UPDATED")}
                </p>
              </div>
            </div>

            <div className="bg-grey-450 p-[12px] rounded-2xl">
              <h3 className="text-grey-50 uppercase text-sm mb-[8px] py-1">Treasury Holdings</h3>
              <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
                <div className="background-color p-[16px] rounded-2xl">
                  <a className="text-xl mb-0.5 tracking-wider underline">
                    {data.treasury.ens_name}
                  </a>
                  <p className="text-muted-foreground font-light uppercase">Treasury Wallet</p>
                </div>

                <div className="background-color p-[16px] rounded-2xl">
                  <h4 className="text-xl mb-0.5 tracking-wider">
                    ${formatNumber(Number(data.treasuryValue))}
                  </h4>
                  <p className="text-muted-foreground font-light uppercase">Total Holdings</p>
                </div>
              </div>

              <div 
                className="mt-2 max-h-[400px] overflow-y-auto scrollbar-hide pb-12"
                style={{
                  maskImage: 'linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)',
                  WebkitMaskImage: 'linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)',
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

            <div className="bg-grey-450 h-[400px] flex items-center p-[12px] rounded-2xl">
              {data?.treasuryTokens && (
                <TreasuryPieChart filteredData={data.treasuryTokens} />
              )}
            </div>


            {data?.historicalReturns && (
              <div className="bg-grey-450 p-[12px] rounded-2xl">
                <h3 className="text-grey-50 uppercase text-sm py-1">Portfolio Peformance</h3>
                <div className="flex flex-col text-sm font-light">
                  {Object.entries(data.historicalReturns || {}).map(([label, value]) => {
                    const isPositive = !value.percentReturn.startsWith('-');
                    const textColor = isPositive ? 'text-green-500' : 'text-red-500';

                    return (
                      <div key={label} className="flex items-center justify-between py-4 border-b border-[#282828] py-1">
                        <p className="w-8 text-grey-50">{label}</p>
                        <p className={`min-w-24 text-center ${textColor}`}>
                          {isPositive === true  && "+"}
                          {value.dollarReturn}
                        </p>
                        <p className={`min-w-16 text-right ${textColor}`}>
                          {isPositive === true  && "+"}
                          {value.percentReturn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {data?.managed_accounts && (
              <div className="bg-grey-450 p-[12px] rounded-2xl">
                <h3 className="text-grey-50 uppercase text-sm py-1">Accounts Manged</h3>
                <div className="flex flex-col text-sm font-light">
                  {Object.entries(data.managed_accounts).map(([address, data]) => (
                    <div
                      key={address}
                      className="flex justify-between items-center text-sm py-3 border-b border-[#282828] text-grey-50 font-light"
                    >
                      <span>
                        {data.comment ? data.comment : truncateAddress(address as Address)}
                      </span>
                      
                      <span>
                        {data.ens ? data.ens : truncateAddress(address as Address)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.signers && (
              <div className="bg-grey-450 p-[12px] rounded-2xl text-sm text-grey-50">
                <h3 className="uppercase py-1">Account Info</h3>
                {/* Required/Total Signers */}
                <div className="flex justify-between items-center py-3 border-b border-[#282828] font-light">
                  <span>Safe.Global Wallet</span>
                  <span>{data?.signers.required}/{data?.signers.total} Signs</span>
                </div>

                {/* Signer List */}
                {data.signers.signers.map((address, idx) => {
                  return (
                    <div
                      key={`${address}-${idx}`}
                      className="flex justify-between items-center py-3 border-b border-[#282828] font-light"
                    >
                      <span>{truncateAddress(address as Address)}</span>
                      <a
                        href={`https://etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-b border-transparent hover:border-grey-50"
                      >
                        <LinkIcon height={18} width={18} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-grey-450 p-[12px] rounded-2xl max-w-full">
              <h3 className="text-xl pt-1 pb-3">Historical Asset Value</h3>

              <TreasuryChart organisation={data.name} />

              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-grey-50 text-sm">
                <div className="flex gap-2 items-center">
                  <div className="w-4 h-4 bg-[#2978A0] rounded-full"></div>
                  <p>All Assets/Accounts</p>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="w-4 h-4 bg-[#FBE8BD] rounded-full"></div>
                  <p>Treasury Wallet</p>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="w-4 h-4 bg-[#BB4430] rounded-full"></div>
                  <p>Assets Under Management</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center my-[15vh]">
            <Loader2 className="animate-spin" size={32} />
          </div>
        )}
      </section>
  );
}