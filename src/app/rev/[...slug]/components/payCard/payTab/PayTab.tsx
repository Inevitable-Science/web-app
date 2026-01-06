"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  JBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { FixedInt } from "fpnum";
import { Address, formatUnits, parseUnits } from "viem";
import {
  getTokenAToBQuote,
  getTokenBtoAQuote,
  USDC_ADDRESSES,
} from "juice-sdk-core";
import { formatTokenSymbol } from "@/lib/utils";
import { PayActionButton } from "./PayActionButton";
import { ChainSelector } from "./ChainSelector";
import { useSelectedSucker } from "../SelectedSuckerContext";
import { useProjectDataStore } from "../../../../../../store/ProjectDataContext";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { usePaymentQuote } from "@/hooks/PaymentTerminal/usePaymentQuote";
import { formatTokenAmount, getTokensForChain, Token } from "@/lib/token";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "../../../../../../components/PayInput";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";

export function PayTab({
  tokens,
  selectedToken,
  setSelectedToken,
}: {
  tokens: Token[];
  selectedToken: Token;
  setSelectedToken: React.Dispatch<React.SetStateAction<Token>>;
}) {
  const suckers = useProjectDataStore((state) => state.suckers);
  const rulesetMetadata = useProjectDataStore(
    (state) => state.rulesetMetadata
  );
  const ruleset = useProjectDataStore((state) => state.ruleset);

  const { token: tokenBContext } = useJBTokenContext();
  const { metadata } = useJBProjectMetadataContext();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const { version } = useJBContractContext();

  const baseToken = useProjectBaseToken();
  const { tokenAToBQuote, isLoading: isQuoteLoading } = usePaymentQuote(selectedSucker.peerChainId);
  const { balances, isLoading: isBalanceLoading } = useTokenBalances(
    tokens,
    selectedSucker.peerChainId
  );

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [memo, setMemo] = useState("");

  const defaultToken = {
    symbol: "TOKENS",
    decimals: 18,
  };

  const tokenB = tokenBContext.data || defaultToken;

  useEffect(() => {
    if (!selectedToken || !amountA) return;
    handlePayAmountChange(amountA);
  }, [selectedToken]);

  useEffect(() => {
    if (!isQuoteLoading && amountA && selectedToken) {
      handlePayAmountChange(amountA);
    }
  }, [isQuoteLoading]);

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

    if (version === 4 && ruleset && rulesetMetadata) {
      const quote = getTokenAToBQuote(
        new FixedInt(
          parseUnits(value || "0", baseToken.decimals),
          baseToken.decimals
        ),
        {
          weight: ruleset.weight,
          reservedPercent: rulesetMetadata.reservedPercent,
        }
      );
      setAmountB(formatUnits(quote.payerTokens, tokenB.decimals));
      return;
    } else {
      if (isQuoteLoading) return;
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

  const handleReceiveAmountChange = (value: string) => {
    //const value = e.target.value;
    setAmountB(value);
    if (!value || value === ".") {
      setAmountA("");
      return;
    }

    if (!ruleset || !rulesetMetadata) return;

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

  const handleChainChange = ({ chainId }: { chainId: JBChainId }) => {
    const newSelectedSucker = suckers?.find((s) => s.peerChainId === chainId);
    const newChainTokens = getTokensForChain(chainId, version);

    let token;
    if (selectedToken.isNative) {
      token = newChainTokens.find((t) => t.isNative);
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">YOU PAY</p>
            <PayInput
              value={amountA}
              onChangeFunction={handlePayAmountChange}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="bg-grey-450 flex w-fit items-center justify-end gap-2 rounded-full">
              <ChainSelector
                disabled={!suckers /* || suckers.length <= 1*/}
                value={selectedToken}
                handleChainChange={handleChainChange}
                handleTokenChange={handleTokenChange}
                options={tokens}
              />
            </div>

            <div className="text-muted-foreground text-right text-sm font-light text-nowrap select-none">
              {isBalanceLoading ? (
                <div className="flex items-center gap-1">
                  Balance:
                  <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
                </div>
              ) : (
                <p className="w-[130px]">
                  Balance:{" "}
                  {formatTokenAmount(
                    balances.get(selectedToken.address) ?? 0n,
                    selectedToken
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light select-none">
              YOU RECEIVE
            </p>
            <PayInput
              value={amountB}
              onChangeFunction={handleReceiveAmountChange}
              disabled={baseToken.isNative !== selectedToken.isNative}
            />
          </div>
          <div className="bg-grey-450 flex w-fit min-w-fit items-center gap-1 rounded-full px-1.5 py-1">
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

              <div className="border-grey-450 bg-grey-450 -mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] shadow-md">
                <ChainLogo
                  chainId={Number(selectedSucker.peerChainId) as JBChainId}
                  height={16}
                  width={16}
                />
              </div>
            </div>
            <p className="text-lg font-light">{tokenB.symbol || "TOKENS"}</p>
          </div>
        </div>
      </div>
      <input
        type="text"
        className="background-color placeholder:text-muted-foreground focus:ring-cerulean focus:ring-offset-grey-450 w-full rounded-lg border-none p-2 text-sm font-light outline-hidden transition-shadow focus:ring-2 focus:ring-offset-2"
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
        disabled={!amountA || parseFloat(amountA) === 0 || isQuoteLoading}
      />
    </div>
  );
}
