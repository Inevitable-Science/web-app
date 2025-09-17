import { useIVXContext } from "../../DataProvider";

export function PortfolioPeformance() {
  const { analyticsData } = useIVXContext();

  return(
    <>
      {analyticsData?.treasury?.historicalReturns && (
        <div className="rounded-2xl bg-grey-450 p-[12px]">
          <h3 className="py-1 text-sm uppercase text-grey-50">
            Portfolio Peformance
          </h3>
          <div className="flex flex-col text-sm font-light">
            {Object.entries(analyticsData?.treasury?.historicalReturns || {}).map(
              ([label, value]) => {
                const isPositive = !value.percentReturn.startsWith("-");
                const textColor = isPositive
                  ? "text-green-500"
                  : "text-red-500";

                return (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-[#282828] py-1 py-4"
                  >
                    <p className="w-8 text-grey-50">{label}</p>
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
              }
            )}
          </div>
        </div>
      )}
    </>
  )
}