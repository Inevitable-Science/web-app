// src/components/PayCard/TransactionCard.tsx

import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useTokenA } from "@/hooks/useTokenA";
import { JBChainId, useJBChainId, useJBContractContext, useSuckers } from "juice-sdk-react";
import { FixedInt } from "fpnum";
import { Address, formatUnits, parseEther, parseUnits } from "viem";
import {
  ETH_CURRENCY_ID,
  getTokenAToBQuote,
  getTokenBtoAQuote,
  NATIVE_TOKEN,
  USD_CURRENCY_ID,
} from "juice-sdk-core";
import { formatNumber, formatTokenSymbol } from "@/lib/utils";
import { useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { PayActionButton } from "./PayActionButtonIvx";
import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";
import { ChainSelector } from "./ChainSelect";
import { useSelectedSucker } from "../../SelectedSuckerContext";
import { useIVXContext } from "../../DataProvider";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { PayCardSkeleton } from "./PayCardSkeleton";
import { USDC_ADDRESSES } from "@/app/constants";
import { formatTokenAmount, getTokensForChain, Token } from "@/lib/token";
import { determineConversion, toProjectCurrencyAmount, usePaymentQuote } from "@/hooks/PaymentTerminal/usePaymentQuote";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useCurrencyPrice } from "@/hooks/PaymentTerminal/useCurrencyPrice";

export function TransactionCard() {
  // TODO: Disallow negative numbers
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");

  const tokenA = useTokenA();
  const { address } = useAccount(); // Get user's wallet and chain
  const { data: accountingContext } = useProjectAccountingContext();
  const activeChain = useJBChainId();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { version } = useJBContractContext();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();

  const { tokenAToBQuote, tokenBtoAQuote } = usePaymentQuote(selectedSucker.peerChainId);

  const {
    metadata,
    suckers,
    token: tokenBContext,
    ruleset: rulesetContext,
    rulesetMetadata: rulesetMetadataContext,
  } = useIVXContext();

  const { data: newSuckers } = useSuckers();


  const tokens = useMemo(() => getTokensForChain(selectedSucker?.peerChainId), [selectedSucker?.peerChainId]);
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);

  useEffect(() => {
    setSelectedToken((s) => tokens.find((t) => t.address === s.address) || tokens[0]);
  }, [tokens]);

  const payTokenAddress = accountingContext?.project?.token;
  const isTokenANative = payTokenAddress?.toLowerCase() === NATIVE_TOKEN.toLowerCase();
  const selectedTokenIsNative = selectedToken.address.toLowerCase() === NATIVE_TOKEN.toLowerCase();

  const USDC_ADDRESS = activeChain ? USDC_ADDRESSES[chainId] : null;

  const { data: walletBalance, isLoading: isBalanceLoading } = useBalance({
    address,
    token: isTokenANative ? undefined : USDC_ADDRESS as Address,
    chainId: chainId,
  });

  const { balances } = useTokenBalances(tokens, selectedSucker.peerChainId);


  //const { token: tokenBContext } = useJBTokenContext();
  //const { ruleset: rulesetContext, rulesetMetadata: rulesetMetadataContext } = useJBRulesetContext();

  const handlePayAmountChange = (value: string) => {
    //const value = e.target.value;

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
        //new FixedInt(parseEther(value), tokenA.decimals),
        new FixedInt(parseUnits(value || "0", tokenA.decimals), tokenA.decimals),
        {
          weight: ruleset.weight,
          reservedPercent: rulesetMetadata.reservedPercent,
        }
      );
      //const { payerTokens, reservedTokens } = tokenAToBQuote(value, selectedToken)
      setAmountB(formatUnits(quote.payerTokens, tokenB.decimals));
      return;
    } else {
      const { payerTokens, reservedTokens } = tokenAToBQuote(value, selectedToken);
      setAmountB(payerTokens);
      return;
    }
    //setAmountB(payerTokens);
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
    setAmountA(quote.format()); // Use .format() for safety
    //const quote = tokenBtoAQuote(value, selectedToken)
    //setAmountB(formatUnits(quote.payerTokens, tokenB.decimals));
    //setAmountB(quote);
  };


  useEffect(() => {
    if (!selectedToken || !amountA) return;
    handlePayAmountChange(amountA);
  }, [selectedToken]);
  

  // 6. Effect to initialize the context with a default chain
  useEffect(() => {
    // Only set default if context has no value and suckers have loaded
    if (!selectedSucker && suckers && suckers.length > 0) {
      /*const defaultSucker = activeChain
        ? suckers.find((s) => s.peerChainId === activeChain)
        : undefined;
      setSelectedSucker(defaultSucker || suckers[0]);*/
      
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
  if (isBalanceLoading || !suckers) {
    return <PayCardSkeleton selectedToken={selectedToken} />;
  }

  const defaultToken = {
    symbol: "IVX",
    decimals: 18,
  };

  const tokenB = tokenBContext.data || defaultToken;
  const ruleset = rulesetContext;
  const rulesetMetadata = rulesetMetadataContext;

  // --- CORE LOGIC (CALCULATION HANDLERS) ---

  // 7. Handler to update context and switch chain
  const handleChainChange = ({ address, chainId }: { address: Address; chainId: JBChainId }) => {    
    const newSelectedSucker = suckers?.find(
      (s) => s.peerChainId === chainId
    );

    const token = tokens.find((t) => t.address === address);

    if (newSelectedSucker && token) {
      setSelectedSucker(newSelectedSucker);
      setSelectedToken(token);
    }


    //if (activeChain !== newChainId && switchChain) {
    /*if (chainId !== newChainId && switchChain) {
      switchChain({ chainId: newChainId });
    }*/
  };

  

  const preparedAmountA = {
    //amount: new FixedInt(parseEther(amountA || "0"), tokenA.decimals),
    amount: new FixedInt(parseUnits(amountA || "0", selectedToken.decimals), selectedToken.decimals),
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
    <div className="flex flex-col rounded-xl bg-grey-450 p-[10px]">
      <div className="flex flex-col gap-2">
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm font-light text-muted-foreground">YOU PAY</p>
            <input
              type="number"
              className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-none ring-0 placeholder:text-white focus:outline-none focus:ring-0 focus:placeholder:text-muted-foreground"
              placeholder="0.00"
              value={amountA}
              onChange={(e) => handlePayAmountChange(e.target.value)}
              onKeyDown={preventMinusKey}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <ChainSelector
              disabled={!suckers || suckers.length <= 1}
              value={selectedToken}
              onChange={handleChainChange}
              options={tokens}
            />
            <p className="w-[130px] text-nowrap text-right text-sm font-light text-muted-foreground">
              Balance:{" "}
                {formatTokenAmount(balances.get(selectedToken.address) ?? 0n, selectedToken)}
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
              onKeyDown={preventMinusKey}
            />
          </div>
          <div className="flex w-fit flex-row flex-nowrap items-center gap-1 rounded-full bg-grey-450 py-1 pl-1.5 pr-3">
            <Image
              src={
                metadata.data?.logoUri
                  ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                  : "/assets/img/logo/mainnet.svg"
              }
              className="rounded-full"
              height={24}
              width={24}
              alt="Token Icon"
            />
            <p className="text-lg font-light">{tokenB.symbol}</p>
          </div>
        </div>
        <PayActionButton
          amountA={preparedAmountA}
          amountB={preparedAmountB}
          paymentToken={selectedToken}
          walletBalance={balances}
          disabled={!amountA || parseFloat(amountA) === 0}
          selectedSucker={selectedSucker}
        />
      </div>
    </div>
  );
}
