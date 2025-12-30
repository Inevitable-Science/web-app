import {
  fetchMarketChartData,
  PriceData,
  MarketChartRangeType,
} from "@/lib/api/fetchMarketChart";
import { MarketChartResponse } from "@/lib/types/AnalyticTypes";
import { useQuery } from "@tanstack/react-query";

export const useFetchMarketChart = (
  tokenName: string,
  range: MarketChartRangeType
) => {
  const enabled = !!tokenName && !!range;

  return useQuery<MarketChartResponse>({
    queryKey: ["market_chart", tokenName, range],
    queryFn: () => fetchMarketChartData(tokenName!, range!),
    enabled,
    staleTime: 3600000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
