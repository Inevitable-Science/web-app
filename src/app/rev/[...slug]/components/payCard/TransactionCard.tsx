// src/components/PayCard/TransactionCard.tsx
/*
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
  useSuckers,
} from "juice-sdk-react";
import { FixedInt } from "fpnum";
import { formatUnits, parseEther, parseUnits } from "viem";
import {
  getTokenAToBQuote,
  getTokenBtoAQuote,
  NATIVE_TOKEN,
  USDC_ADDRESSES,
} from "juice-sdk-core";
import { formatTokenSymbol } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { PayActionButton } from "./PayActionButton";
import { WithdrawCard } from "./WithdrawCard";
//import { ChainSelector } from "./ChainSelector";
import { ChainSelector } from "@/app/ivx/components/payCard/ChainSelect";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { useProjectContext } from "../../ProjectDataContext";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";

export function TransactionCard() {
  const [activeTab, setActiveTab] = useState<"buy" | "withdraw">("buy");

  const [memo, setMemo] = useState("");

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const tokenA = useTokenA();
  const { address } = useAccount(); // Get user's wallet and chain
  const activeChain = useJBChainId();
  const { switchChain } = useSwitchChain();

  //const USDC_ADDRESSE = USDC_ADDRESSES[activeChain];
  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  const { token: tokenBContext } = useJBTokenContext();
  const { ruleset: rulesetContext, rulesetMetadata: rulesetMetadataContext } =
    useJBRulesetContext();

  const {
    data: suckers,
    isLoading: areSuckersLoading,
    isError: isSuckerError,
  } = useSuckers();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const { data: accountingContext } = useProjectAccountingContext();
  const { metadata } = useProjectContext();

  // 6. Effect to initialize the context with a default chain
  useEffect(() => {
    // Only set default if context has no value and suckers have loaded
    if (!selectedSucker && suckers && suckers.length > 0) {
      const defaultSucker = activeChain
        ? suckers.find((s) => s.peerChainId === activeChain)
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
      <div className="flex h-[450px] flex-col items-center justify-center rounded-xl bg-grey-450 p-[12px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const defaultToken = {
    symbol: "TOKENS",
    decimals: 18,
  };

  const tokenB = tokenBContext.data || defaultToken;
  const ruleset = rulesetContext.data;
  const rulesetMetadata = rulesetMetadataContext.data;

  // --- CORE LOGIC (CALCULATION HANDLERS) ---
  const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(tokenA.decimals);
    const value = e.target.value;
    setAmountA(value);
    if (!value || value === ".") {
      setAmountB("");
      return;
    }
    const quote = getTokenAToBQuote(
      new FixedInt(parseEther(value), tokenA.decimals),
      {
        weight: ruleset.weight,
        reservedPercent: rulesetMetadata.reservedPercent,
      }
    );
    setAmountB(formatUnits(quote.payerTokens, tokenB.decimals));
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
      tokenA.decimals,
      {
        weight: ruleset.weight,
        reservedPercent: rulesetMetadata.reservedPercent,
      }
    );
    setAmountA(quote.format()); // Use .format() for safety
  };

  // 7. Handler to update context and switch chain
  const handleChainChange = (newChainId: JBChainId) => {
    const newSelectedSucker = suckers?.find(
      (s) => s.peerChainId === newChainId
    );
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
    amount: new FixedInt(
      parseUnits(amountB || "0", tokenB.decimals),
      tokenB.decimals
    ),
    symbol: formatTokenSymbol(tokenB.symbol),
  };

  const isChainMismatched = activeChain !== selectedSucker?.peerChainId;

  return (
    <div className="flex flex-col rounded-xl bg-grey-450 p-[12px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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

        {/* 8. Add the ChainSelector to the UI * /}
        {/*<ChainSelector
          disabled={!suckers || suckers.length <= 1}
          value={selectedSucker?.peerChainId as JBChainId}
          onChange={handleChainChange}
          options={suckers?.map((s) => s.peerChainId) ?? []}
        />* /}
        <ChainSelector
          disabled={!suckers || suckers.length <= 1}
          value={selectedToken}
          handleChainChange={handleChainChange}
          handleTokenChange={handleTokenChange}
          options={tokens}
        />
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
                    className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-none ring-0 placeholder:text-white focus:outline-none focus:ring-0 focus:placeholder:text-muted-foreground"
                    placeholder="0.00"
                    value={amountA}
                    onChange={handlePayAmountChange}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex w-fit items-center justify-end gap-2 rounded-full bg-grey-450 px-2 py-1">
                    <Image
                      src="/assets/img/logo/mainnet.svg"
                      className="rounded-full"
                      height={22}
                      width={22}
                      alt="ETH Icon"
                    />
                    <p className="text-lg font-light">{tokenA.symbol}</p>
                  </div>
                  <p className="w-[130px] text-nowrap text-right text-sm font-light text-muted-foreground">
                    Balance:{" "}
                    {walletBalance
                      ? parseFloat(
                          formatUnits(walletBalance.value, tokenA.decimals)
                        ).toFixed(4)
                      : "0.00"}
                  </p>
                </div>
              </div>
              <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
                <div className="flex flex-col gap-[2px]">
                  <p className="text-sm font-light text-muted-foreground">
                    YOU RECEIVE
                  </p>
                  <input
                    type="number"
                    className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-none ring-0 placeholder:text-white focus:outline-none focus:ring-0 focus:placeholder:text-muted-foreground"
                    placeholder="0.00"
                    value={amountB}
                    onChange={handleReceiveAmountChange}
                  />
                </div>
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
                    {formatTokenSymbol(tokenB.symbol)}
                  </p>
                </div>
              </div>
            </div>
            <input
              type="text"
              className="background-color w-full rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
              onChange={(e) => setMemo(e.target.value)}
              value={memo}
              placeholder="Add a note... (optional)"
            />
            <PayActionButton
              amountA={preparedAmountA}
              amountB={preparedAmountB}
              paymentToken={
                (accountingContext?.project?.token as `0x${string}`) ||
                NATIVE_TOKEN.toLowerCase()
              }
              walletBalance={
                walletBalance
                  ? parseFloat(
                      formatUnits(walletBalance.value, tokenA.decimals)
                    ).toFixed(4)
                  : 0
              }
              memo={memo}
              disabled={!amountA || parseFloat(amountA) === 0}
              selectedSucker={selectedSucker}
            />
          </div>
        ) : (
          <WithdrawCard selectedSucker={selectedSucker} />
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
      </div> * /}
    </div>
  );
}
*/







