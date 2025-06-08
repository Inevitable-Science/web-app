// src/components/PayCard.tsx

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTokenA } from "@/hooks/useTokenA";
import {
  useJBContractContext,
  useJBRulesetContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { FixedInt } from "fpnum";
import { formatUnits, parseEther, parseUnits } from "viem";
import { getTokenAToBQuote, getTokenBtoAQuote } from "juice-sdk-core";
import { formatTokenSymbol } from "@/lib/utils";
import { Loader2 } from "lucide-react"; // For a better loading indicator
import { useBalance } from "wagmi";
import { PayActionButton } from "@/components/PayActionButton";
import { useFormattedTokenIssuance } from "@/hooks/useFormattedTokenIssuance";
import { WithdrawCard } from "./WithdrawCard";

export interface PayCardProps {}

export function TransactionCard(props: PayCardProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'withdraw'>('buy');
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [memo, setMemo] = useState("");

  const tokenA = useTokenA();
  const { token: tokenBContext } = useJBTokenContext(); // Renamed to avoid shadowing
  const { ruleset: rulesetContext, rulesetMetadata: rulesetMetadataContext } = useJBRulesetContext();
  const { contracts: { primaryNativeTerminal } } = useJBContractContext();
  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance();

  // Load guard
  if (
    isBalanceLoading ||
    tokenBContext.isLoading ||
    rulesetContext.isLoading ||
    rulesetMetadataContext.isLoading ||
    !tokenBContext.data ||
    !rulesetContext.data ||
    !rulesetMetadataContext.data ||
    !primaryNativeTerminal?.data
  ) {
    return (
      <div className="bg-grey-450 flex flex-col items-center justify-center p-[12px] rounded-xl h-[450px]">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  const tokenB = tokenBContext.data;
  const ruleset = rulesetContext.data;
  const rulesetMetadata = rulesetMetadataContext.data;
  const terminal = primaryNativeTerminal.data;

  // --- 2. CORE LOGIC (CALCULATION HANDLERS) ---
  const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountA(value);

    if (!value || value === ".") {
      setAmountB("");
      return;
    }
    
    const valueBigInt = parseEther(value);
    const quote = getTokenAToBQuote(new FixedInt(valueBigInt, tokenA.decimals), {
      weight: ruleset.weight,
      reservedPercent: rulesetMetadata.reservedPercent,
    });

    setAmountB(formatUnits(quote.payerTokens, tokenB.decimals));
  };

  const handleReceiveAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountB(value);

    if (!value || value === ".") {
      setAmountA("");
      return;
    }

    const valueBigInt = parseUnits(value, tokenB.decimals);
    const quote = getTokenBtoAQuote(
      new FixedInt(valueBigInt, tokenB.decimals),
      tokenA.decimals,
      {
        weight: ruleset.weight,
        reservedPercent: rulesetMetadata.reservedPercent,
      }
    );

    setAmountA(formatUnits(quote.value, tokenA.decimals));
  };

  // --- DATA PREPARATION FOR TRANSACTION ---
  const preparedAmountA = {
    amount: new FixedInt(parseEther(amountA || "0"), tokenA.decimals),
    symbol: tokenA.symbol,
  };
  const preparedAmountB = {
    amount: new FixedInt(parseUnits(amountB || "0", tokenB.decimals), tokenB.decimals),
    symbol: formatTokenSymbol(tokenB.symbol),
  };

  return (
    <div className="bg-grey-450 flex flex-col p-[12px] rounded-xl">
      {/* ... (Tabs for Buy/Withdraw) ... */}
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
          <Button
            onClick={() => setActiveTab('withdraw')}
            className={`h-[35px] rounded-none font-light bg-transparent hover:bg-transparent border-b-[1.5px] ${
              activeTab === 'withdraw' ? 'border-cerulean text-white' : 'border-transparent text-muted-foreground'
            }`}
          >
            Withdraw
          </Button>
        </div>
      </div>


      <div className="my-4">
        {/* Conditional Rendering of the Active Tab's View */}
        {activeTab === 'buy' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {/* PAY INPUT */}
              <div className="background-color flex items-center justify-between p-[16px] rounded-xl">
                <div className="flex flex-col gap-[2px]">
                  <p className="text-sm text-muted-foreground font-light">YOU PAY</p>
                  <input
                    type="number"
                    className="bg-transparent max-w-[130px] shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                    placeholder="0.00"
                    value={amountA}
                    onChange={handlePayAmountChange}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex w-fit bg-grey-450 rounded-full py-1 px-3 gap-2 items-center justify-end">
                    <p className="text-lg font-light">{tokenA.symbol}</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-light">
                    Balance: {walletBalance ? parseFloat(formatUnits(walletBalance.value, tokenA.decimals)).toFixed(4) : "0.00"}
                  </p>
                </div>
              </div>

              {/* RECEIVE INPUT */}
              <div className="background-color flex items-center justify-between p-[16px] rounded-xl">
                <div className="flex flex-col gap-[2px]">
                  <p className="text-sm text-muted-foreground font-light">YOU RECEIVE</p>
                  <input
                    type="number"
                    readOnly
                    className="bg-transparent max-w-[130px] shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none"
                    placeholder="0.00"
                    value={amountB}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex w-fit bg-grey-450 rounded-full py-1 px-3 gap-2 items-center">
                    <p className="text-lg font-light">{formatTokenSymbol(tokenB.symbol)}</p>
                  </div>
                </div>
              </div>
            </div>

             <input
                  type="text"
                  /* "bg-transparent max-w-[130px] shadow-none outline-none ring-0 border-none p-0 text-2xl placeholder:text-white focus:placeholder:text-muted-foreground focus:ring-0 focus:outline-none" */
                  className="w-full background-color p-2 rounded-lg text-sm font-light placeholder:text-muted-foreground outline-none border-none focus:ring-0 focus:outline-none"
                  onChange={(e) => setMemo(e.target.value)}
                  value={memo}
                  placeholder="Add a note... (optional)"
                />
            
            <PayActionButton
              amountA={preparedAmountA}
              amountB={preparedAmountB}
              memo={memo}
              disabled={!amountA || parseFloat(amountA) === 0}
            />
            <div className="background-color flex flex-col gap-[2px] p-[16px] rounded-xl mt-4">
        <p className="text-sm font-light">
        </p>
        <p className="text-xs text-muted-foreground font-light">
          Total token supply: {new FixedInt(tokenB.totalSupply.value, tokenB.decimals).format(2)}
        </p>
      </div>
          </div>
          
        ) : (
          <WithdrawCard />
        )}
      </div>
    </div>
  );
}