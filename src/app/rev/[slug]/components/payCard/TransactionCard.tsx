"use client";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useSuckers,
} from "juice-sdk-react";
import { useChainId } from "wagmi";
import { WithdrawTab } from "./withdrawTab/WithdrawTab";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { getTokensForChain, Token } from "@/lib/token";
import { ChainLogo } from "@/components/ChainLogo";
import { PayCardSkeleton } from "./PayCardSkeleton";
import { PayTab } from "./payTab/PayTab";
import { useRulesetData } from "@/hooks/useRulesetData";
import { formatSeconds } from "@/lib/utils";

export function TransactionCard() {
  const project = useRevnetDataStore((state) => state.project);
  const suckers = useRevnetDataStore((state) => state.suckers);

  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const setSelectedSucker = useRevnetDataStore(
    (state) => state.setSelectedSucker
  );

  const rulesetMetadata = useRevnetDataStore((state) => state.rulesetMetadata);
  const { allRulesets } = useRulesetData({
    projectId: project.projectId,
  });

  const activeChain = useJBChainId();
  const chainId = useChainId();
  const { version } = useJBContractContext();

  const now = new Date().getTime() / 1000;
  const startDate = allRulesets?.[0]?.start;
  const timeUntilStart = startDate ? startDate - now : 0;
  const hasStarted = timeUntilStart <= 0;

  const peerChainId = selectedSucker?.peerChainId;
  const tokens = useMemo(
    () => getTokensForChain(peerChainId, version),
    [peerChainId, version]
  );

  const [activeTab, setActiveTab] = useState<"buy" | "withdraw">("buy");
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0]);

  useEffect(() => {
    // Only set default if context has no value and suckers have loaded
    if (suckers && !selectedSucker && suckers.length > 0) {
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
    <div className="flex w-full flex-col rounded-xl">
      {!hasStarted && startDate && (
        <div className="flex rounded-t-xl bg-orange-900 px-4 pt-2 pb-6">
          <p className="text-sm font-light">
            Token Sale Starts in: {formatSeconds(timeUntilStart)}
          </p>
        </div>
      )}
      <div
        className={`bg-grey-450 flex flex-col rounded-xl p-[12px] ${!hasStarted && startDate && "-mt-4"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              onClick={() => setActiveTab("buy")}
              className={`h-[35px] rounded-none border-b-[1.5px] bg-transparent font-light hover:bg-transparent ${
                activeTab === "buy"
                  ? "border-cerulean text-white"
                  : "text-muted-foreground border-transparent"
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
                    : "text-muted-foreground border-transparent"
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
            <PayTab
              tokens={tokens}
              selectedToken={selectedToken}
              setSelectedToken={setSelectedToken}
            />
          ) : (
            <WithdrawTab />
          )}
        </div>
      </div>
    </div>
  );
}
