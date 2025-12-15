import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  useBendystrawQuery,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { formatNumber } from "@/lib/utils";
import { WithdrawActionButton } from "./WithdrawActionButton";
import { useProjectContext } from "../../ProjectDataContext";
import { useSelectedSucker } from "./SelectedSuckerContext";
import { WithdrawSelector } from "./WithdrawSelector";
import { ChainLogo } from "@/components/ChainLogo";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { SuckerGroupDocument } from "@/generated/graphql";
import { getProjectsReclaimableSurplus, getUnitValue } from "@/lib/reclaimableSurplus";
import { Button } from "@/components/ui/button";

export interface Surplus {
  projectId: number;
  value: string;
  currencyId: number;
  decimals: number;
  chainId: number;
  version: number;
  tokenDecimals: 18;
}

export function WithdrawCard() {
  const { project, token } = useProjectContext();
  const { selectedSucker } = useSelectedSucker();

  const receiveToken = useProjectBaseToken();
  const receiveTokenAddress = receiveToken.tokenMap[selectedSucker.peerChainId].token;

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [surpluses, setSurpluses] = useState<Surplus[] | null>(null);

  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: project.suckerGroupId ?? "" },
    { enabled: !!project.suckerGroupId },
  );

  useEffect(() => {
    const fetchSurpluses = async () => {
      const surpluses = await getProjectsReclaimableSurplus(suckerGroupData?.suckerGroup?.projects?.items || []);
      setSurpluses(surpluses);
    };

    fetchSurpluses();
  }, []);

  const projectTokenDecimals = token.data?.decimals;
  const cashOutChainId = selectedSucker.peerChainId;
  const projects = suckerGroupData?.suckerGroup?.projects?.items;

  const unitValue = useMemo(() => {
    if (!surpluses || !cashOutChainId || !projectTokenDecimals) return 0;
    const surplus = surpluses.find((s) => s.chainId === cashOutChainId) || null;
    const tokenSupply =
      projects?.find((p) => p.chainId === cashOutChainId)?.tokenSupply ?? "0";

    return getUnitValue(surplus, { value: tokenSupply, decimals: projectTokenDecimals });
  }, [cashOutChainId, projectTokenDecimals, surpluses, projects]);

  // Token Balances
  const balanceQuery = useSuckersUserTokenBalance()
  const currentChainBalanceObj = balanceQuery?.data?.find(tkn => tkn.chainId === selectedSucker.peerChainId)?.balance;
  const currentChainBalNum = Number(currentChainBalanceObj?.format());

  const receiveAmount = unitValue * Number(withdrawAmount);
  const receiveAmountString = receiveAmount < 1 ? Number(receiveAmount).toPrecision(3) : receiveAmount.toFixed(3);

  const setManualWithdrawAmount = (percentage: number) => {
    if (percentage === 100) { // no rounding for MAX - rounding is an issue for balances like 0.9999
      const s = currentChainBalNum.toString();
      if (!s.includes(".")) return s;
      const [int, frac] = s.split(".");
      const val = int === "0"
        ? `0.${frac.slice(0, 3)}`
        : `${int}.${frac.slice(0, 3)}`;

      setWithdrawAmount(val);
      return;
    }

    if (percentage < 0 || percentage > 99) return;
    const withdrawAmount = currentChainBalNum / 100 * percentage;
    const withdrawAmountString = withdrawAmount < 1 ?
      withdrawAmount.toPrecision(3) :
      withdrawAmount.toFixed(3);
    
    setWithdrawAmount(withdrawAmountString);
    return;
  };

  // This prevents scrolling to reduce the value below 0
  const handleWithdrawAmountChange = (value: string) => {
     if (value.startsWith("-")) {
      setWithdrawAmount("0");
      return;
    }

    setWithdrawAmount(value);
    return;
  };

  const preventMinusKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const invalidKeys = ["e", "E", "+", "-", "ArrowUp", "ArrowDown"];

    const key = e.key;

    // Allow all control/navigation keys:
    const controlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "Home",
      "End",
      "ArrowLeft",
      "ArrowRight",
    ];

    if (controlKeys.includes(key)) {
      return; // allow
    }

    // Block invalid characters
    if (invalidKeys.includes(key)) {
      e.preventDefault();
      return;
    }

    // Key is a single character. Ensure it's a digit or decimal point.
    if (!/[\d.]/.test(key)) {
      e.preventDefault();
      return;
    }

    const current = e.currentTarget.value;
    const next = current + key;

    // Limit total length to 16
    if (next.length > 16) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {/* WITHDRAW INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm font-light text-muted-foreground">
              YOU WITHDRAW
            </p>
            <input
              type="number"
              className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-hidden ring-0  placeholder:text-white focus:outline-hidden focus:ring-0 focus:placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => handleWithdrawAmountChange(e.target.value)}
              onKeyDown={preventMinusKey}
              aria-label={!unitValue ? "Switch Chains To Withdraw" : "Withdraw Amount"}
              disabled={!unitValue}
            />
          </div>
          <div className="flex flex-col items-end gap-[2px]">
            <WithdrawSelector suckersBalance={balanceQuery.data} />
            <p className="w-[130px] text-nowrap text-right text-sm font-light text-muted-foreground select-none">
              Balance:{" "}
              {!currentChainBalNum ? 
                "0.00" 
                : (currentChainBalNum < 100 ?
                  currentChainBalNum.toFixed(4) :
                  formatNumber(currentChainBalNum)
                )
              }
            </p>
          </div>
        </div>

        {/* RECEIVE INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-sm font-light text-muted-foreground select-none">
              YOU RECEIVE
            </p>
            <input
              type="number"
              className="w-full border-none bg-transparent p-0 text-2xl shadow-none outline-hidden ring-0 opacity-80 placeholder:text-white cursor-not-allowed"
              placeholder="0.00"
              value={Number(receiveAmountString).toString()} // KEEP - this removes trailing 0's
              readOnly
            />
          </div>
          <div className="flex w-fit min-w-fit items-center justify-end gap-1 rounded-full bg-grey-450 px-1.5 py-1">
            <div className="flex items-end">
              {receiveToken.isNative ? (
                <ChainLogo
                  chainId={1}
                  height={24}
                  width={24}
                />
              ) : (
                <Image
                  className="rounded-full min-w-[24px] min-h-[24px]"
                  src={"https://cdn.inevitable.science/static/img/logo/usdc.svg"}
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
              
              <div className="-mb-[4px] -ml-2.5 h-fit w-fit rounded-full border-[1.5px] border-grey-450 bg-grey-450 shadow-md">
                <ChainLogo
                  chainId={selectedSucker.peerChainId}
                  height={16}
                  width={16}
                />
              </div>
            </div>
            <p className="text-lg font-light">{receiveToken.symbol}</p>
          </div>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 background-color p-1 rounded-xl">
        <Button 
          className="h-[28px] rounded-l-lg rounded-r-xs"
          onClick={() => {setManualWithdrawAmount(10)}}
          disabled={!unitValue}
        >
          10%
        </Button>
        <Button
          className="h-[28px] rounded-xs"
          onClick={() => {setManualWithdrawAmount(25)}}
          disabled={!unitValue}
        >
          25%
        </Button>
        <Button
          className="h-[28px] rounded-xs"
          onClick={() => {setManualWithdrawAmount(50)}}
          disabled={!unitValue}
        >
          50%
        </Button>
        <Button
          className="h-[28px] rounded-l-xs rounded-r-lg"
          onClick={() => {setManualWithdrawAmount(100)}}
          disabled={!unitValue}
        >
          MAX
        </Button>
      </div>

      <WithdrawActionButton
        withdrawAmount={withdrawAmount}
        receiveTokenAddress={receiveTokenAddress}
        tokenBalance={currentChainBalNum}
      />
    </div>
  )
}
