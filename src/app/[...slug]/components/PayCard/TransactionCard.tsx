// src/components/PayCard/TransactionCard.tsx

import * as React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTokenA } from "@/hooks/useTokenA";
import {
  JBChainId,
  useJBChainId,
  useJBRulesetContext,
  useJBTokenContext,
  useSuckers
} from "juice-sdk-react";
import { FixedInt } from "fpnum";
import { formatUnits, parseEther, parseUnits } from "viem";
import { getTokenAToBQuote, getTokenBtoAQuote } from "juice-sdk-core";
import { formatTokenSymbol } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { PayActionButton } from "@/components/PayActionButton";
import { WithdrawCard } from "./WithdrawCard";
import { ChainSelector } from "@/components/ChainSelector";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { useNetworkData } from "../NetworkDashboard/NetworkDataContext";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";

export function TransactionCard() {
  const [activeTab, setActiveTab] = useState<'buy' | 'withdraw'>('buy');
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [memo, setMemo] = useState("");

  const tokenA = useTokenA();
  const { address } = useAccount(); // Get user's wallet and chain
  const activeChain = useJBChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({ address });

  const { token: tokenBContext} = useJBTokenContext();
  const { ruleset: rulesetContext, rulesetMetadata: rulesetMetadataContext } = useJBRulesetContext();
  
  const { data: suckers, isLoading: areSuckersLoading, isError: isSuckerError } = useSuckers();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const { metadata } = useNetworkData();

  // 6. Effect to initialize the context with a default chain
  useEffect(() => {
    // Only set default if context has no value and suckers have loaded
    if (!selectedSucker && suckers && suckers.length > 0) {
      const defaultSucker = activeChain 
        ? suckers.find(s => s.peerChainId === activeChain) 
        : undefined;
      setSelectedSucker(defaultSucker || suckers[0]);
    }
  }, [suckers, activeChain, selectedSucker, setSelectedSucker]);

  // Updated Load Guard
  if (
    isBalanceLoading ||
    areSuckersLoading ||
    rulesetContext.isLoading ||
    rulesetMetadataContext.isLoading ||
    !rulesetContext.data ||
    !rulesetMetadataContext.data
  ) {
    return (
      <div className="bg-grey-450 flex flex-col items-center justify-center p-[12px] rounded-xl h-[450px]">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const defaultToken = {
    symbol: 'TOKENS',
    decimals: 18,
  };

  const tokenB = tokenBContext.data || defaultToken;
  const ruleset = rulesetContext.data;
  const rulesetMetadata = rulesetMetadataContext.data;

  // --- CORE LOGIC (CALCULATION HANDLERS) ---
  const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountA(value);
    if (!value || value === ".") { setAmountB(""); return; }
    const quote = getTokenAToBQuote(new FixedInt(parseEther(value), tokenA.decimals), {
      weight: ruleset.weight,
      reservedPercent: rulesetMetadata.reservedPercent,
    });
    setAmountB(formatUnits(quote.payerTokens, tokenB.decimals));
  };

  const handleReceiveAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountB(value);
    if (!value || value === ".") { setAmountA(""); return; }
    const quote = getTokenBtoAQuote(new FixedInt(parseUnits(value, tokenB.decimals), tokenB.decimals), tokenA.decimals, {
      weight: ruleset.weight,
      reservedPercent: rulesetMetadata.reservedPercent,
    });
    setAmountA(quote.format()); // Use .format() for safety
  };

  // 7. Handler to update context and switch chain
  const handleChainChange = (newChainId: JBChainId) => {
    const newSelectedSucker = suckers?.find(s => s.peerChainId === newChainId);
    if (newSelectedSucker) {
      setSelectedSucker(newSelectedSucker);
    }
    if (activeChain !== newChainId && switchChain) {
      switchChain({ chainId: newChainId });
    }
  };

  const preparedAmountA = {
    amount: new FixedInt(parseEther(amountA || "0"), tokenA.decimals),
    symbol: tokenA.symbol,
  };
  const preparedAmountB = {
    amount: new FixedInt(parseUnits(amountB || "0", tokenB.decimals), tokenB.decimals),
    symbol: formatTokenSymbol(tokenB.symbol),
  };
  
  const isChainMismatched = activeChain !== selectedSucker?.peerChainId;

  return (
    <div className="bg-grey-450 flex flex-col p-[12px] rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveTab('buy')}
            className={`h-[35px] rounded-none font-light bg-transparent hover:bg-transparent border-b-[1.5px] ${
              activeTab === 'buy' ? 'border-cerulean text-white' : 'border-transparent text-muted-foreground'
            }`}
          >
            Buy
          </Button>
          {rulesetMetadata?.useTotalSurplusForCashOuts && (
            <Button
            onClick={() => setActiveTab('withdraw')}
            className={`h-[35px] rounded-none font-light bg-transparent hover:bg-transparent border-b-[1.5px] ${
              activeTab === 'withdraw' ? 'border-cerulean text-white' : 'border-transparent text-muted-foreground'
            }`}
          >
            Withdraw
          </Button>
          )}
        </div>
        
        {/* 8. Add the ChainSelector to the UI */}
        <ChainSelector
          disabled={!suckers || suckers.length <= 1}
          value={selectedSucker?.peerChainId as JBChainId}
          onChange={handleChainChange}
          options={suckers?.map(s => s.peerChainId) ?? []}
        />
      </div>

      <div className="my-4">
        {activeTab === 'buy' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="background-color flex items-center justify-between gap-2 p-[16px] rounded-xl">
                <div className="flex flex-col gap-[2px]">
                  <p className="text-sm text-muted-foreground font-light">YOU PAY</p>
                  <input
                    type="number"
                    className="bg-transparent w-full shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                    placeholder="0.00"
                    value={amountA}
                    onChange={handlePayAmountChange}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex w-fit bg-grey-450 rounded-full py-1 px-2 gap-2 items-center justify-end">
                    <img 
                      className="h-[22px] w-[22px]" 
                      src="/assets/img/logo/mainnet.svg"
                    />
                    <p className="text-lg font-light">{tokenA.symbol}</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-light text-nowrap">
                    Balance: {walletBalance ? parseFloat(formatUnits(walletBalance.value, tokenA.decimals)).toFixed(4) : "0.00"}
                  </p>
                </div>
              </div>
              <div className="background-color flex items-center justify-between gap-2 p-[16px] rounded-xl">
                <div className="flex flex-col gap-[2px]">
                  <p className="text-sm text-muted-foreground font-light">YOU RECEIVE</p>
                  <input
                    type="number"
                    className="bg-transparent w-full shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                    placeholder="0.00"
                    value={amountB}
                    onChange={handleReceiveAmountChange}
                  />
                </div>
                <div className="flex items-center w-fit min-w-fit gap-2 bg-grey-450 rounded-full py-1 px-2">
                  <img
                    className="h-[22px] w-[22px] rounded-full" 
                    src={metadata.data?.logoUri ? ipfsUriToGatewayUrl(metadata.data.logoUri) : "/assets/img/logo/mainnet.svg"}
                  />
                  <p className="text-lg font-light">{formatTokenSymbol(tokenB.symbol)}</p>
                </div>
              </div>
            </div>
            <input
              type="text"
              className="w-full background-color p-2 border-none rounded-lg text-sm font-light placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450 transition-shadow"
              onChange={(e) => setMemo(e.target.value)}
              value={memo}
              placeholder="Add a note... (optional)"
            />
            <PayActionButton
              amountA={preparedAmountA}
              amountB={preparedAmountB}
              memo={memo}
              disabled={!amountA || parseFloat(amountA) === 0 || isChainMismatched}
              selectedSucker={selectedSucker}
            />
          </div>
        ) : (
            <WithdrawCard selectedSucker={selectedSucker}/>
        )}
      </div>

      {/* <div className="background-color flex flex-col gap-[2px] p-[16px] rounded-xl">
        <p className="text-sm font-light">
          {formattedTokenIssuance}
        </p>
        <p className="text-xs text-muted-foreground font-light">
          Total token supply: {new FixedInt(tokenB.totalSupply, tokenB.decimals).format(2)}
        </p>
        {ruleset.payoutRedemptionRate && (
          <p className="text-xs text-muted-foreground font-light">
            Redemption rate: {ruleset.payoutRedemptionRate.format()}%
          </p>
        )}
      </div> */}
    </div>
  );
}