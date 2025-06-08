"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  LineData,
  LineSeriesOptions,
} from "lightweight-charts";

interface TokenChartProps {
  organisation: string;
}

interface PriceData {
  prices: LineData<Time>[];
}

interface ReturnData {
  currentPrice: number;
  returnPercentage: number;
}

const cache = new Map<string, { data: PriceData; timestamp: number }>();

const TokenChart: React.FC<TokenChartProps> = ({ organisation }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [timeRange, setTimeRange] = useState<"1" | "7" | "30" | "365" | "max">("1");
  const [priceData, setPriceData] = useState<ReturnData | null>(null);
  const [dataFound, setDataFound] = useState<boolean>(true);
  const [latest24hPrice, setLatest24hPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetch24hPrice = async () => {
      const { prices } = await fetchData("1");
      if (prices?.length > 0) {
        const latestPrice = prices[prices.length - 1].value;
        setLatest24hPrice(latestPrice);
      }
    };
    fetch24hPrice();
  }, [organisation]);

  const fetchData = async (range: string): Promise<PriceData> => {
    try {
      const apiUrl = `https://api.profiler.bio/api/market-chart?id=${organisation}&days=${range}`;
      const cacheEntry = cache.get(apiUrl);
      const now = Date.now();
      if (cacheEntry && now - cacheEntry.timestamp < 5 * 60 * 1000) {
        return cacheEntry.data;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        setDataFound(false);
        return { prices: [] };
      }

      setDataFound(true);
      const data = await response.json();

      const processedData: PriceData = {
        prices: data?.prices?.map(([timestamp, value]: [number, number]) => ({
          time: Math.floor(timestamp / 1000) as Time,
          value,
        })) ?? [],
      };

      cache.set(apiUrl, { data: processedData, timestamp: now });
      return processedData;
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setDataFound(false);
      return { prices: [] };
    }
  };

  const calculateReturn = (data: LineData<Time>[]): ReturnData | null => {
    if (!data || data.length < 2) return null;

    const firstPrice = data[0].value;
    const lastPrice = data[data.length - 1].value;
    const returnPercentage = ((lastPrice - firstPrice) / firstPrice) * 100;

    return {
      currentPrice: lastPrice,
      returnPercentage,
    };
  };

  const updateChart = async (range: string) => {
    const { prices } = await fetchData(range);
    if (prices?.length > 0) {
      prices.sort((a, b) => (a.time as number) - (b.time as number));
      const uniquePrices = Array.from(new Map(prices.map((item) => [item.time, item])).values());
      if (lineSeriesRef.current) {
        lineSeriesRef.current.setData(uniquePrices);
        chartRef.current?.timeScale().fitContent();
      }

      const returnData = calculateReturn(prices);
      setPriceData(returnData);
    }
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: "#000000",
        background: { color: "transparent" },
      },
      grid: {
        vertLines: { color: "#e0e0e0", style: 0 },
        horzLines: { color: "#e0e0e0", style: 0 },
      },
      timeScale: { timeVisible: true, secondsVisible: true },
      autoSize: true,
    });

    chartRef.current = chart;

    if (lineSeriesRef.current) {
      lineSeriesRef.current = null;
    }

    const lineSeries = chart.addLineSeries({ color: "#2e2e2e" } as LineSeriesOptions);
    lineSeriesRef.current = lineSeries;

    updateChart(timeRange);

    return () => {
      chart.remove();
    };
  }, [organisation]);

  useEffect(() => {
    updateChart(timeRange);
  }, [timeRange, organisation]);

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

    return clippedValue.toFixed(clippedValue < 0.01 ? (clippedValue < 0.0001 ? 6 : 4) : 2);
  };

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <div className="priceFlexSkeleton-token">
          {priceData ? (
            <div className="flex flex-col justify-center w-fit">
              <h3 className="text-xl">${latest24hPrice ? formatClippedPrice(latest24hPrice) : "--"}</h3>
              <p className={`
                text-sm
                ${priceData.returnPercentage > 0 ? "text-green-500" : "text-red-500"}
              `}>
                {priceData.returnPercentage > 0
                  ? `+${priceData.returnPercentage.toFixed(2)}`
                  : priceData.returnPercentage.toFixed(2)}
                %
              </p>
            </div>
          ) : (
            <div className="centerTopFlex-token">
              <h3>$--</h3>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:background-color"
            onClick={() => setTimeRange("1")}
            disabled={timeRange === "1"}
          >
            24h
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:background-color"
            onClick={() => setTimeRange("7")}
            disabled={timeRange === "7"}
          >
            7d
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:!background-color"
            onClick={() => setTimeRange("30")}
            disabled={timeRange === "30"}
          >
            1m
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:background-color"
            onClick={() => setTimeRange("365")}
            disabled={timeRange === "365"}
          >
            1y
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:background-color"
            onClick={() => setTimeRange("max")}
            disabled={timeRange === "max"}
          >
            MAX
          </button>
        </div>
      </div>

      {dataFound ? (
        <div
          ref={chartContainerRef}
          className="chartOverrideShow-token"
          style={{ width: "100%", height: "400px" }}
        />
      ) : (
        <div className="hitboxUTFD-chart">
          <h3>Unable to fetch data</h3>
          <h5>We are unable to fetch data for this token right now.</h5>
        </div>
      )}

      <style>{`
        #tv-attr-logo { display: none; }
      `}</style>
    </div>
  );
};

export default TokenChart;