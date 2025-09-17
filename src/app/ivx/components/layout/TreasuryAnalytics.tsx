import { truncateAddress } from "@/lib/utils";
import { useIVXContext } from "../../DataProvider";
import { Address } from "viem";
import TreasuryPieChart from "@/app/[...slug]/components/NetworkDashboard/sections/TreasuryAnalyticsSection/TreasuryPieChart";

export function IvxTreasuryAnalytics() {
  const { analyticsData } = useIVXContext();

  return(
    <div className="grid grid-cols-2 gap-[12px]">
      <div className="bg-grey-450 rounded-2xl p-[12px]">
        <p className="text-grey-50 text-sm uppercase">Treasury Holdings</p>
        <div 
          className="scrollbar-hide mt-2 h-full overflow-y-auto pb-12"
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
                  ? ((token.totalValue / (analyticsData?.treasury?.treasuryValue ?? 1)) * 100).toFixed(2)
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

      <div className="bg-grey-450 rounded-2xl p-[16px] h-full">
        <p className="text-grey-50 text-sm uppercase">Treasury Holdings</p>
        <div className="flex h-[calc(100%-20px)] justify-center items-center">
          {analyticsData?.treasury?.treasuryTokens &&
            <TreasuryPieChart filteredData={analyticsData?.treasury?.treasuryTokens} />
          }
        </div>
      </div>
    </div>
  );
}