"use client";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeriesOptions,
  Time,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { useFetchHistoricalHolders } from "@/hooks/queries/useFetchHistoricalHolders";
import { useFetchMarketChart } from "@/hooks/queries/useFetchMarketChart";
import { MarketChartRangeType } from "@/lib/queryFns/fetchMarketChart";

type ChartType = "volume" | "holders" | "marketCap";

export function TokenStatsChart({ tokenTicker }: { tokenTicker: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const [chartType, setChartType] = useState<ChartType>("volume");
  const [timeRange, setTimeRange] = useState<MarketChartRangeType>("1");
  const [prices, setPrices] = useState<
    { time: Time; value: number }[] | null
  >();

  const {
    data: holdersData,
    isFetching: isHoldersDataFetching,
    isError: isHoldersDataError,
  } = useFetchHistoricalHolders(tokenTicker, chartType === "holders");
  const {
    data: marketData,
    isFetching: isMarketDataFetching,
    isError: isMarketDataError,
  } = useFetchMarketChart(tokenTicker, timeRange);

  const isLoading = isMarketDataFetching || isHoldersDataFetching;

  useEffect(() => {
    if (
      !isMountedRef.current ||
      !lineSeriesRef.current ||
      !Array.isArray(prices) ||
      prices.length === 0
    ) {
      return;
    }

    const sorted = [...prices].sort(
      (a, b) => (a.time as number) - (b.time as number)
    );

    const uniquePrices = Array.from(
      new Map(sorted.map((item) => [item.time, item])).values()
    );

    lineSeriesRef.current.setData(uniquePrices);
    chartRef.current?.timeScale().fitContent();
  }, [prices, isLoading]);

  useEffect(() => {
    let prices;

    if (chartType === "holders") {
      const seriesData = (() => {
        if (!holdersData?.holders) return null;

        const mapped = holdersData.holders.map(([timestamp, value]: [number, number]) => ({
          time: Math.floor(timestamp / 1000) as Time,
          value,
          date: new Date(timestamp),
        }));

        const latestTime = Math.max(...mapped.map((d) => Number(d.time)));

        const filtered = mapped.filter(({ date, time }) => {
          const isFirstOfMonth = date.getUTCDate() === 1;
          const isLatest = time === latestTime;
          return isFirstOfMonth || isLatest;
        });

        return filtered.map(({ time, value }) => ({ time, value }));
      })();

      prices = seriesData;
    } else {
      if (!marketData) return;

      const seriesData =
        (chartType === "marketCap"
          ? marketData.market_caps
          : marketData.total_volumes
        ).map(([timestamp, value]: [number, number]) => ({
          time: Math.floor(timestamp / 1000) as Time,
          value,
        })) ?? null;

      prices = seriesData;
    }

    if (prices) {
      prices.sort((a, b) => (a.time as number) - (b.time as number));
      const uniquePrices = Array.from(
        new Map(prices.map((item) => [item.time, item])).values()
      );

      setPrices(prices);
    }
  }, [chartType, timeRange, holdersData, marketData]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Reset mounted flag
    isMountedRef.current = true;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: "#ffffff",
        background: { color: "transparent" },
      },
      grid: {
        vertLines: { color: "#606060", style: 0 },
        horzLines: { color: "#606060", style: 0 },
      },
      crosshair: {
        vertLine: {
          color: "#7B7B7B",
          labelBackgroundColor: "#2e2e2e",
        },
        horzLine: {
          color: "#7B7B7B",
          labelBackgroundColor: "#2e2e2e",
        },
      },
      rightPriceScale: {
        borderColor: "#7B7B7B",
      },
      timeScale: {
        borderColor: "#7B7B7B",
        fixLeftEdge: true,
        fixRightEdge: true,
        timeVisible: true,
        secondsVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });
    chartRef.current = chart;

    // Create line series
    const lineSeries = chart.addLineSeries({
      color: "#FBE8BD",
    } as LineSeriesOptions);
    lineSeriesRef.current = lineSeries;

    // Adjust timeRange for holders chart
    const effectiveTimeRange = chartType === "holders" ? "365" : timeRange;
    setTimeRange(effectiveTimeRange); // Update state to reflect forced timeRange for holders

    return () => {
      isMountedRef.current = false;
      chart.remove();
      chartRef.current = null;
      lineSeriesRef.current = null;
    };
  }, [holdersData, marketData, isLoading]);

  return (
    <div>
      <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="text-muted-foreground disabled:border-primary cursor-pointer border-b border-transparent px-2 py-2 text-sm font-light disabled:cursor-auto disabled:font-normal disabled:text-(--foreground)"
            onClick={() => setChartType("volume")}
            disabled={chartType === "volume"}
          >
            VOL
          </button>
          <button
            className="text-muted-foreground disabled:border-primary cursor-pointer border-b border-transparent px-2 py-2 text-sm font-light disabled:cursor-auto disabled:font-normal disabled:text-(--foreground)"
            onClick={() => setChartType("holders")}
            disabled={chartType === "holders"}
          >
            HOLDERS
          </button>
          <button
            className="text-muted-foreground disabled:border-primary cursor-pointer border-b border-transparent px-2 py-2 text-sm font-light disabled:cursor-auto disabled:font-normal disabled:text-(--foreground)"
            onClick={() => setChartType("marketCap")}
            disabled={chartType === "marketCap"}
          >
            MARKET CAP
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("1")}
            disabled={chartType === "holders" || timeRange === "1"}
          >
            24h
          </Button>
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("7")}
            disabled={chartType === "holders" || timeRange === "7"}
          >
            7d
          </Button>
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("30")}
            disabled={chartType === "holders" || timeRange === "30"}
          >
            1m
          </Button>
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("365")}
            disabled={chartType === "holders" || timeRange === "365"}
          >
            1y
          </Button>
          <Button
            variant={"graphRounded"}
            className={`${chartType === "holders" && "bg-white! text-black!"} disabled:bg-transparent`}
            disabled
          >
            MAX
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="activeSkeleton h-[376px] w-full rounded-lg" />
      ) : (
        <>
          {(chartType === "holders" && isHoldersDataError) ||
          isMarketDataError ? (
            <div className="hitboxUTFD-chart">
              <h3>Unable to fetch data</h3>
              <h5>We are unable to fetch data for this token right now.</h5>
            </div>
          ) : (
            <div
              ref={chartContainerRef}
              //className={`chartOverrideShow-token ${passedData ? "opacity-1" : "h-px! opacity-0"}`}
              style={{ width: "100%", height: "400px", maxHeight: "400px" }}
            />
          )}
        </>
      )}

      <style>{`
        #tv-attr-logo { display: none; }
      `}</style>
    </div>
  );
}
