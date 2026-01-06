"use client";
import { useState } from "react";
import { formatNumber, formatDate, truncateAddress } from "@/lib/utils";
import { Address } from "viem";
import { Link, Loader2, RotateCw } from "lucide-react";

import { TreasuryPieChart } from "@/components/analytics/TreasuryPieChart";
import { TreasuryChart } from "@/components/analytics/TreasuryChart";
import { useProjectDataStore } from "../../../../../../store/RevnetDataContext";

export function TreasurySection() {
  const treasuryAnalytics = useProjectDataStore(
    (state) => state.treasuryAnalytics
  );
  const [responseData, setResponseData] = useState("");

  const refreshData = async (): Promise<void> => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/treasury/refresh/${treasuryAnalytics?.name}`,
        {
          method: "POST",
        }
      );

      const responseJson = await response.json();

      if (!response.ok) {
        setResponseData(responseJson.error);
        return;
        //throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setResponseData(responseJson.message);
    } catch (error) {
      console.error("Request failed:", error);
      setResponseData("Failed to refresh");
    }
  };

  return (
    <section>
      {treasuryAnalytics ? (
        <div className="flex w-full flex-col gap-4">
          <div className="bg-grey-450 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl p-[12px]">
            <div className="background-color rounded-2xl p-[16px]">
              <h4 className="mb-0.5 text-xl tracking-wider">
                ${formatNumber(Number(treasuryAnalytics.assetsUnderManagement))}
              </h4>
              <p className="text-muted-foreground font-light uppercase">
                Assets Manged
              </p>
            </div>

            <div className="background-color rounded-2xl p-[16px]">
              <div className="flex items-center justify-between">
                <h4 className="mb-0.5 text-xl tracking-wider">
                  {treasuryAnalytics?.lastUpdated &&
                    formatDate(treasuryAnalytics.lastUpdated)}
                </h4>

                <RotateCw
                  onClick={refreshData}
                  className="text-grey-100 cursor-pointer"
                />
              </div>
              <p className="text-muted-foreground font-light">
                {responseData ? responseData : "LAST UPDATED"}
              </p>
            </div>
          </div>

          <div className="bg-grey-450 rounded-2xl p-[12px]">
            <h3 className="text-grey-50 mb-[8px] py-1 text-sm uppercase">
              Treasury Holdings
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-2xl p-[16px]">
                <a className="mb-0.5 text-xl tracking-wider underline">
                  {treasuryAnalytics.treasury.ens_name}
                </a>
                <p className="text-muted-foreground font-light uppercase">
                  Treasury Wallet
                </p>
              </div>

              <div className="background-color rounded-2xl p-[16px]">
                <h4 className="mb-0.5 text-xl tracking-wider">
                  ${formatNumber(Number(treasuryAnalytics.treasuryValue))}
                </h4>
                <p className="text-muted-foreground font-light uppercase">
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
              {treasuryAnalytics?.treasuryTokens
                ?.slice()
                .sort((a, b) => b.totalValue - a.totalValue)
                .map((token, index) => {
                  const percentage =
                    token.totalValue > 0
                      ? (
                          (token.totalValue /
                            treasuryAnalytics?.treasuryValue) *
                          100
                        ).toFixed(2)
                      : "0.00";

                  return (
                    <div key={index} className="border-color border-b py-3">
                      <div className="text-grey-50 flex items-center justify-between font-light">
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

          <div className="bg-grey-450 flex h-[400px] items-center rounded-2xl p-[12px]">
            {treasuryAnalytics?.treasuryTokens && (
              <TreasuryPieChart
                filteredData={treasuryAnalytics.treasuryTokens}
              />
            )}
          </div>

          {treasuryAnalytics?.historicalReturns && (
            <div className="bg-grey-450 rounded-2xl p-[12px]">
              <h3 className="text-grey-50 py-1 text-sm uppercase">
                Portfolio Peformance
              </h3>
              <div className="flex flex-col text-sm font-light">
                {Object.entries(treasuryAnalytics.historicalReturns || {}).map(
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
                        <p className="text-grey-50 w-8">{label}</p>
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

          {treasuryAnalytics?.managed_accounts && (
            <div className="bg-grey-450 rounded-2xl p-[12px]">
              <h3 className="text-grey-50 py-1 text-sm uppercase">
                Accounts Manged
              </h3>
              <div className="flex flex-col text-sm font-light">
                {Object.entries(treasuryAnalytics.managed_accounts).map(
                  ([address, data]) => (
                    <div
                      key={address}
                      className="text-grey-50 flex items-center justify-between border-b border-[#282828] py-3 text-sm font-light"
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

          {treasuryAnalytics.signers && (
            <div className="bg-grey-450 text-grey-50 rounded-2xl p-[12px] text-sm">
              <h3 className="py-1 uppercase">Account Info</h3>
              {/* Required/Total Signers */}
              <div className="flex items-center justify-between border-b border-[#282828] py-3 font-light">
                <span>Safe.Global Wallet</span>
                <span>
                  {treasuryAnalytics?.signers.required}/
                  {treasuryAnalytics?.signers.total} Signs
                </span>
              </div>

              {/* Signer List */}
              {treasuryAnalytics.signers.signers.map((address, idx) => {
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
                      className="hover:border-grey-50 border-b border-transparent"
                    >
                      <Link height={18} width={18} />
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-grey-450 max-w-full rounded-2xl p-[12px]">
            <h3 className="pt-1 pb-3 text-xl">Historical Asset Value</h3>

            <TreasuryChart daoName={treasuryAnalytics.name} />

            <div className="text-grey-50 mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
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
