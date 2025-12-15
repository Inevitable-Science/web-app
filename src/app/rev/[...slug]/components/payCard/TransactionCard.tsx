"use client";
import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTokenA } from "@/hooks/useTokenA";
import { JBChainId, useJBChainId, useJBContractContext } from "juice-sdk-react";
import { FixedInt } from "fpnum";
import { Address, formatUnits, parseEther, parseUnits } from "viem";
import {
  getTokenAToBQuote,
  getTokenBtoAQuote,
  NATIVE_TOKEN,
  USDC_ADDRESSES,
} from "juice-sdk-core";
import { formatTokenSymbol } from "@/lib/utils";
import { useChainId } from "wagmi";
import { PayActionButton } from "./PayActionButton";
import { WithdrawCard } from "./WithdrawCard";
import { ChainSelector } from "./ChainSelector";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { useProjectContext } from "../../ProjectDataContext";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";
import { usePaymentQuote } from "@/hooks/PaymentTerminal/usePaymentQuote";
import { formatTokenAmount, getTokensForChain, Token } from "@/lib/token";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { ChainLogo } from "@/components/ChainLogo";
import { PayCardSkeleton } from "./PayCardSkeleton";

export function TransactionCard() {
  const tokenA = useTokenA();
  const activeChain = useJBChainId();
  const chainId = useChainId();

  const { version } = useJBContractContext();
  const {
    metadata,
    suckers,
    token: tokenBContext,
    ruleset: rulesetContext,
    rulesetMetadata: rulesetMetadataContext,
  } = useProjectContext();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const { data: accountingContext } = useProjectAccountingContext();

  const { tokenAToBQuote } = usePaymentQuote(selectedSucker.peerChainId);

  const tokens = useMemo(
    () => getTokensForChain(selectedSucker?.peerChainId, version),
    [selectedSucker?.peerChainId]
  );
  const { balances } = useTokenBalances(tokens, selectedSucker.peerChainId);

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);

  // ---- ----
  const [activeTab, setActiveTab] = useState<"buy" | "withdraw">("buy");
  const [memo, setMemo] = useState("");
  // ---- ----

  const payTokenAddress = accountingContext?.project?.token;
  const isTokenANative =
    payTokenAddress?.toLowerCase() === NATIVE_TOKEN.toLowerCase();
  const selectedTokenIsNative =
    selectedToken.address.toLowerCase() === NATIVE_TOKEN.toLowerCase();

  useEffect(() => {
    setSelectedToken(
      (s) => tokens.find((t) => t.address === s.address) || tokens[0]
    );
  }, [tokens]);

  const handlePayAmountChange = (value: string) => {
    if (value.startsWith("-")) {
      setAmountA("0");
      return;
    }

    setAmountA(value);
    if (!value || value === ".") {
      setAmountB("");
      return;
    }

    if (version === 4) {
      const quote = getTokenAToBQuote(
        new FixedInt(
          parseUnits(value || "0", tokenA.decimals),
          tokenA.decimals
        ),
        {
          weight: ruleset.weight,
          reservedPercent: rulesetMetadata.reservedPercent,
        }
      );
      setAmountB(formatUnits(quote.payerTokens, tokenB.decimals));
      return;
    } else {
      const { payerTokens, reservedTokens } = tokenAToBQuote(
        value,
        selectedToken
      );

      const numberPayerTokens = Number(payerTokens);
      if (numberPayerTokens < 1) {
        // Round 3 to sigfigs then remove trailing 0's -> via Number(...).toString() 
        // this prevents strings like 0.0100000 and 0.000111111111
        setAmountB(Number(numberPayerTokens.toPrecision(3)).toString()); // KEEP Number(...).toString(); 
        return;
      }
      
      setAmountB(Number(numberPayerTokens.toFixed(3)).toString());
      return;
    }
  };

  const handleReceiveAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setAmountB(value);
    if (!value || value === ".") {
      setAmountA("");
      return;
    }
    const quote = getTokenBtoAQuote(
      new FixedInt(parseUnits(value, tokenB.decimals), tokenB.decimals),
      tokenB.decimals,
      {
        weight: ruleset.weight,
        reservedPercent: rulesetMetadata.reservedPercent,
      }
    );

    const numberPayerTokens = Number(quote.format());
    if (numberPayerTokens < 1) {
      setAmountA(Number(numberPayerTokens.toPrecision(3)).toString());
      return;
    }
    
    setAmountA(Number(numberPayerTokens.toFixed(3)).toString());
    return;
  };

  useEffect(() => {
    if (!selectedToken || !amountA) return;
    handlePayAmountChange(amountA);
  }, [selectedToken]);

  // 6. Effect to initialize the context with a default chain
  useEffect(() => {
    // Only set default if context has no value and suckers have loaded
    if (!selectedSucker && suckers && suckers.length > 0) {
      if (chainId) {
        const defaultSucker = activeChain
          ? suckers.find((s) => s.peerChainId === chainId)
          : undefined;
        setSelectedSucker(defaultSucker || suckers[0]);
        return;
      }

      const defaultSucker = activeChain
        ? suckers.find((s) => s.peerChainId === activeChain)
        : undefined;
      setSelectedSucker(defaultSucker || suckers[0]);
    }
  }, [suckers, activeChain, selectedSucker, setSelectedSucker]);

  // Updated Load Guard
  if (!balances || !suckers) {
    return <PayCardSkeleton selectedToken={selectedToken} tokens={tokens} />;
  }

  const defaultToken = {
    symbol: "TOKENS",
    decimals: 18,
  };

  const tokenB = tokenBContext.data || defaultToken;
  const ruleset = rulesetContext;
  const rulesetMetadata = rulesetMetadataContext;

  const handleChainChange = ({ chainId }: { chainId: JBChainId }) => {
    const newSelectedSucker = suckers?.find((s) => s.peerChainId === chainId);
    const newChainTokens = getTokensForChain(chainId, version);

    let token;
    if (selectedToken.address.toLowerCase() === NATIVE_TOKEN.toLowerCase()) {
      token = newChainTokens.find((t) => t.address === NATIVE_TOKEN);
    } else {
      token = newChainTokens.find((t) => t.address === USDC_ADDRESSES[chainId]);
    }

    if (newSelectedSucker && token) {
      setSelectedSucker(newSelectedSucker);
      setSelectedToken(token);
    }
  };

  const handleTokenChange = ({ address }: { address: Address }) => {
    const token = tokens.find((t) => t.address === address);

    if (token) {
      setSelectedToken(token);
    }

    return;
  };

  const preparedAmountA = {
    amount: new FixedInt(
      parseUnits(amountA || "0", selectedToken.decimals),
      selectedToken.decimals
    ),
    symbol: selectedToken.symbol,
  };
  const preparedAmountB = {
    amount: new FixedInt(
      parseUnits(amountB || "0", tokenB.decimals),
      tokenB.decimals
    ),
    symbol: formatTokenSymbol(tokenB.symbol),
  };

  const preventMinusKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const invalidKeys = ["e", "E", "+", "-", "ArrowUp", "ArrowDown"];

    const key = e.key;

    // Allow all control/navigation keys:
    const controlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "Home",
      "End",
      "ArrowLeft",
      "ArrowRight",
    ];

    if (controlKeys.includes(key)) {
      return; // allow
    }

    // Block invalid characters
    if (invalidKeys.includes(key)) {
      e.preventDefault();
      return;
    }

    // Key is a single character. Ensure it's a digit or decimal point.
    if (!/[\d.]/.test(key)) {
      e.preventDefault();
      return;
    }

    const current = e.currentTarget.value;
    const next = current + key;

    // Limit total length to 16
    if (next.length > 16) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col rounded-xl bg-grey-450 p-[12px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            onClick={() => setActiveTab("buy")}
            className={`h-[35px] rounded-none border-b-[1.5px] bg-transparent font-light hover:bg-transparent ${
              activeTab === "buy"
                ? "border-cerulean text-white"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Buy
          </Button>
          {rulesetMetadata?.useTotalSurplusForCashOuts && (
            <Button
              onClick={() => setActiveTab("withdraw")}
              className={`h-[35px] rounded-none border-b-[1.5px] bg-transparent font-light hover:bg-transparent ${
                activeTab === "withdraw"
                  ? "border-cerulean text-white"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              Withdraw
            </Button>
          )}
        </div>
        <div className={`background-color flex rounded-full p-1 pr-2`}>
          {suckers.map((chain) => (
            <div key={chain.peerChainId} className="w-[16px]">
              <ChainLogo
                chainId={Number(chain.peerChainId) as JBChainId}
                height={20}
                width={20}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="my-4">
        {activeTab === "buy" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
                <div className="flex flex-col gap-[2px]">
                  <p className="text-sm font-light text-muted-foreground">
                    YOU PAY
                  </p>
                  <input
                    type="number"
                    className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-hidden ring-0 placeholder:text-white focus:outline-hidden focus:ring-0 focus:placeholder:text-muted-foreground"
                    placeholder="0.00"
                    value={amountA}
                    onChange={(e) => handlePayAmountChange(e.target.value)}
                    onKeyDown={preventMinusKey}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex w-fit items-center justify-end gap-2 rounded-full bg-grey-450">
                    <ChainSelector
                      disabled={!suckers/* || suckers.length <= 1*/}
                      value={selectedToken}
                      handleChainChange={handleChainChange}
                      handleTokenChange={handleTokenChange}
                      options={tokens}
                    />
                  </div>
                  <p className="w-[130px] select-none text-nowrap text-right text-sm font-light text-muted-foreground">
                    Balance:{" "}
                    {formatTokenAmount(
                      balances.get(selectedToken.address) ?? 0n,
                      selectedToken
                    )}
                  </p>
                </div>
              </div>
              <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
                <div className="flex flex-col gap-[2px]">
                  <p className="select-none text-sm font-light text-muted-foreground">
                    YOU RECEIVE
                  </p>
                  <input
                    type="number"
                    className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-hidden ring-0 placeholder:text-white focus:outline-hidden focus:ring-0 focus:placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-80"
                    placeholder="0.00"
                    value={amountB}
                    onChange={handleReceiveAmountChange}
                    onKeyDown={preventMinusKey}
                    disabled={isTokenANative !== selectedTokenIsNative}
                  />
                </div>
                <div className="flex w-fit min-w-fit items-center gap-1 rounded-full bg-grey-450 px-1.5 py-1">
                  <div className="flex items-end">
                    <Image
                      src={
                        metadata.data?.logoUri
                          ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                          : "https://cdn.inevitable.science/static/img/logo/mainnet.svg"
                      }
                      className="rounded-full"
                      alt={`Token Logo`}
                      width={24}
                      height={24}
                      style={{
                        minWidth: 24,
                        minHeight: 24,
                        flexShrink: 0,
                      }}
                    />
      
                    <div className="-mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] border-grey-450 bg-grey-450 shadow-md">
                      <ChainLogo
                        chainId={Number(selectedSucker.peerChainId) as JBChainId}
                        height={16}
                        width={16}
                      />
                    </div>
                  </div>
                  <p className="text-lg font-light">
                    {tokenB.symbol || "TOKENS"}
                  </p>
                </div>
              </div>
            </div>
            <input
              type="text"
              className="background-color w-full rounded-lg border-none p-2 text-sm font-light outline-hidden transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
              onChange={(e) => setMemo(e.target.value)}
              value={memo}
              placeholder="Add a note... (optional)"
            />
            <PayActionButton
              amountA={preparedAmountA}
              amountB={preparedAmountB}
              paymentToken={selectedToken}
              walletBalance={balances}
              memo={memo}
              disabled={!amountA || parseFloat(amountA) === 0}
            />
          </div>
        ) : (
          <WithdrawCard />
        )}
      </div>
    </div>
  );
}
