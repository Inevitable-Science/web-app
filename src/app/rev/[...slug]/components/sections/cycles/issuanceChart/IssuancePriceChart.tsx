"use client";

import { ChartConfig, ChartContainer, ChartTooltip } from "./chartHelper";
import { useProjectBaseToken } from "@/hooks/useProjectBaseToken";
import { format } from "date-fns";
import {
  JBChainId,
  useJBChainId,
  useJBContractContext,
  useJBTokenContext,
} from "juice-sdk-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceArea,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { getRulesets, type Ruleset } from "./getRulesets";
import { prepareChartData } from "./prepareChartData";
import { ViemChainIdType } from "@/lib/wagmiConfig";

export type ProjectionRange = "1y" | "5y" | "10y" | "20y" | "all";

const chartConfig = {
  price: {
    label: "Issuance Price",
    color: "var(--cerulean)",
  },
} satisfies ChartConfig;

const VALID_RANGES: ProjectionRange[] = ["1y", "5y", "10y", "20y", "all"];

interface Props {
  rulesets: Ruleset[];
}

export function IssuancePriceChart({ range }: { range: ProjectionRange }) {
  const { projectId, version } = useJBContractContext();
  const chainId = useJBChainId();

  const { token } = useJBTokenContext();
  const baseToken = useProjectBaseToken();

  const [rulesets, setRulesets] = useState<Ruleset[] | null>(null);

  // Load rulesets async
  useEffect(() => {
    async function loadRulesets() {
      const data = await getRulesets(
        projectId.toString(),
        chainId as ViemChainIdType,
        version
      );
      console.log(data, "passed rulesets");
      setRulesets(data);
    }

    loadRulesets();
  }, [projectId, chainId, version]);

  const { chartData, stages, stageAreas, todayVisualX, toReal } =
    useMemo(() => {
      if (!rulesets)
        return {
          chartData: [],
          stages: [],
          stageAreas: [],
          todayVisualX: 0,
          toReal: () => 0,
        };
      return prepareChartData(rulesets, range);
    }, [rulesets, range]);

  const tokenSymbol = token.data?.symbol ?? "$TOKEN";

  if (!chartData?.length) {
    return (
      <div className="mt-2 ml-[16px]">
        <div className="activeSkeleton aspect-[2/1] min-w-full rounded-lg sm:aspect-[5/2]" />
      </div>
    );
  }

  return (
    <ChartContainer
      key={range}
      config={chartConfig}
      className="bg-grey-450 [&_.recharts-surface]:fill-grey-450 [&_.recharts-rectangle]:fill-grey-450 aspect-[2/1] w-full sm:aspect-[5/2]"
    >
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 0, right: 12, top: 24, bottom: 0 }}
      >
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--columbia-blue)"
              stopOpacity={0.3}
            />
            <stop
              offset="100%"
              stopColor="var(--cerulean)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="visualX"
          tickLine={false}
          fill={"var(--muted-foreground)"}
          axisLine={true}
          tickMargin={10}
          tickFormatter={(v) => format(new Date(toReal(v) * 1000), "yyyy")}
          minTickGap={40}
          type="number"
          domain={["dataMin", "dataMax"]}
        />
        <YAxis
          fill={"var(--muted-foreground)"}
          tickLine={false}
          axisLine={true}
          tickMargin={6}
          tickFormatter={formatYAxis}
          width={70}
          domain={["auto", "auto"]}
        />
        <ChartTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const data = payload[0]?.payload;
            if (!data?.timestamp) return null;

            const stage = stages.findLast((s) => data.timestamp >= s.start);
            const value = payload[0].value as number;

            return (
              <div className="background-color border-color min-w-[230px] rounded-lg border p-3 text-sm shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  {stage && (
                    <div className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                      {stage.name}
                    </div>
                  )}
                  <div className="text-muted-foreground mb-1 font-medium">
                    {format(new Date(data.timestamp * 1000), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="text-white">
                    {formatPrice(value, baseToken.symbol)} / {tokenSymbol}
                  </span>
                </div>
              </div>
            );
          }}
        />

        {stageAreas.map((area) => (
          <ReferenceArea
            key={area.name}
            x1={area.x1}
            x2={area.x2}
            fill={area.fill}
            fillOpacity={1}
          />
        ))}

        <Area
          type="monotone"
          dataKey="price"
          stroke="var(--color-price)"
          strokeWidth={2}
          fill="url(#priceFill)"
          connectNulls
          isAnimationActive={false}
        />

        {stageAreas.map((area) => (
          <ReferenceLine
            key={`line-${area.name}`}
            x={area.x1}
            stroke="var(--muted-foreground)"
            strokeDasharray="3 3"
            label={{
              value: area.name,
              position: "insideTopLeft",
              fill: "var(--muted-foreground)",
              fontSize: 12,
              offset: 10,
              fontWeight: 500,
            }}
          />
        ))}
        {todayVisualX !== null && (
          <ReferenceLine
            x={todayVisualX}
            stroke="var(--grey-100)"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: "Today",
              position: "top",
              fill: "var(--grey-100)",
              fontSize: 12,
              offset: 10,
              fontWeight: 500,
            }}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}

function formatYAxis(value: number): string {
  if (value === 0) return "0";
  if (value < 0.000001) return value.toExponential(1);
  if (value < 0.001) return value.toExponential(2);
  if (value < 1) return value.toFixed(4);
  if (value < 1000) return value.toFixed(2);
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function formatPrice(value: number, symbol: string): string {
  if (value === 0) return `0 ${symbol}`;
  if (value < 0.000001) return `${value.toExponential(4)} ${symbol}`;
  if (value < 0.001) return `${value.toPrecision(4)} ${symbol}`;
  return `${value.toFixed(6)} ${symbol}`;
}
