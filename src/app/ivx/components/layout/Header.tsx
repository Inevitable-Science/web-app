import { formatDate, formatNumber } from "@/lib/utils";
//import { PayCard } from "../payCard/PayCard";
import { useRevnetDataStore } from "@/store/RevnetDataContext";
import { TransactionCard } from "../payCard/TransactionCard";

export function IvxPageHeader() {
  const tokenData = useRevnetDataStore((state) => state.tokenAnalytics);
  const treasuryData = useRevnetDataStore((state) => state.treasuryAnalytics);

  return (
    <div className="mb-[12px] flex flex-col-reverse gap-[12px] lg:grid lg:grid-cols-3">
      <div className="flex flex-col gap-[12px] uppercase md:grid md:grid-cols-3 lg:flex lg:h-[254px] lg:flex-col">
        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            $
            {treasuryData?.treasuryValue
              ? formatNumber(treasuryData.treasuryValue)
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Treasury Holdings</p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {tokenData?.token.averageBal
              ? formatNumber(tokenData.token.averageBal)
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">
            Average IVX Balance
          </p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {tokenData?.token.totalHolders
              ? formatNumber(tokenData?.token.totalHolders)
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Total Holders</p>
        </div>
      </div>

      <div className="hidden gap-[12px] uppercase md:grid md:grid-cols-3 lg:flex lg:flex-col">
        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {tokenData?.token.totalSupply
              ? formatNumber(tokenData.token.totalSupply)
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Total IVX Supply</p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {tokenData?.token.medianBal
              ? formatNumber(tokenData.token.medianBal)
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

      <TransactionCard />
    </div>
  );
}
