"use client";
import { formatNumber } from "@/lib/utils";
import { useReadContracts, useWatchAsset } from "wagmi";

import { Address, erc20Abi, formatUnits } from "viem";
import { Loader2 } from "lucide-react";

import { TokenChart } from "@/components/analytics/TokenChart";
import { TokenStatsChart } from "@/components/analytics/TokenStatsChart";
import { useLegacyProjectStore } from "@/store/LegacyProjectContext";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { useAccount } from "wagmi";
import EtherscanLink from "@/components/EtherscanLink";
import { JB_CHAINS, JBChainId } from "juice-sdk-core";
import { ChainLogo } from "@/components/ChainLogo";
import { EthereumAddress } from "@/components/EthereumAddress";

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

export function TokenAnalyticsSection() {
  const tokenAnalytics = useLegacyProjectStore((state) => state.tokenAnalytics);

  const { address, isConnected, connector } = useAccount();
  const { watchAsset, isSuccess, isPending } = useWatchAsset();
  const nativeTokenChainId = (tokenAnalytics?.token.chainId ??
    1) as JBChainId;
  const tokenAddress = tokenAnalytics?.token.address as Address;

  const { data: tokenDataResult, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address!],
        chainId: nativeTokenChainId,
      },
      {
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
        chainId: nativeTokenChainId,
      },
    ] as const,
    query: {
      enabled: isConnected && !!address && !!tokenAddress,
    },
  });

  const handleAddToken = () => {
    // Make sure token.data and necessary properties exist
    if (
      !tokenAnalytics?.token.address ||
      !tokenAnalytics.token.name /*|| !data.token.decimals*/
    ) {
      console.error("Token information is incomplete.");
      return;
    }

    watchAsset({
      type: "ERC20",
      options: {
        address: tokenAnalytics?.token.address as Address,
        symbol: tokenAnalytics.token.name,
        decimals: 18,
        image: tokenAnalytics.token.logoUrl || "",
      },
    });
  };

  const balance = tokenDataResult?.[0];
  const decimals = tokenDataResult?.[1];

  let safeFormattedBalance = "0.00";

  if (
    isConnected &&
    !isLoading &&
    balance !== undefined &&
    decimals !== undefined
  ) {
    safeFormattedBalance = formatNumber(formatUnits(balance, decimals));
  }

  return (
    <section>
      {tokenAnalytics?.token.ticker && (
        <div className="bg-grey-450 h-auto max-h-[550px] rounded-2xl p-[12px]">
          <TokenChart tokenTicker={tokenAnalytics.token.ticker} />
        </div>
      )}

      <div className="bg-grey-450 my-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl p-[12px]">
        <div className="background-color rounded-xl p-[16px]">
          <div className="flex items-end gap-2">
            <h3 className="text-xl leading-[24px]">
              {tokenAnalytics?.token.name}
            </h3>
            {tokenAddress && nativeTokenChainId && (
              <EtherscanLink
                value={tokenAddress}
                className="text-muted-foreground text-sm"
                type={"token"}
                truncateTo={4}
                chain={JB_CHAINS[nativeTokenChainId].chain}
              />
            )}
          </div>
          <p className="text-muted-foreground font-light uppercase">
            Project Token
          </p>
          {tokenAnalytics?.token && connector?.name === "MetaMask" && (
            <Button
              variant="link"
              className="flex h-6 w-fit items-center gap-1.5 px-0 text-sm font-normal uppercase"
              onClick={handleAddToken}
              disabled={isPending}
            >
              {isPending
                ? "Adding..."
                : isSuccess
                  ? "Added!"
                  : "Add To Metamask"}
              <Image
                alt="Metamask Logo"
                src="https://cdn.inevitable.science/static/img/logo/metamask.svg"
                height={16}
                width={16}
              />
            </Button>
          )}
        </div>
        <div className="background-color rounded-xl p-[16px]">
          <h3 className="text-xl">
            {isConnected ? (
              isLoading ? (
                <div className="activeSkeleton mb-2 h-8 w-24 rounded-lg" />
              ) : (
                <>{safeFormattedBalance}</>
              )
            ) : (
              "0.00"
            )}
          </h3>
          <p className="text-muted-foreground font-light uppercase">
            Your Balance
          </p>
        </div>
      </div>

      {tokenAnalytics ? (
        <div className="flex w-full flex-col gap-4">
          <div className="bg-grey-450 rounded-2xl p-[12px]">
            <h3 className="pt-1 pb-3 text-xl">AUM/MC Ratio</h3>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {calculateRatio(
                    tokenAnalytics.assetsUnderManagement,
                    tokenAnalytics.token.marketCap
                  )}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  {getValuationLabel(
                    tokenAnalytics.assetsUnderManagement,
                    tokenAnalytics.token.marketCap
                  )}
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px_16px_10px_16px]">
                <div className="flex h-[24px]">
                  {tokenAnalytics?.token?.networks?.map((network) => (
                    <div className="w-[18px]" key={network}>
                      <ChainLogo
                        key={network}
                        chainId={network as JBChainId}
                        width={24}
                        height={24}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground mt-[8px] font-light uppercase">
                  Networks
                </p>
              </div>
            </div>
          </div>

          <div className="bg-grey-450 flex flex-col gap-3 rounded-2xl p-[12px] py-5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {formatNumber(tokenAnalytics.token.totalSupply)}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  Total Supply
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="text-xl">
                  ${formatNumber(tokenAnalytics.token.marketCap)}
                </div>
                <p className="text-muted-foreground font-light uppercase">
                  Market Cap
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {formatNumber(tokenAnalytics.token.averageBal)}
                </h3>
                <p className="text-muted-foreground font-light uppercase">
                  Average Balance
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="text-xl">
                  {formatNumber(tokenAnalytics.token.medianBal)}
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
                  {tokenAnalytics.token.totalHolders}
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
                  const { address, tokenAmount } = holder;

                  return (
                    <div
                      key={`${address}-${idx}`}
                      className="text-grey-50 flex items-center justify-between border-b border-[#282828] py-3 text-sm font-light"
                    >
                      <EthereumAddress
                        address={address as Address}
                        chain={
                          JB_CHAINS[
                            tokenAnalytics.token.chainId as JBChainId
                          ].chain
                        }
                        withEnsName
                        short
                      />
                      {formatNumber(tokenAmount, true)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tokenAnalytics.token.ticker && (
            <div className="bg-grey-450 mb-4 h-auto max-h-[550px] rounded-2xl p-[12px]">
              <TokenStatsChart
                tokenTicker={tokenAnalytics.token.ticker}
              />
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
