"use client";
import { Address, zeroAddress } from "viem";
import { Link, Loader2 } from "lucide-react";
import { formatNumber, formatDate, truncateAddress } from "@/lib/utils";

import { TreasuryPieChart } from "@/components/analytics/TreasuryPieChart";
import { TreasuryChart } from "@/components/analytics/TreasuryChart";
import { useLegacyProjectStore } from "@/store/LegacyProjectContext";
import EtherscanLink from "@/components/EtherscanLink";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { EthereumAddress } from "@/components/EthereumAddress";

export function TreasurySection() {
  const treasuryAnalytics = useLegacyProjectStore(
    (state) => state.treasuryAnalytics
  );

  return (
    <section>
      {treasuryAnalytics ? (
        <div className="flex w-full flex-col gap-4">
          <div className="bg-grey-450 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl p-[12px]">
            <div className="background-color rounded-2xl p-[16px]">
              <h4 className="mb-0.5 text-xl tracking-wider">
                ${formatNumber(treasuryAnalytics.assetsUnderManagement)}
              </h4>
              <p className="text-muted-foreground font-light uppercase">
                Assets Manged
              </p>
            </div>

            <div className="background-color rounded-2xl p-[16px]">
              <h4 className="mb-0.5 text-xl tracking-wider">
                {treasuryAnalytics?.lastUpdated &&
                  formatDate(treasuryAnalytics.lastUpdated)}
              </h4>
              <p className="text-muted-foreground font-light">LAST UPDATED</p>
            </div>
          </div>

          <div className="bg-grey-450 rounded-2xl p-[12px]">
            <h3 className="text-grey-50 mb-[8px] py-1 text-sm uppercase">
              Treasury Holdings
            </h3>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-2xl p-[16px]">
                <a className="mb-0.5 text-xl tracking-wider underline">
                  {treasuryAnalytics.treasury.ensName}
                </a>
                <p className="text-muted-foreground font-light uppercase">
                  Treasury Wallet
                </p>
              </div>

              <div className="background-color rounded-2xl p-[16px]">
                <h4 className="mb-0.5 text-xl tracking-wider">
                  ${formatNumber(treasuryAnalytics.treasuryValue)}
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
                        {token.contractAddress ? (
                          token.contractAddress === zeroAddress ? (
                            truncateAddress(token.contractAddress as Address)
                          ) : (
                            <EtherscanLink
                              value={token.contractAddress}
                              type={"token"}
                              chain={
                                JB_CHAINS[
                                  treasuryAnalytics.treasury
                                    .chainId as JBChainId
                                ].chain
                              }
                              truncateTo={4}
                            />
                          )
                        ) : (
                          truncateAddress(token.contractAddress as Address)
                        )}
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
                chainId={treasuryAnalytics.treasury.chainId as JBChainId}
              />
            )}
          </div>

          {treasuryAnalytics?.historicalReturns && (
            <div className="bg-grey-450 rounded-2xl p-[12px]">
              <h3 className="text-grey-50 py-1 text-sm uppercase">
                Portfolio Peformance
              </h3>
              <div className="flex flex-col text-sm font-light">
                {treasuryAnalytics.historicalReturns.map((value) => {
                  const isPositive = !value.percentReturn.startsWith("-");
                  const textColor = isPositive
                    ? "text-green-500"
                    : "text-red-500";

                  return (
                    <div
                      key={value.dateRange}
                      className="flex items-center justify-between border-b border-[#282828] py-1 py-4"
                    >
                      <p className="text-grey-50 w-8">{value.dateRange}</p>
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
                })}
              </div>
            </div>
          )}

          {treasuryAnalytics?.managedAccounts && (
            <div className="bg-grey-450 rounded-2xl p-[12px]">
              <h3 className="text-grey-50 py-1 text-sm uppercase">
                Accounts Manged
              </h3>
              <div className="flex flex-col text-sm font-light">
                {treasuryAnalytics.managedAccounts.map((account) => (
                  <div
                    key={account.address}
                    className="text-grey-50 flex items-center justify-between border-b border-[#282828] py-3 text-sm font-light"
                  >
                    <span>
                      {account.comment
                        ? account.comment
                        : truncateAddress(account.address as Address)}
                    </span>

                    <EthereumAddress
                      address={account.address as Address}
                      chain={JB_CHAINS[account.chainId as JBChainId].chain}
                      withEnsName
                      short
                    />
                  </div>
                ))}
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
                    <EtherscanLink
                      type="address"
                      value={address as Address}
                      chain={
                        JB_CHAINS[
                          treasuryAnalytics.treasury.chainId as JBChainId
                        ].chain
                      }
                    >
                      <Link height={18} width={18} />
                    </EtherscanLink>
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
