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
      const numberPayerTokens = Number(payerTokens);

      if (numberPayerTokens < 0) {
        // Round 3 to sigfigs then remove trailing 0's
        // this prevents strings like 0.0100000 and 0.000111111111
        setAmountB(Number(numberPayerTokens.toPrecision(3)).toString());
        return;
      }

      setAmountB(Number(numberPayerTokens.toFixed(4)).toString());
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

    if (numberPayerTokens < 0) {
      setAmountA(Number(numberPayerTokens.toPrecision(3)).toString());
      return;
    }

    setAmountA(Number(numberPayerTokens.toFixed(4)).toString());
    return;
  };

  useEffect(() => {
    if (!selectedToken || !amountA) return;
    handlePayAmountChange(amountA);
  }, [selectedToken, handlePayAmountChange]);

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
    <div className="bg-grey-450 flex flex-col rounded-xl p-[10px]">
      <div className="flex flex-col gap-2">
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">YOU PAY</p>
            <input
              type="number"
              className="focus:placeholder:text-muted-foreground w-full border-none bg-transparent p-0 text-2xl shadow-none ring-0 outline-hidden placeholder:text-white focus:ring-0 focus:outline-hidden"
              placeholder="0.00"
              max={7}
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
            <p className="text-muted-foreground w-[130px] text-right text-sm font-light text-nowrap select-none">
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
            <p className="text-muted-foreground text-sm font-light select-none">
              YOU RECEIVE
            </p>
            <input
              type="number"
              className="focus:placeholder:text-muted-foregroun w-full border-none bg-transparent p-0 text-2xl shadow-none ring-0 outline-hidden placeholder:text-white focus:ring-0 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-80"
              placeholder="0.00"
              max={7}
              value={amountB}
              disabled={isTokenANative !== selectedTokenIsNative}
              onChange={handleReceiveAmountChange}
              onKeyDown={preventMinusKey}
            />
          </div>
          <div className="bg-grey-450 min-w-fit max-w-fit flex flex-row flex-nowrap items-center gap-1 rounded-full py-1 pr-3 pl-1.5">
            <Image
              src={
                metadata.data?.logoUri
                  ? ipfsUriToGatewayUrl(metadata.data.logoUri)
                  : "https://cdn.inevitable.science/static/img/logo/mainnet.svg"
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
