"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { JBChainId, useJBChainId, useJBContractContext } from "juice-sdk-react";
import { useChainId } from "wagmi";
import { WithdrawTab } from "./withdrawTab/WithdrawTab";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { useProjectContext } from "../../ProjectDataContext";
import { getTokensForChain, Token } from "@/lib/token";
import { ChainLogo } from "@/components/ChainLogo";
import { PayCardSkeleton } from "./PayCardSkeleton";
import { PayTab } from "./payTab/PayTab";

export function TransactionCard() {
  const { suckers, rulesetMetadata } = useProjectContext();
  const { selectedSucker, setSelectedSucker } = useSelectedSucker();
  const activeChain = useJBChainId();
  const chainId = useChainId();
  const { version } = useJBContractContext();

  const peerChainId = selectedSucker?.peerChainId;
  const tokens = useMemo(
    () => getTokensForChain(peerChainId, version),
    [peerChainId, version]
  );

  const [activeTab, setActiveTab] = useState<"buy" | "withdraw">("buy");
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);

  useEffect(() => {
    // Only set default if context has no value and suckers have loaded
    if (!selectedSucker && suckers.length > 0) {
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


  if (!suckers) {
    return <PayCardSkeleton selectedToken={selectedToken} />;
  }

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
          <PayTab tokens={tokens} selectedToken={selectedToken} setSelectedToken={setSelectedToken} />
        ) : (
          <WithdrawTab />
        )}
      </div>
    </div>
  );
}
