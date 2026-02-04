import { useEffect, useState } from "react";
import Image from "next/image";
import {
  useBendystrawQuery,
  useJBContractContext,
  useJBTokenContext,
  useSuckersUserTokenBalance,
} from "juice-sdk-react";
import { truncateNumber } from "@/lib/utils";
import { WithdrawActionButton } from "./WithdrawActionButton";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { WithdrawSelector } from "./WithdrawSelector";
import { ChainLogo } from "@/components/ChainLogo";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { SuckerGroupDocument } from "@/generated/graphql";
import {
  getProjectsReclaimableSurplus
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
  const { peerChainId: selectedChain, projectId: activeProjectId } = selectedSucker;
  
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [surpluses, setSurpluses] = useState<Surplus[] | null>(null);

  const { version } = useJBContractContext();
  const { token } = useJBTokenContext();

  // Project Base Token
  const baseToken = useProjectBaseToken();
  const receiveTokenAddress = baseToken.tokenMap[selectedChain].token;

  // Token Balances
  const balanceQuery = useSuckersUserTokenBalance();
  const currentChainBalObj = balanceQuery?.data?.find(
    (tkn) => tkn.chainId === selectedChain
  )?.balance;
  const currentChainBalanceBigInt = currentChainBalObj?.value ?? 0n;

  const projectTokenDecimals = token?.data?.decimals || JB_TOKEN_DECIMALS;
  const withdrawAmountBigInt = parseUnits(withdrawAmount, projectTokenDecimals);

  const surplus = surpluses?.find((s) => s.chainId === selectedChain) || null;
  const zeroSurplusValue = Number(surplus?.value ?? 0) == 0;

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
  
  const { data: reclaimableAmount, isLoading } = useReclaimableSurplus({
    chainId: selectedChain,
    projectId: activeProjectId,
    tokenAmount: withdrawAmountBigInt || undefined,
    version,
    decimals: baseToken.decimals,
    currencyId: surplus?.currencyId ?? 1,
  });

  const { data: maxWithdrawAmount } = useReclaimableSurplus({
    chainId: selectedChain,
    projectId: activeProjectId,
    tokenAmount: currentChainBalanceBigInt || undefined,
    version,
    decimals: baseToken.decimals,
    currencyId: surplus?.currencyId ?? 1,
  });

  const receiveAmount = formatUnits(
    reclaimableAmount ?? 0n,
    baseToken.decimals
  );
  const maxReceiveAmount = formatUnits(
    maxWithdrawAmount ?? 0n,
    baseToken.decimals
  );

  const receiveAmountString = 
    withdrawAmountBigInt > currentChainBalanceBigInt ?
      truncateNumber(maxReceiveAmount) : 
      truncateNumber(receiveAmount);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {/* WITHDRAW INPUT */}
        <div className="background-color grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light">
              YOU WITHDRAW
            </p>
            <PayInput
              value={withdrawAmount}
              onChangeFunction={(value) => {
                if (value.startsWith("-")) {
                  setWithdrawAmount("0");
                  return;
                }

                setWithdrawAmount(value);
                return;
              }}
              disabled={zeroSurplusValue || currentChainBalanceBigInt === 0n}
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <WithdrawSelector suckersBalance={balanceQuery.data} />
            <div className="text-muted-foreground flex w-[130px] items-center justify-end gap-1 text-right text-sm font-light text-nowrap select-none">
              Balance:{" "}
              {balanceQuery.isLoading ? (
                <div className="activeSkeleton h-[17px] w-[32px] rounded-md opacity-30" />
              ) : (
                truncateNumber(currentChainBalObj?.format() ?? 0, true)
              )}
            </div>
          </div>
        </div>

        {/* RECEIVE INPUT */}
        <div className="background-color grid grid-cols-[1fr_auto] items-center gap-2 rounded-xl p-[16px]">
          <div className="flex flex-col gap-[2px]">
            <p className="text-muted-foreground text-sm font-light select-none">
              YOU RECEIVE {withdrawAmountBigInt > currentChainBalanceBigInt && "MAX"}
            </p>
            {isLoading && Number(withdrawAmount) ? (  // dont show skeleton when value is 0
              <div className="activeSkeleton mt-[2px] h-[30px] w-[130px] rounded-lg opacity-30" />
            ) : (
              // show placeholder "0.00" when no withdraw amount is inputted
              <PayInput value={withdrawAmount ? receiveAmountString : ""} disabled />
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
                  chainId={selectedChain}
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
        {[10, 25, 50, 100].map((percent) => (
          <Button
            key={percent}
            className="h-[28px] rounded-xs"
            onClick={() => {
              const withdrawAmount = (currentChainBalanceBigInt * BigInt(percent)) / 100n;
              const withdrawAmountString = truncateNumber(
                formatUnits(withdrawAmount, projectTokenDecimals)
              );

              setWithdrawAmount(withdrawAmountString);
            }}
            disabled={zeroSurplusValue || currentChainBalanceBigInt === 0n}
          >
            {percent === 100 ? "MAX" : `${percent}%`}
          </Button>
        ))}
      </div>

      <WithdrawActionButton
        withdrawAmount={withdrawAmountBigInt}
        tokenBalance={currentChainBalanceBigInt}
        minTokensReturned={reclaimableAmount}
        receiveTokenAddress={receiveTokenAddress}
      />
    </div>
  );
}
