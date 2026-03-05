import { useEffect, useState, useMemo } from "react";
import {
  getTokenAToBQuote,
  getTokenBtoAQuote,
  JB_TOKEN_DECIMALS,
  USDC_ADDRESSES,
} from "juice-sdk-core";
import {
  JBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "juice-sdk-react";
import Image from "next/image";
import { Address, formatUnits, parseUnits } from "viem";
import { FixedInt } from "fpnum";

import { PayActionButton } from "./PayActionButtonIvx";
import { PayCardSkeleton } from "./PayCardSkeleton";

import { formatNumber, truncateNumber } from "@/lib/utils";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs/ipfs";
import { formatTokenAmount, getTokensForChain, Token } from "@/lib/token";
import { usePaymentQuote } from "@/hooks/PaymentTerminal/usePaymentQuote";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { PayInput } from "@/components/PayInput";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { TokenAndChainSelector } from "@/components/TokenChainSelector";

export function TransactionCard() {
  const suckers = useRevnetDataStore((state) => state.suckers);
  const ruleset = useRevnetDataStore((state) => state.ruleset);
  const rulesetMetadata = useRevnetDataStore((state) => state.rulesetMetadata);

  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const setSelectedSucker = useRevnetDataStore(
    (state) => state.setSelectedSucker
  );

  const tokenA = useProjectBaseToken();
  const { version } = useJBContractContext();
  const { metadata } = useJBProjectMetadataContext();
  const { token: tokenBContext } = useJBTokenContext();

  const { tokenAToBQuote, isLoading: isQuoteLoading } = usePaymentQuote(
    selectedSucker.peerChainId
  );
  const tokens = useMemo(
    () => getTokensForChain(selectedSucker?.peerChainId, version),
    [selectedSucker?.peerChainId]
  );
  const { balances } = useTokenBalances(tokens, selectedSucker.peerChainId);

  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);

  const tokenB = tokenBContext.data;
  const projectTokenDecimals = tokenB?.decimals ?? JB_TOKEN_DECIMALS;

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

    if (!ruleset || !rulesetMetadata) return;

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
      setAmountB(formatUnits(quote.payerTokens, projectTokenDecimals));
      return;
    } else {
      if (isQuoteLoading) return;
      const { payerTokens, reservedTokens } = tokenAToBQuote(
        value,
        selectedToken
      );
      const numberPayerTokens = Number(payerTokens);
      setAmountB(truncateNumber(numberPayerTokens));
      return;
    }
  };

  const handleReceiveAmountChange = (value: string) => {
    setAmountB(value);
    if (!value || value === ".") {
      setAmountA("");
      return;
    }

    if (!ruleset || !rulesetMetadata) return;

    const quote = getTokenBtoAQuote(
      new FixedInt(
        parseUnits(value, projectTokenDecimals),
        projectTokenDecimals
      ),
      projectTokenDecimals,
      {
        weight: ruleset.weight,
        reservedPercent: rulesetMetadata.reservedPercent,
      }
    );

    const numberPayerTokens = Number(formatUnits(quote.value, quote.decimals));
    if (numberPayerTokens < 0.000001) {
      setAmountA("0");
      return;
    }

    const formattedAmountA = formatNumber(numberPayerTokens, false);
    setAmountA(formattedAmountA);
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

  const preparedAmountA = parseUnits(amountA || "0", selectedToken.decimals);
  const preparedAmountB = parseUnits(amountB || "0", projectTokenDecimals);

  if (!balances || !suckers) {
    return <PayCardSkeleton selectedToken={selectedToken} />;
  }

  return (
    <div className="bg-grey-450 flex flex-col rounded-xl p-[10px]">
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
            <TokenAndChainSelector
              currentToken={selectedToken}
              tokenOptions={tokens}
              selectedSucker={selectedSucker}
              suckers={suckers}
              handleChainChange={handleChainChange}
              handleTokenChange={handleTokenChange}
              disabled={!suckers || suckers.length <= 1}
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
            <PayInput
              value={amountB}
              onChangeFunction={handleReceiveAmountChange}
              disabled={tokenA.isNative !== selectedToken.isNative}
            />
          </div>
          <div className="bg-grey-450 flex max-w-fit min-w-fit flex-row flex-nowrap items-center gap-1 rounded-full py-1 pr-3 pl-1.5">
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
            <p className="text-lg font-light">{tokenB?.symbol}</p>
          </div>
        </div>
        <PayActionButton
          amountA={preparedAmountA}
          amountB={preparedAmountB}
          paymentToken={selectedToken}
          walletBalance={balances}
          disabled={!amountA || parseFloat(amountA) === 0 || isQuoteLoading}
        />
      </div>
    </div>
  );
}
