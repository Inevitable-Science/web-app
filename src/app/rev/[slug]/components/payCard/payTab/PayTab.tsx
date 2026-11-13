"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  JBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "@bananapus/nana-sdk-react";
import { FixedInt } from "fpnum";
import { Address, formatUnits, parseUnits, zeroAddress } from "viem";
import {
  getJBContractAddress,
  getTokenAToBQuote,
  getTokenBtoAQuote,
  JB_TOKEN_DECIMALS,
  JBCoreContracts,
  jbDirectoryAbi,
  jbMultiTerminalAbi,
  JBRouterTerminalContracts,
  jbRouterTerminalRegistryAbi,
  NATIVE_TOKEN,
  USDC_ADDRESSES,
} from "@bananapus/nana-sdk-core";
import { formatNumber, truncateNumber } from "@/lib/utils";
import { PayActionButton } from "./PayActionButton";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs/ipfs";
import { usePaymentQuote } from "@/hooks/PaymentTerminal/usePaymentQuote";
import { getTokensForChain, Token } from "@/lib/token";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { useRulesetData } from "@/hooks/useRulesetData";
import { TokenAndChainSelector } from "@/components/TokenChainSelector";
import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";
import { useAccount, usePublicClient, useReadContract } from "wagmi";

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
  const { 
    peerChainId: selectedChainId, 
    projectId: chainProjectId
  } = useRevnetDataStore((state) => state.selectedSucker);
  const setSelectedSucker = useRevnetDataStore(
    (state) => state.setSelectedSucker
  );
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [memo, setMemo] = useState("");

  const { metadata } = useJBProjectMetadataContext();
  const { version } = useJBContractContext();
  const { token } = useJBTokenContext();
  const { data: accountingContext } = useProjectAccountingContext();

  const { address: userAddress } = useAccount();

  const contract = (accountingContext?.project?.token === NATIVE_TOKEN.toLowerCase()) === (selectedToken.isNative)
  ? {
    type: "multiTerminal",
    address: getJBContractAddress(JBCoreContracts.JBMultiTerminal, version, selectedChainId),
    abi: jbMultiTerminalAbi
  } : {
    type: "routerTerminal",
    address: getJBContractAddress(JBRouterTerminalContracts.JBRouterTerminalRegistry, version, selectedChainId),
    abi: jbRouterTerminalRegistryAbi
  };

  // this returns the multiTerminal if the inputted address has a multiTerminal, otherwise it outputs a routerTerminal
  // although routerTerminal is fixed, new routers can be deployed
  /*const routerTerminalAddress = useReadContract({
    address: getJBContractAddress(JBCoreContracts.JBDirectory, 6, selectedChainId),
    abi: jbDirectoryAbi,
    chainId: selectedChainId, // required
    functionName: 'primaryTerminalOf',
    //args: [chainProjectId, NATIVE_TOKEN], // change this to the token that uses jbRouterTerminal
    args: [chainProjectId, USDC_ADDRESSES[selectedChainId]]
  });*/

  const { data, isLoading } = useReadContract({
    address: getJBContractAddress(JBRouterTerminalContracts.JBRouterTerminalRegistry, version, selectedChainId),
    abi: jbRouterTerminalRegistryAbi,
    chainId: selectedChainId,
    functionName: 'previewPayFor',
    args: [
      chainProjectId,
      selectedToken.address,
      parseUnits(amountA || "0", selectedToken.decimals),
      zeroAddress, // review this fallback idk why you need an address for a pay preview
      "0x0"
    ],
    query: {
      enabled: contract.type === "routerTerminal",
    }
  });
  console.log(data, isLoading, "previewPayFor", contract.type);
  
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  const baseToken = useProjectBaseToken();
  const { balances, isLoading: isBalanceLoading } = useTokenBalances(
    tokens,
    selectedChainId
  );
  const currentTokenBalNum = Number(
    formatUnits(
      balances.get(selectedToken.address) ?? 0n,
      selectedToken.decimals
    )
  );

  const { tokenAToBQuote, isLoading: isQuoteLoading } = usePaymentQuote(
    selectedChainId
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
    if (value.startsWith("-")) {
      setAmountA("0");
      return;
    }
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
    } else if (version === 6 && contract.type === "routerTerminal") {

    } else {
      if (isQuoteLoading) return;
      const { payerTokens, reservedTokens } = tokenAToBQuote(
        value,
        selectedToken
      );

      setAmountB(truncateNumber(payerTokens));
      return;
    }
  };

  const handleReceiveAmountChange = (value: string) => {
    if (value.startsWith("-")) {
      setAmountA("0");
      return;
    }

    setAmountB(value);

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

    // Round this value as clipped exact values create a invalid minReturnAmount
    const numberPayerTokens = Number(formatUnits(quote.value, quote.decimals));
    if (numberPayerTokens < 0.000001) {
      setAmountA("0");
      return;
    }
    setAmountA(formatNumber(numberPayerTokens, false));
    return;
  };

  const handleChainChange = ({ chainId }: { chainId: JBChainId }) => {
    const newSelectedSucker = suckers?.find((s) => s.peerChainId === chainId);
    const newChainTokens = getTokensForChain(chainId, version);

    const token = selectedToken.isNative
      ? newChainTokens.find((t) => t.isNative)
      : newChainTokens.find(
          (t) =>
            t.address.toLowerCase() === USDC_ADDRESSES[chainId].toLowerCase()
        );

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
                selectedChainId={selectedChainId}
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
                  {currentTokenBalNum > 0.00001
                    ? truncateNumber(currentTokenBalNum, true)
                    : "0.00"}
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
                contract.type === "routerTerminal" || !hasStarted
              }
            />
          </div>
          <div className="bg-grey-450 flex w-fit min-w-fit items-center gap-1 rounded-full py-1 pr-2 pl-1.5">
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
                  chainId={Number(selectedChainId) as JBChainId}
                  height={16}
                  width={16}
                />
              </div>
            </div>
            <p className="text-lg font-light">
              {token.data?.symbol ?? "TOKENS"}
            </p>
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
