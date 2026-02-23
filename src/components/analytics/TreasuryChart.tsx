"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  LineSeriesOptions,
  Time,
  LineData,
} from "lightweight-charts";
import { useFetchHistoricalTreasury } from "@/hooks/queries/useFetchHistoricalTreasury";

export function TreasuryChart({ daoName }: { daoName: string }) {
  const { data, isLoading, isError } = useFetchHistoricalTreasury(daoName);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const treasuryLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const assetLineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

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

    const treasurySeries = chart.addLineSeries({
      color: "#FBE8BD",
    } as LineSeriesOptions);
    const assetsSeries = chart.addLineSeries({
      color: "#BB4430",
    } as LineSeriesOptions);
    const totalAssetsSeries = chart.addLineSeries({
      color: "#2978A0",
    } as LineSeriesOptions);

    treasuryLineSeriesRef.current = treasurySeries;
    assetLineSeriesRef.current = assetsSeries;

    const transformData = (data: [number, number][]): LineData<Time>[] => {
      if (!Array.isArray(data)) return [];

      return data.map(([timestamp, value]) => ({
        time: (Number.isFinite(timestamp)
          ? Math.floor(timestamp / 1000)
          : 0) as Time,
        value: value ?? 0,
      }));
    };

    const historicalTreasuryData = transformData(data.historicalTreasury);
    const historicalAssetsData = transformData(data.historicalAssets);
    const totalAssetsData = transformData(data.totalAssets);

    treasurySeries.setData(historicalTreasuryData);
    assetsSeries.setData(historicalAssetsData);
    totalAssetsSeries.setData(totalAssetsData);

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [data, isLoading]);

  if (isLoading) {
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

  if (isError) {
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
        style={{
          width: "100%",
          height: "400px",
        }}
      />
      <style>{"#tv-attr-logo { display: none; }"}</style>

      <div
        className={`activeSkeleton h-[376px] w-full rounded-lg ${data ? "hidden" : "block"}`}
      />
    </>
  );
}