import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTokenA } from "@/hooks/useTokenA";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBRulesetContext,
  useJBTokenContext,
  useSuckers,
} from "juice-sdk-react";
import { FixedInt } from "fpnum";
import { Address, formatUnits, parseEther, parseUnits } from "viem";
import {
  getTokenAToBQuote,
  getTokenBtoAQuote,
  NATIVE_TOKEN,
  USDC_ADDRESSES,
} from "juice-sdk-core";
import { formatTokenSymbol } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
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
//import { PayCardSkeleton } from "@/app/ivx/components/payCard/PayCardSkeleton";

export function TransactionCard() {
  /*const [activeTab, setActiveTab] = useState<"buy" | "withdraw">("buy");

  const [memo, setMemo] = useState("");

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const tokenA = useTokenA();
  const { address } = useAccount(); // Get user's wallet and chain
  const activeChain = useJBChainId();
  const { switchChain } = useSwitchChain();

  //const USDC_ADDRESSE = USDC_ADDRESSES[activeChain];
  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({
    address,
  });

  const { token: tokenBContext } = useJBTokenContext();
  const { ruleset: rulesetContext, rulesetMetadata: rulesetMetadataContext } =
    useJBRulesetContext();

  const {
    data: suckers,
    isLoading: areSuckersLoading,
    isError: isSuckerError,
  } = useSuckers();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const { data: accountingContext } = useProjectAccountingContext();
  const { metadata } = useProjectContext();

  // 6. Effect to initialize the context with a default chain
  useEffect(() => {
    // Only set default if context has no value and suckers have loaded
    if (!selectedSucker && suckers && suckers.length > 0) {
      const defaultSucker = activeChain
        ? suckers.find((s) => s.peerChainId === activeChain)
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
      <div className="flex h-[450px] flex-col items-center justify-center rounded-xl bg-grey-450 p-[12px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const defaultToken = {
    symbol: "TOKENS",
    decimals: 18,
  };

  const tokenB = tokenBContext.data || defaultToken;
  const ruleset = rulesetContext.data;
  const rulesetMetadata = rulesetMetadataContext.data;

  // --- CORE LOGIC (CALCULATION HANDLERS) ---
  const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(tokenA.decimals);
    const value = e.target.value;
    setAmountA(value);
    if (!value || value === ".") {
      setAmountB("");
      return;
    }
    const quote = getTokenAToBQuote(
      new FixedInt(parseEther(value), tokenA.decimals),
      {
        weight: ruleset.weight,
        reservedPercent: rulesetMetadata.reservedPercent,
      }
    );
    setAmountB(formatUnits(quote.payerTokens, tokenB.decimals));
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
      tokenA.decimals,
      {
        weight: ruleset.weight,
        reservedPercent: rulesetMetadata.reservedPercent,
      }
    );
    setAmountA(quote.format()); // Use .format() for safety
  };

  // 7. Handler to update context and switch chain
  const handleChainChange = (newChainId: JBChainId) => {
    const newSelectedSucker = suckers?.find(
      (s) => s.peerChainId === newChainId
    );
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
    amount: new FixedInt(
      parseUnits(amountB || "0", tokenB.decimals),
      tokenB.decimals
    ),
    symbol: formatTokenSymbol(tokenB.symbol),
  };

  const isChainMismatched = activeChain !== selectedSucker?.peerChainId;*/


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
      setAmountB(payerTokens);
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
    setAmountA(quote.format());
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
    return null; {/*<PayCardSkeleton selectedToken={selectedToken} tokens={tokens} />;*/}
  }

  const defaultToken = {
    symbol: "IVX",
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

    console.log(token);

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
    if (e.key === "-" || e.key === "Minus") {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col rounded-xl bg-grey-450 p-[12px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
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

        {/* 8. Add the ChainSelector to the UI */}
        {/*<ChainSelector
          disabled={!suckers || suckers.length <= 1}
          value={selectedSucker?.peerChainId as JBChainId}
          onChange={handleChainChange}
          options={suckers?.map((s) => s.peerChainId) ?? []}
        />*/}
        {/*<ChainSelector
          disabled={!suckers || suckers.length <= 1}
          value={selectedToken}
          handleChainChange={handleChainChange}
          handleTokenChange={handleTokenChange}
          options={tokens}
        />*/}

        <div className={`flex pr-2 p-1 background-color rounded-full`}>
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
                    className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-none ring-0 placeholder:text-white focus:outline-none focus:ring-0 focus:placeholder:text-muted-foreground"
                    placeholder="0.00"
                    value={amountA}
                    onChange={(e) => handlePayAmountChange(e.target.value)}
                  />
                </div>
                <div className="flex flex-col items-end gap-1">
                <div className="flex w-fit items-center justify-end gap-2 rounded-full bg-grey-450">
                  {/*<div className="flex w-fit items-center justify-end gap-2 rounded-full bg-grey-450 px-2 py-1">
                    <Image
                      src="/assets/img/logo/mainnet.svg"
                      className="rounded-full"
                      height={22}
                      width={22}
                      alt="ETH Icon"
                    />
                    <p className="text-lg font-light">{tokenA.symbol}</p>*/}
                    <ChainSelector
                      disabled={!suckers || suckers.length <= 1}
                      value={selectedToken}
                      handleChainChange={handleChainChange}
                      handleTokenChange={handleTokenChange}
                      options={tokens}
                    />
                  </div>
                  <p className="w-[130px] text-nowrap text-right text-sm font-light text-muted-foreground">
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
                  <p className="text-sm font-light text-muted-foreground">
                    YOU RECEIVE
                  </p>
                  <input
                    type="number"
                    className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-none ring-0 placeholder:text-white focus:outline-none focus:ring-0 focus:placeholder:text-muted-foreground"
                    placeholder="0.00"
                    value={amountB}
                    onChange={handleReceiveAmountChange}
                  />
                </div>
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
                    {formatTokenSymbol(tokenB.symbol)}
                  </p>
                </div>
              </div>
            </div>
            <input
              type="text"
              className="background-color w-full rounded-lg border-none p-2 text-sm font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
              onChange={(e) => setMemo(e.target.value)}
              value={memo}
              placeholder="Add a note... (optional)"
            />
            {/*<PayActionButton
              amountA={preparedAmountA}
              amountB={preparedAmountB}
              paymentToken={
                (accountingContext?.project?.token as `0x${string}`) ||
                NATIVE_TOKEN.toLowerCase()
              }
              walletBalance={
                walletBalance
                  ? parseFloat(
                      formatUnits(walletBalance.value, tokenA.decimals)
                    ).toFixed(4)
                  : 0
              }
              memo={memo}
              disabled={!amountA || parseFloat(amountA) === 0}
              selectedSucker={selectedSucker}
            />*/}
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
          <WithdrawCard selectedSucker={selectedSucker} />
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
