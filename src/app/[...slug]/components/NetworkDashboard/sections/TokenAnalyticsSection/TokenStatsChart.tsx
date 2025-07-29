/*"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  LineData,
  LineSeriesOptions,
} from "lightweight-charts";

interface TokenStatsProps {
  organisation: string;
  tokenName: string;
}

interface ChartData {
  time: Time;
  value: number;
}

const cache = new Map<string, { data: ChartData[] | null; timestamp: number }>();

const TokenStatsChart: React.FC<TokenStatsProps> = ({ organisation, tokenName }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [timeRange, setTimeRange] = useState<"1" | "7" | "30" | "365" | "max">("1");
  const [chartType, setChartType] = useState<"volume" | "holders" | "marketCap">("volume");
  const [dataFound, setDataFound] = useState<boolean>(true);

  const fetchData = async (range: string, type: string): Promise<ChartData[] | null> => {
    try {
      const apiUrl =
        type === "marketCap" || type === "volume"
          ? `https://api.profiler.bio/api/market-chart?id=${organisation}&days=${range}`
          : `https://api.profiler.bio/api/holders/${tokenName}`;

      const cacheKey = `${organisation}-${tokenName}-${range}-${type}`;
      const cacheEntry = cache.get(cacheKey);
      if (cacheEntry && Date.now() - cacheEntry.timestamp < 5 * 60 * 1000) {
        setDataFound(!!cacheEntry.data);
        return cacheEntry.data;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        setDataFound(false);
        return null;
      }

      setDataFound(true);
      const data = await response.json();

      const seriesData = (
        type === "marketCap" ? data?.market_caps : type === "volume" ? data?.total_volumes : data?.holders
      )?.map(([timestamp, value]: [number, number]) => ({
        time: Math.floor(timestamp / 1000) as Time,
        value,
      })) ?? null;

      cache.set(cacheKey, { data: seriesData, timestamp: Date.now() });
      return seriesData;
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataFound(false);
      return null;
    }
  };

  const updateChart = async (range: string, type: string) => {
    const prices = await fetchData(range, type);

    if (Array.isArray(prices) && prices.length > 0) {
      prices.sort((a, b) => (a.time as number) - (b.time as number));
      const uniquePrices = Array.from(new Map(prices.map((item) => [item.time, item])).values());
      if (lineSeriesRef.current) {
        lineSeriesRef.current.setData(uniquePrices);
        chartRef.current?.timeScale().fitContent();
      }
    } else {
      setDataFound(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth;
        chartRef.current.resize(width, 400);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;

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

    const lineSeries = chart.addLineSeries({ color: "#FBE8BD" } as LineSeriesOptions);
    lineSeriesRef.current = lineSeries;

    updateChart(timeRange, chartType);

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [organisation, tokenName]);

  useEffect(() => {
    if (chartType === "holders") {
      setTimeRange("365");
    }
    updateChart(timeRange, chartType);
  }, [timeRange, chartType, organisation, tokenName]);

  return (
    <div>
      <div className="flex items-center justify-between gap-x-6 gap-y-2 flex-wrap w-full mb-4">
        <div className="flex items-center flex-wrap gap-2">
          <button
            className="cursor-pointer text-sm border-b border-transparent py-2 px-2 font-light text-muted-foreground disabled:text-[var(--foreground)] disabled:font-normal disabled:border-primary disabled:cursor-auto"
            onClick={() => setChartType("volume")}
            disabled={chartType === "volume"}
          >
            VOL
          </button>
          <button
            className="cursor-pointer text-sm border-b border-transparent py-2 px-2 font-light text-muted-foreground disabled:text-[var(--foreground)] disabled:font-normal disabled:border-primary disabled:cursor-auto"
            onClick={() => setChartType("holders")}
            disabled={chartType === "holders"}
          >
            HOLDERS
          </button>
          <button
            className="cursor-pointer text-sm border-b border-transparent py-2 px-2 font-light text-muted-foreground disabled:text-[var(--foreground)] disabled:font-normal disabled:border-primary disabled:cursor-auto"
            onClick={() => setChartType("marketCap")}
            disabled={chartType === "marketCap"}
          >
            MARKET CAP
          </button>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("1")}
            disabled={chartType === "holders" || timeRange === "1"}
          >
            24h
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("7")}
            disabled={chartType === "holders" || timeRange === "7"}
          >
            7d
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("30")}
            disabled={chartType === "holders" || timeRange === "30"}
          >
            1m
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("365")}
            disabled={timeRange === "365"}
          >
            1y
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("max")}
            disabled={chartType === "holders" || timeRange === "max"}
          >
            MAX
          </button>
        </div>
      </div>

      {dataFound ? (
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

      <style>{`
        #tv-attr-logo { display: none; }
      `}</style>
    </div>
  );
};

export default TokenStatsChart;*/

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

interface TokenStatsProps {
  organisation: string;
  tokenName: string;
}

interface ChartData {
  time: Time;
  value: number;
}

const cache = new Map<string, { data: ChartData[] | null; timestamp: number }>();

