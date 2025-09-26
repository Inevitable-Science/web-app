import { truncateAddress } from "@/lib/utils";
import { useIVXContext } from "../../DataProvider";
import { Address } from "viem";
import TreasuryPieChart from "@/app/[...slug]/components/NetworkDashboard/sections/TreasuryAnalyticsSection/TreasuryPieChart";

export function IvxTreasuryAnalytics() {
  const { analyticsData } = useIVXContext();

  return (
    <div className="grid h-[420px] grid-cols-2 gap-[12px]">
      <div className="h-full rounded-2xl bg-grey-450 p-[12px]">
        <p className="text-sm uppercase text-grey-50">Treasury Holdings</p>
        <div
          className="scrollbar-hide max-h-[376px] overflow-y-scroll pb-12"
          style={{
            maskImage:
              "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
            WebkitMaskImage:
              "linear-gradient(180deg, #000, rgba(0, 0, 0, 0.8) 90%, transparent)",
          }}
        >
          {analyticsData?.treasury?.treasuryTokens
            ?.slice()
            .sort((a, b) => b.totalValue - a.totalValue)
            .map((token, index) => {
              const percentage =
                token.totalValue > 0
                  ? (
                      (token.totalValue /
                        (analyticsData?.treasury?.treasuryValue ?? 1)) *
                      100
                    ).toFixed(2)
                  : "0.00";

              return (
                <div key={index} className="border-color border-b py-3">
                  <div className="flex items-center justify-between font-light text-grey-50">
                    <p>
                      {token.contractAddress
                        ? truncateAddress(token.contractAddress as Address)
                        : "Native Token"}
                    </p>
                    <p>{percentage}%</p>
                  </div>

                  <div className="flex items-center justify-between font-light">
                    <p>{token.metadata.symbol}</p>
                    <p>${token.totalValue.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="h-full rounded-2xl bg-grey-450 p-[16px]">
        <p className="text-sm uppercase text-grey-50">Treasury Holdings</p>
        <div className="flex h-[calc(100%-20px)] items-center justify-center">
          {analyticsData?.treasury?.treasuryTokens && (
            <TreasuryPieChart
              filteredData={analyticsData?.treasury?.treasuryTokens}
            />
          )}
        </div>
      </div>
    </div>
  );
}
