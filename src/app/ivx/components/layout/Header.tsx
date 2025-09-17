import { formatDate, formatNumber } from "@/lib/utils";
import { useIVXContext } from "../../DataProvider";
import { PayCard } from "../PayCard/PayCard";

export function IvxPageHeader() {
  const { analyticsData } = useIVXContext();
  
  return(
    <div className="grid grid-cols-3 gap-[12px]">
      <div className="flex flex-col gap-[12px] uppercase">
        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            ${analyticsData?.treasury?.treasuryValue ? formatNumber(analyticsData?.treasury?.treasuryValue, false) : "--"}
          </h3>
          <p className="font-light text-muted-foreground">
            Treasury Holdings
          </p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {analyticsData?.token?.selectedToken.averageBal}
          </h3>
          <p className="font-light text-muted-foreground">
            Average IVX Balance
          </p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {analyticsData?.token?.selectedToken.totalHolders}
          </h3>
          <p className="font-light text-muted-foreground">
            Total Holders
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-[12px] uppercase">
        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            ${analyticsData?.token?.selectedToken.totalSupply ? formatNumber(analyticsData?.token?.selectedToken.totalSupply, false) : "--"}
          </h3>
          <p className="font-light text-muted-foreground">
            Total IVX Supply
          </p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl">
            {analyticsData?.token?.selectedToken.medianBal}
          </h3>
          <p className="font-light text-muted-foreground">
            Median IVX Balance
          </p>
        </div>

        <div className="bg-grey-450 rounded-2xl p-[12px]">
          <h3 className="text-xl normal-case">
            {formatDate(analyticsData?.treasury?.lastUpdated)}
          </h3>
          <p className="font-light text-muted-foreground">
            Total Holders
          </p>
        </div>
      </div>

      <PayCard />
    </div>
  )
}