import { truncateAddress } from "@/lib/utils";
import { Address } from "viem";
import { TreasuryPieChart } from "@/components/analytics/TreasuryPieChart";
import { useRevnetDataStore } from "@/store/RevnetDataContext";

export function IvxTreasuryAnalytics() {
  const treasuryData = useRevnetDataStore((state) => state.treasuryAnalytics);

  return (
    <div className="flex flex-col-reverse gap-[12px] lg:grid lg:h-[420px] lg:grid-cols-2">
      <div className="bg-grey-450 h-full rounded-2xl p-[12px]">
        <p className="text-muted-foreground text-sm uppercase">
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
          {treasuryData?.treasuryTokens
            ?.slice()
            .sort((a, b) => b.totalValue - a.totalValue)
            .map((token, index) => {
              const percentage =
                token.totalValue > 0
                  ? (
                      (token.totalValue /
                        (treasuryData?.treasuryValue ?? 1)) *
                      100
                    ).toFixed(2)
                  : "0.00";

              return (
                <div key={index} className="border-color border-b py-3">
                  <div className="text-muted-foreground flex items-center justify-between font-light">
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

      {treasuryData?.treasuryTokens && (
        <div className="bg-grey-450 h-full rounded-2xl p-[16px]">
          <p className="text-muted-foreground text-sm uppercase">
            Treasury Holdings
          </p>
          <div className="my-[24px] flex h-[calc(100%-20px)] items-center justify-center lg:my-0">
            <TreasuryPieChart
              filteredData={treasuryData?.treasuryTokens}
            />
          </div>
        </div>
      )}
    </div>
  );
}
