import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  useBendystrawQuery,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { formatNumber } from "@/lib/utils";
import { WithdrawActionButton } from "./WithdrawActionButton";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { WithdrawSelector } from "./WithdrawSelector";
import { ChainLogo } from "@/components/ChainLogo";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { SuckerGroupDocument } from "@/generated/graphql";
import {
  getProjectsReclaimableSurplus,
  getUnitValue,
} from "@/lib/reclaimableSurplus";
import { Button } from "@/components/ui/button";
import { PayInput } from "@/components/PayInput";
import { useReclaimableSurplus } from "@/hooks/useReclaimableSurplus";
import { formatUnits, parseUnits } from "viem";
import { JB_TOKEN_DECIMALS } from "juice-sdk-core";

export interface Surplus {
  projectId: number;
  value: string;
  currencyId: number;
  decimals: number;
  chainId: number;
  version: number;
  tokenDecimals: 18;
}

export function WithdrawTab() {
  const project = useRevnetDataStore((state) => state.project);
  const selectedSucker = useRevnetDataStore((state) => state.selectedSucker);
  const { version } = useJBContractContext();
  const { token } = useJBTokenContext();

  const receiveToken = useProjectBaseToken();
  const receiveTokenAddress = receiveToken.tokenMap[selectedSucker.peerChainId].token;

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [surpluses, setSurpluses] = useState<Surplus[] | null>(null);

  const projectTokenDecimals = token?.data?.decimals || JB_TOKEN_DECIMALS;
  const withdrawAmountBigInt = parseUnits(withdrawAmount, projectTokenDecimals);

  const { data: suckerGroupData } = useBendystrawQuery(
    SuckerGroupDocument,
    { id: project.suckerGroupId ?? "" },
    { enabled: !!project.suckerGroupId }
  );

  useEffect(() => {
    const fetchSurpluses = async () => {
      const surpluses = await getProjectsReclaimableSurplus(
        suckerGroupData?.suckerGroup?.projects?.items || []
      );
      setSurpluses(surpluses);
    };

    fetchSurpluses();
  }, []);

  const surplus = surpluses?.find((s) => s.chainId === selectedSucker.peerChainId) || null;

  const { data: reclaimableAmount } = useReclaimableSurplus({
    chainId: selectedSucker.peerChainId,
    projectId: selectedSucker.projectId,
    tokenAmount: withdrawAmountBigInt || undefined,
    version,
    decimals: receiveToken.decimals,
    currencyId: surplus?.currencyId ?? 1
  });

  const cashOutChainId = selectedSucker.peerChainId;
  const projects = suckerGroupData?.suckerGroup?.projects?.items;

  const unitValue = useMemo(() => {
    if (!surpluses || !cashOutChainId || !projectTokenDecimals) return 0;
    const tokenSupply =
      projects?.find((p) => p.chainId === cashOutChainId)?.tokenSupply ?? "0";

    return getUnitValue(surplus, {
      value: tokenSupply,
      decimals: projectTokenDecimals,
    });
  }, [cashOutChainId, projectTokenDecimals, surpluses, projects]);

  // Token Balances
  const balanceQuery = useSuckersUserTokenBalance();
  const currentChainBalanceObj = balanceQuery?.data?.find(
    (tkn) => tkn.chainId === selectedSucker.peerChainId
  )?.balance;
  const currentChainBalNum = Number(currentChainBalanceObj?.format());

  //const receiveAmount = unitValue * Number(withdrawAmount);
  //const receiveAmountString = formatNumber(receiveAmount, false);
  const receiveAmount = formatUnits(reclaimableAmount ?? 0n, receiveToken.decimals);
  const receiveAmountString = formatNumber(receiveAmount, false);

  const setManualWithdrawAmount = (percentage: number) => {
    if (percentage === 100) {
      // no rounding for MAX - rounding is an issue for balances like 0.9999
      const s = currentChainBalNum.toString();
      if (!s.includes(".")) return s;
      const [int, frac] = s.split(".");
      const val =
        int === "0" ? `0.${frac.slice(0, 3)}` : `${int}.${frac.slice(0, 3)}`;

      setWithdrawAmount(val);
      return;
    }

    if (percentage < 0 || percentage > 99) return;
    const withdrawAmount = (currentChainBalNum / 100) * percentage;
    const withdrawAmountString = formatNumber(withdrawAmount, false);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {/* WITHDRAW INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">
              YOU WITHDRAW
            </p>
            <PayInput
              value={withdrawAmount}
              onChangeFunction={handleWithdrawAmountChange}
              disabled={!unitValue}
            />
          </div>
          <div className="flex flex-col items-end gap-[2px]">
            <WithdrawSelector suckersBalance={balanceQuery.data} />
            <p className="text-muted-foreground flex items-center justify-end gap-1 w-[130px] text-right text-sm font-light text-nowrap select-none">
              Balance:{" "}
              {balanceQuery.isLoading ? 
                <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" /> :
                !currentChainBalNum ?
                "0.00" :
                formatNumber(currentChainBalNum, false)
              }
            </p>
          </div>
        </div>

        {/* RECEIVE INPUT */}
        <div className="background-color flex items-center justify-between gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light select-none">
              YOU RECEIVE
            </p>
            <PayInput
              value={receiveAmountString}
              disabled
            />
          </div>
          <div className="bg-grey-450 flex w-fit min-w-fit items-center justify-end gap-1 rounded-full px-1.5 py-1">
            <div className="flex items-end">
              {receiveToken.isNative ? (
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
            <p className="text-lg font-light">{receiveToken.symbol}</p>
          </div>
        </div>
      </div>

      <div className="background-color hidden grid-cols-[repeat(auto-fit,minmax(40px,1fr))] items-center gap-1 rounded-xl p-1 [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg sm:grid">
        {[10, 25, 50, 100].map(percent => (
          <Button
            key={percent}
            className="h-[28px] rounded-xs"
            onClick={() => setManualWithdrawAmount(percent)}
            disabled={!unitValue}
          >
            {percent === 100 ?
              "MAX" :
              `${percent}%`
            }
          </Button>
        ))}
      </div>

      <WithdrawActionButton
        withdrawAmount={withdrawAmount}
        receiveTokenAddress={receiveTokenAddress}
        tokenBalance={currentChainBalNum}
      />
    </div>
  );
}
