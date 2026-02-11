import { useState } from "react";
import Image from "next/image";
import {
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { formatNumber, truncateNumber } from "@/lib/utils";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { ChainLogo } from "@/components/ChainLogo";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { Button } from "@/components/ui/button";
import { PayInput } from "@/components/PayInput";
import { LoanChainSelector } from "./LoanChainSelector";
import { useReadContract } from "wagmi";
import {
  JB_TOKEN_DECIMALS,
  revLoansAbi,
} from "juice-sdk-core";
import { formatUnits, parseUnits } from "viem";
import { LoanActionButton } from "./LoanActionButton";
import { useLoanFeeData } from "@/hooks/useLoanFeeData";
import { useDebounce } from "use-debounce";

export function LoanTab() {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const { peerChainId: activeChainId, projectId: activeProjectId } = selectedSucker;
  
  const [collateralAmount, setCollateralAmount] = useState("");
  const [debounceCollateralAmount] = useDebounce(collateralAmount, 600);

  const { revLoansContractAddress } = useLoanFeeData(activeChainId);
  const { token } = useJBTokenContext();
  const baseToken = useProjectBaseToken();
  const balanceQuery = useSuckersUserTokenBalance();

  // Token Balances
  const currentChainBalanceObj = balanceQuery?.data?.find((tkn) => tkn.chainId === selectedSucker.peerChainId)?.balance;
  const currentChainBalBigInt = currentChainBalanceObj?.value ?? 0n;
  const currentChainBalNum = currentChainBalanceObj?.format();
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  const collateralAmountBigIntDB = parseUnits(debounceCollateralAmount, projectTokenDecimals);
  const isDebouncing = debounceCollateralAmount !== collateralAmount;

  const {
    data: estimatedBorrowFromInputOnly,
    isLoading: estimatedBorrowIsLoading,
  } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: revLoansContractAddress,
    chainId: activeChainId,
    args:
      collateralAmountBigIntDB && baseToken
        ? [
            BigInt(activeProjectId),
            collateralAmountBigIntDB,
            BigInt(baseToken.decimals),
            BigInt(baseToken.currency),
          ]
        : undefined,
  });

  const estimatedBorrowString = estimatedBorrowFromInputOnly ?
    truncateNumber(
      formatUnits(
        estimatedBorrowFromInputOnly ?? 0n,
        baseToken.decimals
      )
    ) : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {/* COLLATERAL INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">
              COLLATERAL
            </p>
            <PayInput
              value={collateralAmount}
              onChangeFunction={(value) => {
                if (value.startsWith("-")) {
                  setCollateralAmount("0");
                  return;
                }

                setCollateralAmount(value);
                return;
              }}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <LoanChainSelector suckersBalance={balanceQuery.data} />
            <div className="flex items-center justify-end gap-1 text-muted-foreground w-[130px] text-right text-sm font-light text-nowrap select-none">
              Balance:{" "}
              {balanceQuery.isLoading ? 
                <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
              : currentChainBalNum && Number(currentChainBalNum) > 0.00001 ?
                  truncateNumber(currentChainBalNum ?? "0", true) :
                  "0.00"
              }
            </div>
          </div>
        </div>

        {/* RECEIVE INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light select-none">
              PRE FEE AMOUNT
            </p>
            {(isDebouncing || estimatedBorrowIsLoading) && Number(collateralAmount) ? ( // Prevents skeleton when collateralAmount is falsy (0)
              <div className="activeSkeleton mt-[2px] h-[30px] w-[130px] rounded-lg opacity-30" />
            ) : (
              <PayInput
                value={collateralAmount ? estimatedBorrowString : ""} // shows 0.00 placeholder when no collateralAmount
                disabled
              />
            )}
          </div>
          <div className="bg-grey-450 flex w-fit min-w-fit items-center justify-end gap-1 rounded-full pl-1.5 pr-2 py-1">
            <div className="flex items-end">
              {baseToken.isNative ? (
                <ChainLogo chainId={1} height={24} width={24} />
              ) : (
                <Image
                  className="min-h-[24px] min-w-[24px] rounded-full"
                  src={
                    "https://cdn.inevitable.science/static/img/logo/usdc.svg"
                  }
                  alt={`USDC Token Logo`}
                  width={24}
                  height={24}
                  style={{
                    minWidth: 24,
                    minHeight: 24,
                    flexShrink: 0,
                  }}
                />
              )}

              <div className="border-grey-450 bg-grey-450 -mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] shadow-md">
                <ChainLogo
                  chainId={selectedSucker.peerChainId}
                  height={16}
                  width={16}
                />
              </div>
            </div>
            <p className="text-lg font-light">{baseToken.symbol}</p>
          </div>
        </div>
      </div>

      <div className="background-color hidden grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 rounded-xl p-1 sm:grid [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg">
        {[10, 25, 50, 100].map(percent => 
          <Button
            key={percent}
            className="h-[28px] rounded-xs"
            onClick={() => {
              const collateralAmt = (currentChainBalBigInt * BigInt(percent)) / 100n;
              const formattedCollateralAmt = truncateNumber(formatUnits(collateralAmt, projectTokenDecimals));
              setCollateralAmount(formattedCollateralAmt);
            }}
          >
            {percent === 100 ? "MAX": `${percent}%`}
          </Button>
        )}
      </div>

      <LoanActionButton
        loanAmount={estimatedBorrowFromInputOnly}
        collateralAmount={collateralAmount}
        projectTokenBalance={currentChainBalBigInt}
      />
    </div>
  );
}
