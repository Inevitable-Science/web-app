import { useProjectDataStore } from "@/store/RevnetDataContext";

export function PortfolioPeformance() {
  const treasuryData = useProjectDataStore((state) => state.treasuryAnalytics);

  return (
    <>
      {treasuryData?.historicalReturns && (
        <div className="bg-grey-450 h-full rounded-2xl p-[12px]">
          <h3 className="text-muted-foreground py-1 text-sm uppercase">
            Portfolio Peformance
          </h3>
          <div className="flex flex-col text-sm font-light">
            {treasuryData.historicalReturns.map((value) => {
              const isPositive = !value.percentReturn.startsWith("-");
              const textColor = isPositive ? "text-green-500" : "text-red-500";

              return (
                <div
                  key={value.dateRange}
                  className="flex items-center justify-between border-b border-[#282828] py-1 py-4"
                >
                  <p className="text-muted-foreground w-8">{value.dateRange}</p>
                  <p className={`min-w-24 text-center ${textColor}`}>
                    {isPositive === true && "+"}
                    {value.dollarReturn}
                  </p>
                  <p className={`min-w-16 text-right ${textColor}`}>
                    {isPositive === true && "+"}
                    {value.percentReturn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
