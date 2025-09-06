// src/components/WithdrawCard.tsx

import { useState } from "react";
import Image from "next/image";
import { formatTokenSymbol } from "@/lib/utils";
import { useTokenA } from "@/hooks/useTokenA";
import {
  JBChainId,
  useJBChainId,
  useJBTokenContext,
  useSuckersUserTokenBalance,
  useTokenCashOutQuoteEth,
} from "juice-sdk-react";
import { formatUnits, parseUnits } from "viem";
import { WithdrawActionButton } from "@/components/WithdrawActionButton";
import { SuckerPair } from "juice-sdk-core";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { useNetworkData } from "../NetworkDashboard/NetworkDataContext";

export function WithdrawCard({
  selectedSucker,
}: {
  selectedSucker?: SuckerPair | undefined;
}) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const chainId = useJBChainId();

  const { metadata } = useNetworkData();

  const tokenA = useTokenA();
  const { token: tokenB } = useJBTokenContext();

  const withdrawAmountBN = parseUnits(
    withdrawAmount || "0",
    tokenB.data?.decimals ?? 18
  );

  // Hooks for fetching data
  const { data: userTokenBalance } = useSuckersUserTokenBalance();
  const { data: ethQuote } = useTokenCashOutQuoteEth(withdrawAmountBN, {
    chainId,
  });

  const formattedEthQuote = ethQuote
    ? formatUnits(ethQuote, tokenA.decimals)
    : "";

  // Find the user's balance on the current chain to display
  const balanceOnCurrentChain = userTokenBalance?.find(
    (b) => b.chainId === chainId
  )?.balance;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {/* WITHDRAW INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm font-light text-muted-foreground">
              YOU WITHDRAW
            </p>
            <input
              type="number"
              className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-none ring-0 placeholder:text-white focus:outline-none focus:ring-0 focus:placeholder:text-muted-foreground"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-end gap-[2px]">
            <div className="flex w-fit min-w-fit items-center gap-2 rounded-full bg-grey-450 px-2 py-1">
              <Image
                src={
                  metadata.data?.logoUri
                    ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                    : "/assets/img/logo/mainnet.svg"
                }
                className="rounded-full"
                height={22}
                width={22}
                alt="Token Icon"
              />
              <p className="text-lg font-light">
                {formatTokenSymbol(tokenB?.data?.symbol)}
              </p>
            </div>
            <p className="w-[130px] text-nowrap text-right text-sm font-light text-muted-foreground">
              Balance: {balanceOnCurrentChain?.format(4) ?? "0.00"}
            </p>
          </div>
        </div>

        {/* RECEIVE INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm font-light text-muted-foreground">
              YOU RECEIVE
            </p>
            <input
              type="number"
              className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-none ring-0 placeholder:text-white focus:outline-none focus:ring-0 focus:placeholder:text-muted-foreground"
              placeholder="0.00"
              value={formattedEthQuote}
              readOnly // This field is derived from the above input
            />
          </div>
          <div className="flex w-fit min-w-fit items-center justify-end gap-2 rounded-full bg-grey-450 px-2 py-1">
            <Image
              src="/assets/img/logo/mainnet.svg"
              className="rounded-full"
              height={22}
              width={22}
              alt="ETH Icon"
            />
            <p className="text-lg font-light">{tokenA.symbol}</p>
          </div>
        </div>
      </div>

      <WithdrawActionButton
        amountToWithdraw={withdrawAmountBN}
        disabled={
          !withdrawAmount ||
          withdrawAmountBN === 0n ||
          withdrawAmountBN > (balanceOnCurrentChain?.value ?? 0n)
        }
        selectedSucker={selectedSucker}
      />
    </div>
  );
}
