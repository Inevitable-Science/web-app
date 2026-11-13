"use client";
import { Button } from "@/components/ui/button";
import { JBChainId, useJBContractContext } from "@bananapus/nana-sdk-react";
import { WithdrawTab } from "./withdrawTab/WithdrawTab";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { ChainLogo } from "@/components/ChainLogo";
import { PayCardSkeleton } from "./PayCardSkeleton";
import { PayTab } from "./payV2/PayTab";
import { formatSeconds } from "@/lib/utils";
import { LoanTab } from "./loanTab/LoanTab";
import {
  selectHasStarted,
  selectTimeUntilStart,
  TransactionCardProvider,
  useTransactionCardStore,
} from "./TransactionCardStore";

export function TransactionCard() {
  return (
    <TransactionCardProvider>
      <TransactionCardContent />
    </TransactionCardProvider>
  );
}

function TransactionCardContent() {
  const suckers = useRevnetDataStore((state) => state.suckers);
  const rulesetMetadata = useRevnetDataStore((state) => state.rulesetMetadata);
  const { version } = useJBContractContext();

  const activeTab = useTransactionCardStore((state) => state.activeTab);
  const setActiveTab = useTransactionCardStore((state) => state.setActiveTab);
  const tokens = useTransactionCardStore((state) => state.tokens);
  const selectedToken = useTransactionCardStore((state) => state.selectedToken);
  const startDate = useTransactionCardStore((state) => state.startDate);
  const timeUntilStart = useTransactionCardStore(selectTimeUntilStart);
  const hasStarted = useTransactionCardStore(selectHasStarted);

  // Logic to show payment notices
  const showDepreciationNotice = version === 4 || version === 5;
  const showHasNotStartedBanner = !hasStarted && startDate;
  const paymentsPaused = rulesetMetadata?.pausePay && !showHasNotStartedBanner;
  
  if (!suckers || !selectedToken) {
    return <PayCardSkeleton selectedToken={selectedToken ?? tokens[0]} />;
  }

  return (
    <div className="flex w-full flex-col rounded-xl">
      {(showHasNotStartedBanner || paymentsPaused) && showDepreciationNotice ? (
        <>
          <div className="bg-cerulean flex rounded-t-xl px-4 py-2">
            <p className="text-sm font-light">
              Revnets v{version} is depreciated
            </p>
          </div>
          <div className="bg-cerulean w-full">
            <div className="flex rounded-t-xl bg-orange-900 px-4 pt-2 pb-6">
              <p className="text-sm font-light">
                {
                showHasNotStartedBanner 
                  ? `Token Sale Starts in: ${formatSeconds(timeUntilStart)}`
                  : paymentsPaused
                  && "Payments are currently paused"
                }
              </p>
            </div> 
          </div>
        </>
      ) : (showHasNotStartedBanner || paymentsPaused || showDepreciationNotice) && (
        <div
          className={`flex rounded-t-xl px-4 pt-2 pb-6 
          ${showDepreciationNotice
            ? "bg-cerulean" 
            : "bg-orange-900"
          }`}
        >
          <p className="text-sm font-light">
            {showHasNotStartedBanner 
              ? `Token Sale Starts in: ${formatSeconds(timeUntilStart)}`
              : paymentsPaused
              ? "Payments are currently paused"
              : showDepreciationNotice
              && `Revnets v${version} is depreciated`
            }
          </p>
        </div>
      )}
      
      <div
        className={`bg-grey-450 flex flex-col rounded-xl p-[12px] ${(showHasNotStartedBanner || showDepreciationNotice || paymentsPaused) && "-mt-4"}`}
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
            {/** I am assuming that useDataHookForCashOut was replaced with useDataHookForCashOut v6 INTEGRATION */}
            {rulesetMetadata?.useDataHookForCashOut  && hasStarted && (
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
            {hasStarted && version === 6 && (
              <Button
                onClick={() => setActiveTab("loan")}
                className={`h-[35px] rounded-none border-b-[1.5px] bg-transparent font-light hover:bg-transparent ${
                  activeTab === "loan"
                    ? "border-cerulean text-white"
                    : "text-muted-foreground border-transparent"
                }`}
              >
                Loan
              </Button>
            )}
          </div>
          <div className="chainIndicator background-color flex rounded-full p-1 pr-2">
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
          {activeTab === "buy" && <PayTab />}

          {activeTab === "withdraw" && <WithdrawTab />}

          {activeTab === "loan" && <LoanTab />}
        </div>
      </div>

      <style>{`
      @media (max-width:400px) {
        .chainIndicator {
          display: none;
        }
      }
      `}</style>
    </div>
  );
}
