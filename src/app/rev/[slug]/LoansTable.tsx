import { USDC_DECIMALS } from "@/app/constants";
import { ChainLogo } from "@/components/ChainLogo";
import { Button } from "@/components/ui/button";
import { LoansByAccountDocument, SuckerGroupDocument } from "@/generated/graphql";
import { formatDate, formatNumber, formatSeconds } from "@/lib/utils";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { DEFAULT_NATIVE_TOKEN_SYMBOL, JB_TOKEN_DECIMALS, NATIVE_TOKEN, NATIVE_TOKEN_DECIMALS } from "juice-sdk-core";
import { JBChainId, useBendystrawQuery, useJBContractContext, useJBTokenContext, useSuckers } from "juice-sdk-react";
import { ArrowRight } from "lucide-react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { RepayDialog } from "./RepayDialog";

export function LoansTable() {
  const project = useRevnetDataStore(state => state.project);
  const suckers = useRevnetDataStore(state => state.suckers);
  const suckerGroupId = project.suckerGroupId;
  const { token } = useJBTokenContext();
  const { version } = useJBContractContext();
  const { address } = useAccount();

  const projectTokenDecimals = token.data?.decimals ?? JB_TOKEN_DECIMALS;

  // Get all loans for the user
  const { data } = useBendystrawQuery(
    LoansByAccountDocument,
    {
      owner: address!,
      version,
    },
    {
      enabled: !!address,
      pollInterval: 3000, // Refresh every 3 seconds
    },
  );

  if (!data?.loans?.items) return null;

  const nowInSec = Math.floor(Date.now() / 1000);

  const filteredLoans = data.loans.items.filter((loan) =>
    suckers?.some(
      s =>
        Number(s.projectId) === Number(loan.projectId) &&
        Number(s.peerChainId) === Number(loan.chainId)
    )
  );

  if (!filteredLoans.length) return null;

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    const timeA = a.prepaidDuration - (nowInSec - Number(a.createdAt));
    const timeB = b.prepaidDuration - (nowInSec - Number(b.createdAt));
    return timeA - timeB;
  });

  return (
    <div className="bg-grey-450 rounded-2xl p-[12px] mb-4">
      <h3 className="text-lg">
        Your Loans
      </h3>
      
      <div className="grid grid-cols-[2fr_4fr_4fr_4fr_3fr] my-2 items-center text-sm">
        <p>Chain</p>
        <p>Borrowed</p>
        <p>Collateral</p>
        <p>Fees Increase In</p>
        <div />
      </div>
      <div className="background-color rounded p-3 text-sm">
        {sortedLoans.map(loan => {
          const loanTokenIsNative = loan.token.toLowerCase() === NATIVE_TOKEN.toLowerCase();
          const loanTokenDecimals = loanTokenIsNative ? NATIVE_TOKEN_DECIMALS : USDC_DECIMALS;
          const loanTokenSymbol = loanTokenIsNative ? DEFAULT_NATIVE_TOKEN_SYMBOL : "USDC";

          return (
            <div key={loan.id} className="grid grid-cols-[2fr_4fr_4fr_4fr_3fr] items-center py-2 border-b border-grey-450">
              <ChainLogo 
                chainId={loan.chainId as JBChainId}
              />
              <p>
                {formatNumber(
                  formatUnits(loan.borrowAmount, loanTokenDecimals),
                  false
                )}{" "}
                {loanTokenSymbol}
              </p>
              <p>
                {formatNumber(
                  formatUnits(loan.collateral, projectTokenDecimals),
                  false
                )} ${token.data?.symbol}
              </p>
              <p>
                {formatSeconds(loan.prepaidDuration)}
              </p>
              <div className="flex justify-end">
                <RepayDialog />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}