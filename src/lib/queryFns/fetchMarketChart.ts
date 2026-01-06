import { LineData, Time } from "lightweight-charts";
import { MarketChartResponseZ } from "../types/AnalyticTypes";

export interface PriceData {
  prices: LineData<Time>[];
}

export type MarketChartRangeType = "1" | "7" | "30" | "365" | "max";

export const fetchMarketChartData = async (
  tokenName: string,
  range: MarketChartRangeType
) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/token/chart/market_chart/${tokenName}/${range}`;

  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("Failed to fetch market chart data");

  const data = await response.json();
  return MarketChartResponseZ.parse(data);
};
