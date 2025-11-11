"use client";

import { useState } from "react";
import { Address } from "viem";

import { LinkIcon } from "@heroicons/react/24/solid";
import { Loader2, RotateCw } from "lucide-react";

import { formatNumber, formatDate, truncateAddress } from "@/lib/utils";

import TreasuryPieChart from "@/app/[...slug]/components/tabs/TreasuryAnalytics/TreasuryPieChart";
import TreasuryChart from "@/app/[...slug]/components/tabs/TreasuryAnalytics/TreasuryChart";
import { useData } from "../../../DataProvider";

export function TreasurySection() {
  const { analyticsData } = useData();
  const data = analyticsData?.treasuryData;
  const [responseData, setResponseData] = useState("");

  const refreshData = async (): Promise<void> => {
    try {
      const response = await fetch(
        `https://inev.profiler.bio/treasury/refresh/${data?.name}`,
        {
          method: "POST",
        }
      );

      const responseJson = await response.json();

      if (!response.ok) {
        setResponseData(responseJson.error);
        return;
      }

      setResponseData(responseJson.message);
    } catch (error) {
      console.error("Request failed:", error);
      setResponseData("Failed to refresh");
    }
  };

  return (
    <section>
      {data ? (
        <div className="flex w-full flex-col gap-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl bg-grey-450 p-[12px]">
            <div className="background-color rounded-2xl p-[16px]">
              <h4 className="mb-0.5 text-xl tracking-wider">
                ${formatNumber(Number(data.assetsUnderManagement))}
              </h4>
              <p className="font-light uppercase text-muted-foreground">
                Assets Manged
              </p>
            </div>

            <div className="background-color rounded-2xl p-[16px]">
              <div className="flex items-center justify-between">
                <h4 className="mb-0.5 text-xl tracking-wider">
                  {data?.lastUpdated && formatDate(data.lastUpdated)}
                </h4>

                <RotateCw
                  onClick={refreshData}
                  className="cursor-pointer text-grey-100"
                />
              </div>
              <p className="font-light text-muted-foreground">
                {responseData ? responseData : "LAST UPDATED"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-grey-450 p-[12px]">
            <h3 className="mb-[8px] py-1 text-sm uppercase text-grey-50">
              Treasury Holdings
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-2xl p-[16px]">
                <a className="mb-0.5 text-xl tracking-wider underline">
                  {data.treasury.ens_name}
                </a>
                <p className="font-light uppercase text-muted-foreground">
                  Treasury Wallet
                </p>
              </div>

              <div className="background-color rounded-2xl p-[16px]">
                <h4 className="mb-0.5 text-xl tracking-wider">
                  ${formatNumber(Number(data.treasuryValue))}
                </h4>
                <p className="font-light uppercase text-muted-foreground">
                  Total Holdings
                </p>
              </div>
            </div>

            <div
              className="scrollbar-hide mt-2 max-h-[400px] overflow-y-auto pb-12"
              style={{
                maskImage:
                  "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
              }}
            >
              {data?.treasuryTokens
                ?.slice()
                .sort((a, b) => b.totalValue - a.totalValue)
                .map((token, index) => {
                  const percentage =
                    token.totalValue > 0
                      ? (
                          (token.totalValue / data?.treasuryValue) *
                          100
                        ).toFixed(2)
                      : "0.00";

                  return (
                    <div key={index} className="border-color border-b py-3">
                      <div className="flex items-center justify-between font-light text-grey-50">
                        <p>
                          {token.contractAddress
                            ? truncateAddress(token.contractAddress as Address)
                            : "Native Token"}
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

          <div className="flex h-[400px] items-center rounded-2xl bg-grey-450 p-[12px]">
            {data?.treasuryTokens && (
              <TreasuryPieChart filteredData={data.treasuryTokens} />
            )}
          </div>

          {data?.historicalReturns && (
            <div className="rounded-2xl bg-grey-450 p-[12px]">
              <h3 className="py-1 text-sm uppercase text-grey-50">
                Portfolio Peformance
              </h3>
              <div className="flex flex-col text-sm font-light">
                {Object.entries(data.historicalReturns || {}).map(
                  ([label, value]) => {
                    const isPositive = !value.percentReturn.startsWith("-");
                    const textColor = isPositive
                      ? "text-green-500"
                      : "text-red-500";

                    return (
                      <div
                        key={label}
                        className="flex items-center justify-between border-b border-[#282828] py-1 py-4"
                      >
                        <p className="w-8 text-grey-50">{label}</p>
                        <p className={`min-w-24 text-center ${textColor}`}>
                          {isPositive === true && "+"}
                          {value.dollarReturn}
                        </p>
                        <p className={`min-w-16 text-right ${textColor}`}>
                          {isPositive === true && "+"}
                          {value.percentReturn}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {data?.managed_accounts && (
            <div className="rounded-2xl bg-grey-450 p-[12px]">
              <h3 className="py-1 text-sm uppercase text-grey-50">
                Accounts Manged
              </h3>
              <div className="flex flex-col text-sm font-light">
                {Object.entries(data.managed_accounts).map(
                  ([address, data]) => (
                    <div
                      key={address}
                      className="flex items-center justify-between border-b border-[#282828] py-3 text-sm font-light text-grey-50"
                    >
                      <span>
                        {data.comment
                          ? data.comment
                          : truncateAddress(address as Address)}
                      </span>

                      <span>
                        {data.ens
                          ? data.ens
                          : truncateAddress(address as Address)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {data.signers && (
            <div className="rounded-2xl bg-grey-450 p-[12px] text-sm text-grey-50">
              <h3 className="py-1 uppercase">Account Info</h3>
              {/* Required/Total Signers */}
              <div className="flex items-center justify-between border-b border-[#282828] py-3 font-light">
                <span>Safe.Global Wallet</span>
                <span>
                  {data?.signers.required}/{data?.signers.total} Signs
                </span>
              </div>

              {/* Signer List */}
              {data.signers.signers.map((address, idx) => {
                return (
                  <div
                    key={`${address}-${idx}`}
                    className="flex items-center justify-between border-b border-[#282828] py-3 font-light"
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

          <div className="max-w-full rounded-2xl bg-grey-450 p-[12px]">
            <h3 className="pb-3 pt-1 text-xl">Historical Asset Value</h3>

            <TreasuryChart organisation={data.name} />

            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-grey-50">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#2978A0]"></div>
                <p>All Assets/Accounts</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#FBE8BD]"></div>
                <p>Treasury Wallet</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full bg-[#BB4430]"></div>
                <p>Assets Under Management</p>
              </div>
            </div>
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
