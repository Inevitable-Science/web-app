// src/components/WithdrawCard.tsx

import { useState } from "react";
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

export function WithdrawCard(
  { selectedSucker } : {selectedSucker?: SuckerPair | undefined;}
) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const chainId = useJBChainId();
  
  const tokenA = useTokenA();
  const { token: tokenB } = useJBTokenContext();
  
  const withdrawAmountBN = parseUnits(withdrawAmount || "0", tokenB.data?.decimals ?? 18);
  
  // Hooks for fetching data
  const { data: userTokenBalance } = useSuckersUserTokenBalance();
  const { data: ethQuote } = useTokenCashOutQuoteEth(withdrawAmountBN, { chainId });

  const formattedEthQuote = ethQuote ? formatUnits(ethQuote, tokenA.decimals) : "";

  // Find the user's balance on the current chain to display
  const balanceOnCurrentChain = userTokenBalance?.find(b => b.chainId === chainId)?.balance;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {/* WITHDRAW INPUT */}
        <div className="background-color flex items-center justify-between p-[16px] rounded-xl">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm text-muted-foreground font-light">YOU WITHDRAW</p>
            <input
              type="number"
              className="bg-transparent max-w-[130px] shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex w-fit bg-grey-450 rounded-full py-1 px-3 gap-2 items-center">
              <p className="text-lg font-light">{formatTokenSymbol(tokenB.data?.symbol)}</p>
            </div>
            <p className="text-sm text-muted-foreground font-light">
              Balance: {balanceOnCurrentChain?.format(4) ?? "0.00"}
            </p>
          </div>
        </div>

        {/* RECEIVE INPUT */}
        <div className="background-color flex items-center justify-between p-[16px] rounded-xl">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm text-muted-foreground font-light">YOU RECEIVE</p>
            <input
              type="number"
              className="bg-transparent max-w-[130px] shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
              placeholder="0.00"
              value={formattedEthQuote}
              readOnly // This field is derived from the above input
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex w-fit bg-grey-450 rounded-full py-1 px-3 gap-2 items-center justify-end">
              <p className="text-lg font-light">{tokenA.symbol}</p>
            </div>
          </div>
        </div>
      </div>
      
      <WithdrawActionButton
        amountToWithdraw={withdrawAmountBN}
        disabled={!withdrawAmount || withdrawAmountBN === 0n || withdrawAmountBN > (balanceOnCurrentChain?.value ?? 0n)}
        selectedSucker={selectedSucker}
      />
    </div>
  );
}