import { formatNumber } from "@/lib/utils";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function LoanFeeChart({
  prepaidPercent,
  setPrepaidPercent,
  feeData,
  grossBorrowedNative,
  collateralAmount,
  tokenSymbol,
  collateralTokenSymbol,
  displayYears,
  displayMonths,
}: {
  prepaidPercent: number;
  setPrepaidPercent: (v: number) => void;
  feeData: { year: number; totalCost: number }[];
  grossBorrowedNative: number;
  collateralAmount: string;
  tokenSymbol: string;
  collateralTokenSymbol?: string;
  displayYears: number;
  displayMonths: number;
}) {
  // Ensure feeData is valid and has reasonable values
  const validFeeData =
    feeData?.filter(
      (item) =>
        item &&
        typeof item.year === "number" &&
        typeof item.totalCost === "number" &&
        item.totalCost >= 0 &&
        item.totalCost < Number.MAX_SAFE_INTEGER
    ) || [];

  // Calculate max cost from original feeData to ensure proper domain
  const maxCost =
    feeData?.length > 0 ? Math.max(...feeData.map((d) => d.totalCost || 0)) : 0;
  const minCost = grossBorrowedNative + grossBorrowedNative * 0.035; // borrowed amount + fixed fee

  return (
    <div className="mt-2">
      <div className="mt-2 mb-2">
        <label className="block text-sm font-bold">
          Prepaid Fee: {prepaidPercent}%
        </label>
        <input
          type="range"
          min="2.5"
          max="50"
          step="2.5"
          value={prepaidPercent}
          onChange={(e) => setPrepaidPercent(Number(e.target.value))}
          className="my-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-(--border)/30 focus:outline-none"
        />
        <div className="text-muted-foreground flex justify-between text-xs">
          <span>Lower Upfront Cost</span>
          <span>Higher Upfront Cost</span>
        </div>
      </div>
      <div className="h-64 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={validFeeData}>
            <XAxis
              height={40}
              dataKey="year"
              label={{
                value: "Time (years)",
                position: "insideBottom",
                offset: 0,
                style: {
                  fontSize: "12px",
                  fill: "var(--muted-foreground)",
                },
              }}
              type="number"
              domain={[0, 10]}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              ticks={[...Array(11).keys()]}
              tickFormatter={(year) => `${year}`}
            />
            <YAxis
              width={20}
              label={{
                value: "Additional cost to unlock",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                style: {
                  textAnchor: "middle",
                  fontSize: "12px",
                  fill: "var(--muted-foreground)",
                },
              }}
              domain={[minCost, maxCost * 1.1]}
              tick={false}
            />
            <Tooltip
              itemStyle={{
                color: "var(--muted-foreground)",
                fontSize: "13px",
              }}
              contentStyle={{
                color: "var(--foreground)",
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                minWidth: 230,
                borderRadius: "0.5rem",
                padding: "0.5rem",
                fontSize: "0.875rem",
                boxShadow:
                  "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number, _name: string, props) => {
                if (props?.payload?.year >= 9.99) {
                  return ["—", "No collateral can be reclaimed at this time"];
                }

                // value is the totalCost (fees) at this point in time
                // This represents how much native token you need to pay to unlock your collateral
                const costToUnlock = value;
                // Use collateralTokenSymbol for collateral amount, tokenSymbol for fees
                const collateralSymbol = collateralTokenSymbol || tokenSymbol;
                return [
                  `${formatNumber(collateralAmount, false)} ${collateralSymbol}`,
                  `Pay (total): ${formatNumber(costToUnlock, false)} ${tokenSymbol} to unlock `,
                ];
              }}
              labelFormatter={(label: number) => {
                if (label >= 9.99) {
                  return "Final period - no collateral will be returned";
                }
                const months = Math.round(label * 12);
                const years = Math.floor(months / 12);
                const remMonths = months % 12;
                return `${months} months (${years}y ${remMonths}m)`;
              }}
            />
            <Line
              type="monotone"
              dataKey="totalCost"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-muted-foreground mb-2 text-center text-xs">
        Fees increase after{" "}
        {displayYears > 0
          ? `${displayYears} year${displayYears > 1 ? "s" : ""}${displayMonths > 0 ? ` and ${displayMonths} month${displayMonths > 1 ? "s" : ""}` : ""}`
          : `${displayMonths} month${displayMonths > 1 ? "s" : ""}`}
      </p>

      <style>{`
      /* Chrome / Safari */ 
      input[type="range"]::-webkit-slider-thumb {
        appearance: none;
        height: 16px;
        width: 16px;
        border-radius: 9999px;
        background: var(--cerulean);
        cursor: pointer;
      }

      /* Firefox */
      input[type="range"]::-moz-range-thumb {
        height: 16px;
        width: 16px;
        border-radius: 9999px;
        background: var(--cerulean);
        cursor: pointer;
        border: none;
      }
      `}</style>
    </div>
  );
}
