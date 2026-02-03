import { useEffect, useState } from "react";
import Image from "next/image";
import {
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { formatNumber } from "@/lib/utils";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { ChainLogo } from "@/components/ChainLogo";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { Button } from "@/components/ui/button";
import { PayInput } from "@/components/PayInput";
import { LoanChainSelector } from "./LoanChainSelector";
import { useReadContract } from "wagmi";
import {
  getRevnetLoanContract,
  JB_TOKEN_DECIMALS,
  revLoansAbi,
} from "juice-sdk-core";
import { formatUnits, parseUnits } from "viem";
import { LoanActionButton } from "./LoanActionButton";

export function LoanTab() {
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);

  const { token } = useJBTokenContext();
  const { version } = useJBContractContext();
  const baseToken = useProjectBaseToken();
  const balanceQuery = useSuckersUserTokenBalance();

  const [collateralAmount, setCollateralAmount] = useState("");
  const [borrowEstimate, setBorrowEstimate] = useState("");

  // Token Balances
  const currentChainBalanceObj = balanceQuery?.data?.find(
    (tkn) => tkn.chainId === selectedSucker.peerChainId
  )?.balance;
  const currentChainBalNum = Number(currentChainBalanceObj?.format()) || 0;

  // Sucker Derived Values
  const cashOutChainId = selectedSucker.peerChainId;
  const effectiveProjectId = selectedSucker.projectId;
  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  const revLoansContractAddress = getRevnetLoanContract(
    version,
    cashOutChainId
  );

  const {
    data: estimatedBorrowFromInputOnly,
    isLoading: estimatedBorrowIsLoading,
  } = useReadContract({
    abi: revLoansAbi,
    functionName: "borrowableAmountFrom",
    address: revLoansContractAddress,
    chainId: cashOutChainId,
    args:
      collateralAmount && baseToken
        ? [
            BigInt(effectiveProjectId),
            parseUnits(collateralAmount, projectTokenDecimals),
            BigInt(baseToken.decimals),
            BigInt(baseToken.currency),
          ]
        : undefined,
  });

  useEffect(() => {
    if (estimatedBorrowFromInputOnly) {
      const formatted = Number(
        formatUnits(estimatedBorrowFromInputOnly ?? 0n, baseToken.decimals)
      );

      setBorrowEstimate(formatNumber(formatted, false));
    } else {
      setBorrowEstimate("");
    }
  }, [estimatedBorrowFromInputOnly]);

  const setManualCollateralAmount = (percentage: number) => {
    if (percentage === 100) {
      // no rounding for MAX - rounding is an issue for balances like 0.9999
      const s = currentChainBalNum.toString();
      if (!s.includes(".")) return s;
      const [int, frac] = s.split(".");
      const val =
        int === "0" ? `0.${frac.slice(0, 3)}` : `${int}.${frac.slice(0, 3)}`;

      setCollateralAmount(val);
      return;
    }

    if (percentage < 0 || percentage > 99) return;
    const loanCollateral = (currentChainBalNum / 100) * percentage;
    const loanCollateralString = formatNumber(loanCollateral, false);

    setCollateralAmount(loanCollateralString);
    return;
  };

  // This prevents scrolling to reduce the value below 0
  const handleCollateralAmountChange = (value: string) => {
    if (value.startsWith("-")) {
      setCollateralAmount("0");
      return;
    }

    setCollateralAmount(value);
    return;
  };

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
              onChangeFunction={handleCollateralAmountChange}
            />
          </div>
          <div className="flex flex-col items-end gap-[2px]">
            <LoanChainSelector suckersBalance={balanceQuery.data} />
            <p className="text-muted-foreground w-[130px] text-right text-sm font-light text-nowrap select-none">
              Balance:{" "}
              {!currentChainBalNum
                ? "0.00"
                : currentChainBalNum < 100
                  ? currentChainBalNum.toFixed(4)
                  : formatNumber(currentChainBalNum)}
            </p>
          </div>
        </div>

        {/* RECEIVE INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light select-none">
              PRE FEE AMOUNT
            </p>
            {estimatedBorrowIsLoading && collateralAmount ? (
              <div className="activeSkeleton mt-[2px] h-[30px] w-[130px] rounded-lg opacity-30" />
            ) : (
              <PayInput value={borrowEstimate} disabled />
            )}
          </div>
          <div className="bg-grey-450 flex w-fit min-w-fit items-center justify-end gap-1 rounded-full px-1.5 py-1">
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

      <div className="background-color hidden grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 rounded-xl p-1 sm:grid">
        <Button
          className="h-[28px] rounded-l-lg rounded-r-xs"
          onClick={() => {
            setManualCollateralAmount(10);
          }}
        >
          10%
        </Button>
        <Button
          className="h-[28px] rounded-xs"
          onClick={() => {
            setManualCollateralAmount(25);
          }}
        >
          25%
        </Button>
        <Button
          className="h-[28px] rounded-xs"
          onClick={() => {
            setManualCollateralAmount(50);
          }}
        >
          50%
        </Button>
        <Button
          className="h-[28px] rounded-l-xs rounded-r-lg"
          onClick={() => {
            setManualCollateralAmount(100);
          }}
        >
          MAX
        </Button>
      </div>

      <LoanActionButton
        loanAmount={estimatedBorrowFromInputOnly}
        collateralAmount={collateralAmount}
        projectTokenBalance={currentChainBalanceObj?._value ?? 0n}
        revLoansContractAddress={revLoansContractAddress}
      />
    </div>
  );
}
