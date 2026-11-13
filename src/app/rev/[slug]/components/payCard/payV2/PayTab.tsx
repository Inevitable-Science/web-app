"use client";
import { useEffect } from "react";
import Image from "next/image";
import {
  JBChainId,
  useJBContractContext,
  useJBProjectMetadataContext,
  useJBTokenContext,
} from "@bananapus/nana-sdk-react";
import { Address, formatUnits, parseUnits, zeroAddress } from "viem";
import {
  getJBContractAddress,
  JB_TOKEN_DECIMALS,
  JBCoreContracts,
  jbMultiTerminalAbi,
  JBRouterTerminalContracts,
  jbRouterTerminalRegistryAbi,
  NATIVE_TOKEN,
} from "@bananapus/nana-sdk-core";
import { truncateNumber } from "@/lib/utils";
import { PayActionButton } from "./PayActionButton";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { ipfsUriToGatewayUrl } from "@/lib/ipfs/ipfs";
import {
  selectHasStarted,
  useTransactionCardStore,
} from "../TransactionCardStore";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { ChainLogo } from "@/components/ChainLogo";
import { PayInput } from "@/components/PayInput";
import { TokenAndChainSelector } from "@/components/TokenChainSelector";
import { useProjectAccountingContext } from "@/hooks/useProjectAccountingContext";
import { useReadContract } from "wagmi";
import { useDebounce } from "use-debounce";

export function PayTab() {
  const suckers = useRevnetDataStore((state) => state.suckers);
  const { 
    peerChainId: selectedChainId, 
    projectId: chainProjectId
  } = useRevnetDataStore((state) => state.selectedSucker);
  const setSelectedSucker = useRevnetDataStore(
    (state) => state.setSelectedSucker
  );

  const tokens = useTransactionCardStore((state) => state.tokens);
  const selectedToken = useTransactionCardStore((state) => state.selectedToken)!;
  const setSelectedToken = useTransactionCardStore(
    (state) => state.setSelectedToken
  );
  const syncTokensForChain = useTransactionCardStore(
    (state) => state.syncTokensForChain
  );
  const payAmount = useTransactionCardStore((state) => state.payAmount);
  const setPayAmount = useTransactionCardStore((state) => state.setPayAmount);
  const setReceiveAmountBigInt = useTransactionCardStore((state) => state.setReceiveAmountBigInt);
  const memo = useTransactionCardStore((state) => state.memo);
  const setMemo = useTransactionCardStore((state) => state.setMemo);
  const hasStarted = useTransactionCardStore(selectHasStarted);

  const { metadata } = useJBProjectMetadataContext();
  const { version } = useJBContractContext();
  const { token } = useJBTokenContext();
  const { data: accountingContext } = useProjectAccountingContext();


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

  const [debouncePayAmount] = useDebounce(payAmount, 600);
  const isPayAmountDebouncing = payAmount !== debouncePayAmount;
  const payAmountBigIntDB = parseUnits(debouncePayAmount, selectedToken.decimals)

  const minPaymentAmount = selectedToken.isNative
    ? parseUnits("0.000001", selectedToken.decimals)
    : parseUnits("0.0001", selectedToken.decimals);
  const lessThanMinPayment = payAmountBigIntDB < minPaymentAmount;

  const { 
    data: payPreviewData,
    isLoading: isPayPreviewLoading
  } = useReadContract({
    address: contract.address,
    abi: contract.abi,
    chainId: selectedChainId,
    functionName: 'previewPayFor',
    args: [
      chainProjectId,
      selectedToken.address,
      payAmountBigIntDB,
      zeroAddress, // review this fallback idk why you need an address for a pay preview
      "0x0"
    ],
    query: {
      enabled: !!payAmount && !lessThanMinPayment,
      refetchInterval: 40_000, // refetch every 40 seconds
    }
  });

  const receiveAmountBigInt = payPreviewData?.[1] ?? 0n;
  useEffect(() => {
    if (receiveAmountBigInt) {
      setReceiveAmountBigInt(receiveAmountBigInt)
    } else {
      setReceiveAmountBigInt(0n);
    }
  }, [receiveAmountBigInt]);

  const receiveAmount = formatUnits(receiveAmountBigInt, JB_TOKEN_DECIMALS);
  const receiveAmountString = truncateNumber(receiveAmount);
  
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

  useEffect(() => {
    if (!selectedToken || !payAmount) return;
    handlePayAmountChange(payAmount);
  }, [selectedToken]);

  /*const { tokenAToBQuote, isLoading: isQuoteLoading } = usePaymentQuote(
    selectedChainId
  );
  
  useEffect(() => {
    if (!isQuoteLoading && payAmount && selectedToken) {
      handlePayAmountChange(payAmount);
    }
  }, [isQuoteLoading]);*/

  const handlePayAmountChange = (value: string) => {
    if (value.startsWith("-")) {
      setPayAmount("0");
      return;
    }
    setPayAmount(value);

    /*if (version === 6) return;

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
      setReceiveAmount(formatUnits(quote.payerTokens, projectTokenDecimals));
      return;
    } else {
      if (isQuoteLoading) return;
      const { payerTokens, reservedTokens } = tokenAToBQuote(
        value,
        selectedToken
      );

      setReceiveAmount(truncateNumber(payerTokens));
      return;
    }*/
  };

  
  const handleChainChange = ({ chainId }: { chainId: JBChainId }) => {
    const newSelectedSucker = suckers?.find((s) => s.peerChainId === chainId);
    if (!newSelectedSucker) return;

    // Sync tokens immediately so the chain + token never render mismatched;
    // the provider also re-syncs whenever selectedSucker changes.
    syncTokensForChain(chainId, version);
    setSelectedSucker(newSelectedSucker);
  };

  const handleTokenChange = ({ address }: { address: Address }) => {
    const token = tokens.find((t) => t.address === address);
    if (token) {
      setSelectedToken(token);
    }

    return;
  };


  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="background-color grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">YOU PAY</p>
            <PayInput
              value={payAmount}
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
            {(
              isPayPreviewLoading 
              || isPayAmountDebouncing
            ) && Number(payAmount) // Prevents skeleton when withdrawAmount is falsy (0)
              ? ( 
              <div className="activeSkeleton mt-[2px] h-[30px] w-[130px] rounded-lg opacity-30" />
            ) : (
              // force the placeholder "0.00" when no withdraw amount is inputted
              <PayInput
                value={payAmount ? receiveAmountString : ""}
                disabled
              />
            )}
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
        walletBalance={balances}
        disabled={
          !payAmount
          || parseFloat(payAmount) === 0
          || isPayPreviewLoading
          || isPayAmountDebouncing
        }
      />
    </div>
  );
}
