import { formatDate, formatNumber } from "@/lib/utils";
import { useIVXContext } from "../../DataProvider";
import { PayCard } from "../payCard/PayCard";

export function IvxPageHeader() {
  const { analyticsData } = useIVXContext();

  return (
    <div className="mb-[12px] flex flex-col-reverse gap-[12px] lg:grid lg:grid-cols-3">
      <div className="flex flex-col gap-[12px] uppercase md:grid md:grid-cols-3 lg:flex lg:h-[254px] lg:flex-col">
        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            $
            {analyticsData?.treasury?.treasuryValue
              ? formatNumber(analyticsData?.treasury?.treasuryValue, false)
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Treasury Holdings</p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {analyticsData?.token?.selectedToken.averageBal
              ? formatNumber(
                  analyticsData?.token?.selectedToken.averageBal,
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
            {analyticsData?.token?.selectedToken.totalHolders
              ? formatNumber(
                  Number(analyticsData?.token?.selectedToken.totalHolders),
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
            {analyticsData?.token?.selectedToken.totalSupply
              ? formatNumber(
                  analyticsData?.token?.selectedToken.totalSupply,
                  false
                )
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Total IVX Supply</p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {analyticsData?.token?.selectedToken.medianBal
              ? formatNumber(
                  analyticsData?.token?.selectedToken.medianBal,
                  false
                )
              : "--"}
          </h3>
          <p className="text-muted-foreground font-light">Median IVX Balance</p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl normal-case">
            {formatDate(analyticsData?.treasury?.lastUpdated)}
          </h3>
          <p className="text-muted-foreground font-light">Last Updated</p>
        </div>
      </div>

      <PayCard />
    </div>
  );
}
