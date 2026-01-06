// todo, maybe update lightweight charts and review the license of tv-lightweight-charts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  LineData,
  LineSeriesOptions,
} from "lightweight-charts";
import { Button } from "../ui/button";
import { useFetchMarketChart } from "@/hooks/queries/useFetchMarketChart";
import { MarketChartRangeType, PriceData } from "@/lib/queryFns/fetchMarketChart";

export function TokenChart({ tokenTicker }: { tokenTicker: string }) {
  const [latest24hPrice, setLatest24hPrice] = useState<number | null>(null);
  const [returns, setReturns] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<MarketChartRangeType>("1");

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const isMountedRef = useRef<boolean>(true);

  const { data: priceDataResponse, isLoading } = useFetchMarketChart(
    tokenTicker,
    timeRange
  );

  const priceData: PriceData = useMemo(() => {
    return {
      prices:
        priceDataResponse?.prices.map(
          ([timestamp, value]: [number, number]) => ({
            time: Math.floor(timestamp / 1000) as Time,
            value,
          })
        ) ?? [],
    };
  }, [priceDataResponse]);

  // set latest price on mount + data fetched
  useEffect(() => {
    if (isLoading || timeRange !== "1") return;

    const prices = priceData?.prices;
    if (prices && prices.length > 0) {
      const latestPrice = prices[prices.length - 1].value;
      setLatest24hPrice(latestPrice);
    }
  }, [tokenTicker, timeRange, isLoading]);

  // set and alter price returns on timeRange change and onSuccess
  useEffect(() => {
    const prices = priceData?.prices;
    if (prices && prices?.length > 0) {
      const returnData = calculateReturn(prices);
      setReturns(returnData ?? null);
    }
  }, [isLoading, timeRange]);

  // initialize and update chart
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

    // Update chart with data
    updateChart(timeRange);

    return () => {
      isMountedRef.current = false;
      chart.remove();
    };
  }, [tokenTicker, timeRange, isLoading]);

  // helper functions
  const formatClippedPrice = (value: number | null): string => {
    if (value === null || isNaN(value)) {
      return "--";
    }

    let clippedValue = Math.floor(value * 100) / 100;
    if (clippedValue === 0) {
      clippedValue = Math.floor(value * 10000) / 10000;
      if (clippedValue === 0) {
        clippedValue = Math.floor(value * 1000000) / 1000000;
      }
    }

    return clippedValue.toFixed(
      clippedValue < 0.01 ? (clippedValue < 0.0001 ? 6 : 4) : 2
    );
  };

  const calculateReturn = (data: LineData<Time>[]): number | null => {
    if (!data || data.length < 2) return null;

    const firstPrice = data[0].value;
    const lastPrice = data[data.length - 1].value;
    const returnPercentage = ((lastPrice - firstPrice) / firstPrice) * 100;

    return returnPercentage;
  };

  const updateChart = async (range: MarketChartRangeType) => {
    if (!isMountedRef.current) return;

    setTimeRange(range);
    const prices = priceData?.prices;
    if (isMountedRef.current && prices && prices.length > 0) {
      prices.sort((a, b) => (a.time as number) - (b.time as number));
      const uniquePrices = Array.from(
        new Map(prices.map((item) => [item.time, item])).values()
      );
      if (lineSeriesRef.current) {
        lineSeriesRef.current.setData(uniquePrices);
        chartRef.current?.timeScale().fitContent();
      }
    }
  };

  return (
    <div>
      <div className="mb-2 flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div>
          <div className="flex w-fit flex-col justify-center">
            <h3 className="text-xl">
              ${latest24hPrice ? formatClippedPrice(latest24hPrice) : "--"}
            </h3>
            {returns ? (
              <p
                className={`text-center text-sm ${returns > 0 ? "text-green-500" : "text-red-500"} `}
              >
                {returns > 0 ? `+${returns.toFixed(2)}` : returns.toFixed(2)}%
              </p>
            ) : (
              <p className="text-center text-sm">-%</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("1")}
            disabled={timeRange === "1"}
          >
            24h
          </Button>
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("7")}
            disabled={timeRange === "7" || (timeRange === "1" && isLoading)}
          >
            7d
          </Button>
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("30")}
            disabled={timeRange === "30" || (timeRange === "1" && isLoading)}
          >
            1m
          </Button>
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("365")}
            disabled={timeRange === "365" || (timeRange === "1" && isLoading)}
          >
            1y
          </Button>
          <Button
            variant={"graphRounded"}
            onClick={() => setTimeRange("max")}
            disabled={timeRange === "max" || (timeRange === "1" && isLoading)}
          >
            MAX
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="activeSkeleton h-[400px] w-full rounded-lg" />
      ) : (
        <>
          {priceData ? (
            <div
              ref={chartContainerRef}
              className="chartOverrideShow-token"
              style={{ width: "100%", height: "400px", maxHeight: "400px" }}
            />
          ) : (
            <div className="hitboxUTFD-chart">
              <h3>Unable to fetch data</h3>
              <h5>We are unable to fetch data for this token right now.</h5>
            </div>
          )}
        </>
      )}

      <style>{`
        #tv-attr-logo { display: none; }
      `}</style>
    </div>
  );
}
