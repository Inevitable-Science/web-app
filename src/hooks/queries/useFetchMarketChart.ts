import { fetchMarketChartData, PriceData, MarketChartRangeType } from "@/lib/api/fetchMarketChart";
import { useQuery } from "@tanstack/react-query"


export const useFetchMarketChart = (tokenName: string, range: MarketChartRangeType) => {
  const enabled = !!tokenName && !!range;

  return useQuery<PriceData>({
    queryKey: ["market_chart", tokenName, range],
    queryFn: () => fetchMarketChartData(tokenName!, range!),
    enabled,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
};