"use client";

import { useState, useEffect } from "react";
import { formatNumber, truncateAddress } from "@/lib/utils";
import { TokenResponse } from "@/lib/types/AnalyticTypes";
import { useChainId, useSwitchChain, useWatchAsset } from "wagmi";

import { Address, formatUnits } from "viem";
import { Loader2 } from "lucide-react";

import { TokenChart } from "@/components/analytics/TokenChart";
import { TokenStatsChart } from "@/components/analytics/TokenStatsChart";
import { useData } from "../../../DataProvider";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { useAccount } from "wagmi";
import { getBalance } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { useSwitchToCorrectChain } from "../../../useEnsureCorrectChain";

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

export function TokenSection() {
  const { analyticsData } = useData();
  const data = analyticsData?.tokenData;
  const nativeTokenChainId = analyticsData?.tokenData?.selectedToken.chain_id;

  const { address, isConnected } = useAccount();
  const { watchAsset, isSuccess, isPending } = useWatchAsset();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const chainId = useChainId();
  const [balance, setBalance] = useState<string>("");

  const handleSwitchChain = () => {
    if (
      !nativeTokenChainId ||
      !isConnected ||
      !chainId ||
      chainId === nativeTokenChainId
    )
      return;
    try {
      switchChain({ chainId: nativeTokenChainId });
    } catch (err) {
      console.error("Failed to switch chain", err);
    }
  };

  const handleAddToken = () => {
    // Make sure token.data and necessary properties exist
    if (
      !data?.selectedToken.address ||
      !data.selectedToken.name /*|| !data.selectedToken.decimals*/
    ) {
      console.error("Token information is incomplete.");
      return;
    }

    watchAsset({
      type: "ERC20",
      options: {
        address: data?.selectedToken.address as Address,
        symbol: data.selectedToken.name,
        decimals: 18,
        image: data.selectedToken.logoUrl || "",
      },
    });
  };

  useEffect(() => {
    if (!address || !isConnected || chainId !== nativeTokenChainId) {
      return;
    }

    const fetchBalance = async () => {
      try {
        const balanceResults = await getBalance(wagmiConfig, {
          address,
          token: data?.selectedToken.address as Address,
        });

        const raw = Number(
          formatUnits(balanceResults.value, balanceResults.decimals)
        );
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
  }, [address, chainId, isConnected, data?.selectedToken.address]);

  return (
    <section>
      {data?.name && (
        <div className="h-auto max-h-[550px] rounded-2xl bg-grey-450 p-[12px]">
          <TokenChart organisation={data?.name} />
        </div>
      )}

      <div className="my-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 rounded-2xl bg-grey-450 p-[12px]">
        <div className="background-color rounded-xl p-[16px]">
          <div className="flex items-end gap-2">
            {/* This h3 is already correctly handling a potential lack of token.data */}
            <h3 className="text-xl">{data?.selectedToken.name}</h3>
            {data?.selectedToken && (
              <p className="text-sm font-light text-muted-foreground">
                {/* Use the actual token address from your data */}
                {truncateAddress(data?.selectedToken.address as Address)}
              </p>
            )}
          </div>
          <p className="font-light uppercase text-muted-foreground">
            Project Token
          </p>
          {data?.selectedToken && (
            <Button
              variant="link"
              className="flex h-6 w-fit items-center gap-1.5 px-0 font-normal uppercase"
              onClick={handleAddToken}
              disabled={isPending} // Disable the button while processing
            >
              {isPending
                ? "Adding..."
                : isSuccess
                  ? "Added!"
                  : "Add To Metamask"}
              <Image
                alt="Metamask Logo"
                src="/assets/img/logo/metamask.svg"
                height={16}
                width={16}
              />
            </Button>
          )}
        </div>
        <div className="background-color rounded-xl p-[16px]">
          <h3 className="text-xl">
            {isConnected ? (
              <>
                {chainId === nativeTokenChainId ? (
                  <>
                    {!balance ? (
                      <div className="activeSkeleton mb-2 h-8 w-24 rounded-lg" />
                    ) : (
                      balance
                    )}
                  </>
                ) : (
                  <Button
                    variant="link"
                    className="flex h-6 w-fit items-center gap-1.5 px-0 font-normal uppercase"
                    onClick={handleSwitchChain}
                    disabled={isSwitchingChain}
                  >
                    Switch Chain
                  </Button>
                )}
              </>
            ) : (
              "0.00"
            )}
          </h3>
          <p className="font-light uppercase text-muted-foreground">
            Your Balance
          </p>
        </div>
      </div>

      {data ? (
        <div className="flex w-full flex-col gap-4">
          <div className="rounded-2xl bg-grey-450 p-[12px]">
            <h3 className="pb-3 pt-1 text-xl">AUM/MC Ratio</h3>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {calculateRatio(
                    data.assetsUnderManagement,
                    data.selectedToken.marketCap
                  )}
                </h3>
                <p className="font-light uppercase text-muted-foreground">
                  {getValuationLabel(
                    data.assetsUnderManagement,
                    data.selectedToken.marketCap
                  )}
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px_16px_10px_16px]">
                <div className="flex h-[28px] [&>*:not(:first-child)]:relative [&>*:not(:first-child)]:right-2">
                  {data?.selectedToken?.networks?.map((network, index) => (
                    <span key={index}>
                      {network === "eth" && (
                        <Image
                          alt="Token Logo"
                          width={28}
                          height={28}
                          src="/assets/img/logo/mainnet.svg"
                        />
                      )}
                      {network === "base" && (
                        <Image
                          alt="Token Logo"
                          width={28}
                          height={28}
                          src="/assets/img/logo/base.svg"
                        />
                      )}
                      {network === "opt" && (
                        <Image
                          alt="Token Logo"
                          width={28}
                          height={28}
                          src="/assets/img/logo/optimism.svg"
                        />
                      )}
                      {network === "arb" && (
                        <Image
                          alt="Token Logo"
                          width={25}
                          height={25}
                          src="/assets/img/logo/arbitrum.svg"
                        />
                      )}
                    </span>
                  ))}
                </div>
                <p className="mt-[8px] font-light uppercase text-muted-foreground">
                  Networks
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-grey-450 p-[12px] py-5">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {formatNumber(data.selectedToken.totalSupply)}
                </h3>
                <p className="font-light uppercase text-muted-foreground">
                  Total Supply
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="text-xl">
                  ${formatNumber(data.selectedToken.marketCap)}
                </div>
                <p className="font-light uppercase text-muted-foreground">
                  Market Cap
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
              <div className="background-color rounded-xl p-[16px]">
                <h3 className="text-xl">
                  {formatNumber(data.selectedToken.averageBal)}
                </h3>
                <p className="font-light uppercase text-muted-foreground">
                  Average Balance
                </p>
              </div>
              <div className="background-color rounded-2xl p-[16px]">
                <div className="text-xl">
                  {formatNumber(data.selectedToken.medianBal)}
                </div>
                <p className="font-light uppercase text-muted-foreground">
                  Median Balance
                </p>
              </div>
            </div>
          </div>

          {data.topHolders && (
            <div className="rounded-2xl bg-grey-450 p-[12px]">
              <div className="background-color mb-2 rounded-xl p-[16px]">
                <h3 className="text-xl">{data.selectedToken.totalHolders}</h3>
                <p className="font-light uppercase text-muted-foreground">
                  Total Holders
                </p>
              </div>

              <h3 className="py-1 text-sm uppercase text-grey-50">
                Top Holders
              </h3>
              <div>
                {data.topHolders.slice(0, 5).map((holder, idx) => {
                  const { address, token_amount } = holder;

                  return (
                    <div
                      key={`${address}-${idx}`}
                      className="flex items-center justify-between border-b border-[#282828] py-3 text-sm font-light text-grey-50"
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
            <div className="mb-4 h-auto max-h-[550px] rounded-2xl bg-grey-450 p-[12px]">
              <TokenStatsChart
                organisation={data.selectedToken.ticker}
                tokenName={data.selectedToken.name}
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