const TokenStatsChart: React.FC<TokenStatsProps> = ({ organisation, tokenName }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [timeRange, setTimeRange] = useState<"1" | "7" | "30" | "365" | "max">("1");
  const [chartType, setChartType] = useState<"volume" | "holders" | "marketCap">("volume");
  const [dataFound, setDataFound] = useState<boolean>(true);
  const [passedData, setPassedData] = useState<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const fetchData = async (range: string, type: string): Promise<ChartData[] | null> => {
    try {
      const apiUrl =
        type === "marketCap" || type === "volume"
        //  ? `https://api.profiler.bio/api/market-chart?id=${organisation}&days=${range}`
        //  : `https://api.profiler.bio/api/holders/${tokenName}`;
          ? `https://inev.profiler.bio/chart/${organisation}-${range}`
          : `https://inev.profiler.bio/charts/holders/${tokenName}`;


      const cacheKey = `${organisation}-${tokenName}-${range}-${type}`;
      const cacheEntry = cache.get(cacheKey);
      if (cacheEntry && Date.now() - cacheEntry.timestamp < 5 * 60 * 1000) {
        setDataFound(!!cacheEntry.data);
        return cacheEntry.data;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) {
        setDataFound(false);
        return null;
      }

      setDataFound(true);
      const data = await response.json();

      const seriesData = (
        type === "marketCap" ? data?.market_caps : type === "volume" ? data?.total_volumes : data?.holders
      )?.map(([timestamp, value]: [number, number]) => ({
        time: Math.floor(timestamp / 1000) as Time,
        value,
      })) ?? null;

      cache.set(cacheKey, { data: seriesData, timestamp: Date.now() });
      return seriesData;
    } catch (error) {
      console.error("Error fetching data:", error);
      setDataFound(false);
      return null;
    } finally {
      setPassedData(true);
    }
  };

  const updateChart = async (range: string, type: string) => {
    if (!isMountedRef.current) return; // Prevent updates if unmounted

    const prices = await fetchData(range, type);

    if (isMountedRef.current && Array.isArray(prices) && prices.length > 0) {
      prices.sort((a, b) => (a.time as number) - (b.time as number));
      const uniquePrices = Array.from(new Map(prices.map((item) => [item.time, item])).values());
      if (lineSeriesRef.current) {
        lineSeriesRef.current.setData(uniquePrices);
        chartRef.current?.timeScale().fitContent();
      }
    } else {
      setDataFound(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth;
        chartRef.current.resize(width, 400);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial resize

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    const lineSeries = chart.addLineSeries({ color: "#FBE8BD" } as LineSeriesOptions);
    lineSeriesRef.current = lineSeries;

    // Adjust timeRange for holders chart
    const effectiveTimeRange = chartType === "holders" ? "365" : timeRange;
    setTimeRange(effectiveTimeRange); // Update state to reflect forced timeRange for holders

    // Update chart with data
    updateChart(effectiveTimeRange, chartType);

    return () => {
      isMountedRef.current = false;
      chart.remove();
      chartRef.current = null;
      lineSeriesRef.current = null;
    };
  }, [organisation, tokenName, chartType, timeRange]); // Include all relevant dependencies

  return (
    <div>
      <div className="flex items-center justify-between gap-x-6 gap-y-2 flex-wrap w-full mb-4">
        <div className="flex items-center flex-wrap gap-2">
          <button
            className="cursor-pointer text-sm border-b border-transparent py-2 px-2 font-light text-muted-foreground disabled:text-[var(--foreground)] disabled:font-normal disabled:border-primary disabled:cursor-auto"
            onClick={() => setChartType("volume")}
            disabled={chartType === "volume"}
          >
            VOL
          </button>
          <button
            className="cursor-pointer text-sm border-b border-transparent py-2 px-2 font-light text-muted-foreground disabled:text-[var(--foreground)] disabled:font-normal disabled:border-primary disabled:cursor-auto"
            onClick={() => setChartType("holders")}
            disabled={chartType === "holders"}
          >
            HOLDERS
          </button>
          <button
            className="cursor-pointer text-sm border-b border-transparent py-2 px-2 font-light text-muted-foreground disabled:text-[var(--foreground)] disabled:font-normal disabled:border-primary disabled:cursor-auto"
            onClick={() => setChartType("marketCap")}
            disabled={chartType === "marketCap"}
          >
            MARKET CAP
          </button>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("1")}
            disabled={chartType === "holders" || timeRange === "1"}
          >
            24h
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("7")}
            disabled={chartType === "holders" || timeRange === "7"}
          >
            7d
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("30")}
            disabled={chartType === "holders" || timeRange === "30"}
          >
            1m
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("365")}
            disabled={timeRange === "365"}
          >
            1y
          </button>
          <button
            className="h-fit min-w-[28px] rounded border-none rounded-full px-2 py-1 text-sm uppercase cursor-pointer disabled:bg-[var(--background)] disabled:cursor-auto"
            onClick={() => setTimeRange("max")}
            disabled={chartType === "holders" || timeRange === "max"}
          >
            MAX
          </button>
        </div>
      </div>

        <div
          ref={chartContainerRef}
          className={dataFound ? "" : "hidden"}
          style={{ width: "100%", height: "400px", maxHeight: "400px" }}
        />

        <div className={`${dataFound ? "hidden" : ""} text-center my-12 font-light`}>
          <h3>Unable to fetch data</h3>
          <h5>We are unable to fetch data for this token right now.</h5>
        </div>

      {/*{dataFound ? (
        <div
          ref={chartContainerRef}
          className={`chartOverrideShow-token ${passedData ? "opacity-1" : "opacity-0 !h-[1px]"}`}
          style={{ width: "100%", height: "400px", maxHeight: "400px" }}
        />
      ) : (
        <div className="hitboxUTFD-chart">
          <h3>Unable to fetch data</h3>
          <h5>We are unable to fetch data for this token right now.</h5>
        </div>
      )}*/}

      <div className={`activeSkeleton w-full h-[376px] rounded-lg ${passedData ? "hidden" : "block"}`} />

      <style>{`
        #tv-attr-logo { display: none; }
      `}</style>
    </div>
  );
};

export default TokenStatsChart;