"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, LineSeriesOptions, Time, LineData } from "lightweight-charts";

interface TreasuryChartProps {
  organisation: string;
}

interface ChartData {
  historical_treasury: [number, number][];
  historical_assets: [number, number][];
  total_assets: [number, number][];
}

const TreasuryChart: React.FC<TreasuryChartProps> = ({ organisation }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const treasuryLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const assetLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        //const response = await fetch(`https://api.profiler.bio/api/historical/treasury/${organisation}`);
        const response = await fetch(`https://inev.profiler.bio/charts/treasury/${organisation}`);
        const jsonData: ChartData = await response.json();
        setData(jsonData);
      } catch (error) {
        setError(true);
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [organisation]);

  useEffect(() => {
    if (!chartContainerRef.current || !data) return;

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
        timeVisible: false,
        secondsVisible: false,
      },
      autoSize: true,
    });
    chartRef.current = chart;

    const treasurySeries = chart.addLineSeries({ color: "#FBE8BD" } as LineSeriesOptions);
    const assetsSeries = chart.addLineSeries({ color: "#BB4430" } as LineSeriesOptions);
    const totalAssetsSeries = chart.addLineSeries({ color: "#2978A0" } as LineSeriesOptions);

    treasuryLineSeriesRef.current = treasurySeries;
    assetLineSeriesRef.current = assetsSeries;

    const transformData = (data: [number, number][]): LineData<Time>[] => {
      if (!Array.isArray(data)) return [];

      return data.map(([timestamp, value]) => ({
        time: (Number.isFinite(timestamp) ? Math.floor(timestamp / 1000) : 0) as Time,
        value: value ?? 0,
      }));
    };

    const historicalTreasuryData = transformData(data.historical_treasury);
    const historicalAssetsData = transformData(data.historical_assets);
    const totalAssetsData = transformData(data.total_assets);

    treasurySeries.setData(historicalTreasuryData);
    assetsSeries.setData(historicalAssetsData);
    totalAssetsSeries.setData(totalAssetsData);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [data]);

  if (loading) {
    return (
      <div className="chart4532LoadingSkeleton-dao">
        <style>{`
          .chart4532LoadingSkeleton-dao {
            background: linear-gradient(
              100deg,
              rgba(255, 255, 255, 0) 40%,
              #e0e0e0 50%,
              rgba(255, 255, 255, 0) 60%
            ) #2b2b2b;
            background-size: 200% 100%;
            background-position-x: 180%;
            animation: 1s loading ease-in-out infinite;
            height: 400px;
            width: 100%;
            border-radius: 10px;
          }

          @keyframes loading {
            to {
              background-position-x: -20%;
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chartNF-token-dao chartNF-token2-dao">
        <h4>Chart data unavailable</h4>
        <style>{`
          .chartNF-token2-dao {
            flex-wrap: wrap;
            gap: 12px;
          }

          .chartNF-token-dao {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div
        ref={chartContainerRef}
        className={data ? "opacity-1" : "opacity-0 !h-[1px]"}
        style={{
          width: "100%",
          height: "400px",
        }}
      />
      <style>{"#tv-attr-logo { display: none; }"}</style>

      <div className={`activeSkeleton w-full h-[376px] rounded-lg ${data ? "hidden" : "block"}`} />
    </>
  );
};

export default TreasuryChart;