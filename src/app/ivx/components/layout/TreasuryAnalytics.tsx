import { truncateAddress } from "@/lib/utils";
import { useIVXContext } from "../../DataProvider";
import { Address } from "viem";
import { TreasuryPieChart } from "@/components/analytics/TreasuryPieChart";

export function IvxTreasuryAnalytics() {
  const { analyticsData } = useIVXContext();

  return (
    <div className="flex flex-col-reverse gap-[12px] lg:grid lg:h-[420px] lg:grid-cols-2">
      <div className="h-full rounded-2xl bg-grey-450 p-[12px]">
        <p className="text-sm uppercase text-muted-foreground">
          Treasury Holdings
        </p>
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
                  <div className="flex items-center justify-between font-light text-muted-foreground">
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

      {analyticsData?.treasury?.treasuryTokens && (
        <div className="h-full rounded-2xl bg-grey-450 p-[16px]">
          <p className="text-sm uppercase text-muted-foreground">
            Treasury Holdings
          </p>
          <div className="my-[24px] flex h-[calc(100%-20px)] items-center justify-center lg:my-0">
            <TreasuryPieChart
              filteredData={analyticsData?.treasury?.treasuryTokens}
            />
          </div>
        </div>
      )}
    </div>
  );
}
