import { formatDate, formatNumber } from "@/lib/utils";
import { PayCard } from "../payCard/PayCard";
import { useProjectDataStore } from "@/store/RevnetDataContext";

export function IvxPageHeader() {
  const tokenData = useProjectDataStore((state) => state.tokenAnalytics);
  const treasuryData = useProjectDataStore((state) => state.treasuryAnalytics);

  return (
    <div className="mb-[12px] flex flex-col-reverse gap-[12px] lg:grid lg:grid-cols-3">
      <div className="flex flex-col gap-[12px] uppercase md:grid md:grid-cols-3 lg:flex lg:h-[254px] lg:flex-col">
        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            $
            {treasuryData?.treasuryValue
              ? formatNumber(treasuryData.treasuryValue, false)
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Treasury Holdings</p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {tokenData?.selectedToken.averageBal
              ? formatNumber(
                  tokenData.selectedToken.averageBal,
                  true
                )
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">
            Average IVX Balance
          </p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {tokenData?.selectedToken.totalHolders
              ? formatNumber(
                  Number(tokenData?.selectedToken.totalHolders),
                  false
                )
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Total Holders</p>
        </div>
      </div>

      <div className="hidden gap-[12px] uppercase md:grid md:grid-cols-3 lg:flex lg:flex-col">
        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {tokenData?.selectedToken.totalSupply
              ? formatNumber(
                  tokenData.selectedToken.totalSupply,
                  false
                )
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Total IVX Supply</p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {tokenData?.selectedToken.medianBal
              ? formatNumber(
                  tokenData.selectedToken.medianBal,
                  false
                )
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Median IVX Balance</p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl normal-case">
            {formatDate(treasuryData?.lastUpdated)}
          </h3>
          <p className="text-muted-foreground font-light">Last Updated</p>
        </div>
      </div>

      <PayCard />
    </div>
  );
}
