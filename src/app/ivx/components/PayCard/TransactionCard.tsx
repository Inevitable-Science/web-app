import * as React from "react";
import { useEffect, useState, useMemo } from "react";
import {
  getTokenAToBQuote,
  getTokenBtoAQuote,
  NATIVE_TOKEN,
  USDC_ADDRESSES,
} from "juice-sdk-core";
import { JBChainId, useJBChainId, useJBContractContext } from "juice-sdk-react";
import Image from "next/image";
import { Address, formatUnits, parseUnits } from "viem";
import { useChainId } from "wagmi";
import { FixedInt } from "fpnum";

import { PayActionButton } from "./PayActionButtonIvx";
import { useSelectedSucker } from "../../SelectedSuckerContext";
import { useIVXContext } from "../../DataProvider";

import { PayCardSkeleton } from "./PayCardSkeleton";
import { ChainSelector } from "./ChainSelect";

import { formatTokenSymbol } from "@/lib/utils";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { formatTokenAmount, getTokensForChain, Token } from "@/lib/token";
import { usePaymentQuote } from "@/hooks/PaymentTerminal/usePaymentQuote";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useTokenA } from "@/hooks/useTokenA";
import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";

export function TransactionCard() {
  const tokenA = useTokenA();
  const activeChain = useJBChainId();
  const chainId = useChainId();

  const { data: accountingContext } = useProjectAccountingContext();
  const { version } = useJBContractContext();
  const {
    metadata,
    suckers,
    token: tokenBContext,
    ruleset: rulesetContext,
    rulesetMetadata: rulesetMetadataContext,
  } = useIVXContext();
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
    return <PayCardSkeleton selectedToken={selectedToken} tokens={tokens} />;
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
              handleChainChange={handleChainChange}
              handleTokenChange={handleTokenChange}
              options={tokens}
            />
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
              className="focus:placeholder:text-muted-foregroun w-full border-none bg-transparent p-0 text-2xl shadow-none outline-none ring-0 placeholder:text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-80"
              placeholder="0.00"
              value={amountB}
              disabled={isTokenANative !== selectedTokenIsNative}
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
        />
      </div>
    </div>
  );
}
