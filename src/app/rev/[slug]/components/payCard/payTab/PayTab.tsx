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
  JB_TOKEN_DECIMALS,
  USDC_ADDRESSES,
} from "juice-sdk-core";
import { formatNumber, truncateNumber } from "@/lib/utils";
import { PayActionButton } from "./PayActionButton";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs";
import { usePaymentQuote } from "@/hooks/PaymentTerminal/usePaymentQuote";
import { formatTokenAmount, getTokensForChain, Token } from "@/lib/token";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useRulesetData } from "@/hooks/useRulesetData";
import { TokenAndChainSelector } from "@/components/TokenChainSelector";

export function PayTab({
  tokens,
  selectedToken,
  setSelectedToken,
}: {
  tokens: Token[];
  selectedToken: Token;
  setSelectedToken: React.Dispatch<React.SetStateAction<Token>>;
}) {
  const project = useRevnetDataStore((state) => state.project);
  const rulesetMetadata = useRevnetDataStore((state) => state.rulesetMetadata);
  const ruleset = useRevnetDataStore((state) => state.ruleset);
  const suckers = useRevnetDataStore((state) => state.suckers);
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const setSelectedSucker = useRevnetDataStore(
    (state) => state.setSelectedSucker
  );

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [memo, setMemo] = useState("");

  const { metadata } = useJBProjectMetadataContext();
  const { version } = useJBContractContext();
  const { token } = useJBTokenContext();
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  const baseToken = useProjectBaseToken();
  const { balances, isLoading: isBalanceLoading } = useTokenBalances(
    tokens,
    selectedSucker.peerChainId
  );
  const currentTokenBalNum = Number(
    formatUnits(
      balances.get(selectedToken.address) ?? 0n,
      selectedToken.decimals
    ));

  const { tokenAToBQuote, isLoading: isQuoteLoading } = usePaymentQuote(
    selectedSucker.peerChainId
  );
  const { allRulesets } = useRulesetData({
    projectId: project.projectId,
  });


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
    setAmountA(value);

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
      setAmountB(formatUnits(quote.payerTokens, projectTokenDecimals));
      return;
    } else {
      if (isQuoteLoading) return;
      const { payerTokens, reservedTokens } = tokenAToBQuote(
        value,
        selectedToken
      );

      const numberPayerTokens = Number(payerTokens);
      const formattedAmountB = formatNumber(numberPayerTokens, false);
      setAmountB(formattedAmountB);
      return;
    }
  };

  const handleReceiveAmountChange = (value: string) => {
    setAmountB(value);

    if (!ruleset || !rulesetMetadata) return;

    const quote = getTokenBtoAQuote(
      new FixedInt(parseUnits(value, projectTokenDecimals), projectTokenDecimals),
      projectTokenDecimals,
      {
        weight: ruleset.weight,
        reservedPercent: rulesetMetadata.reservedPercent,
      }
    );

    const numberPayerTokens = Number(quote.format());
    const formattedAmountA = formatNumber(numberPayerTokens, false);
    setAmountA(formattedAmountA);
    return;
  };

  const handleChainChange = ({ chainId }: { chainId: JBChainId }) => {
    const newSelectedSucker = suckers?.find((s) => s.peerChainId === chainId);
    const newChainTokens = getTokensForChain(chainId, version);

    const token = selectedToken.isNative ?
      newChainTokens.find((t) => t.isNative) :
      newChainTokens.find((t) => t.address.toLowerCase() === USDC_ADDRESSES[chainId].toLowerCase())

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

  const preparedAmountA = parseUnits(amountA || "0", selectedToken.decimals);
  const preparedAmountB = parseUnits(amountB || "0", projectTokenDecimals);

  // Constants used to check if a project is accepting payments
  const now = new Date().getTime() / 1000;
  const startDate = allRulesets?.[0]?.start;
  const timeUntilStart = startDate ? startDate - now : 0;
  const hasStarted = timeUntilStart <= 0;


  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="background-color grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">YOU PAY</p>
            <PayInput
              value={amountA}
              onChangeFunction={handlePayAmountChange}
              disabled={!hasStarted}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="bg-grey-450 flex w-fit items-center justify-end gap-2 rounded-full">
              <TokenAndChainSelector
                currentToken={selectedToken}
                tokenOptions={tokens}
                selectedSucker={selectedSucker}
                suckers={suckers}
                handleChainChange={handleChainChange}
                handleTokenChange={handleTokenChange}
                disabled={!suckers}
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
                  {truncateNumber(currentTokenBalNum, true)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="background-color grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light select-none">
              YOU RECEIVE
            </p>
            <PayInput
              value={amountB}
              onChangeFunction={handleReceiveAmountChange}
              disabled={
                baseToken.isNative !== selectedToken.isNative || !hasStarted
              }
            />
          </div>
          <div className="bg-grey-450 flex w-fit min-w-fit items-center gap-1 rounded-full pl-1.5 pr-2 py-1">
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
            <p className="text-lg font-light">{token.data?.symbol ?? "TOKENS"}</p>
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
        hasStarted={hasStarted}
        disabled={!amountA || parseFloat(amountA) === 0 || isQuoteLoading}
      />
    </div>
  );
}
