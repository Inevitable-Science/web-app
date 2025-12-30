import { fetchHistoricalHolders } from "@/lib/api/fetchHistoricalHolders";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export const useFetchHistoricalHolders = (
  tokenName: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["historical_holders", tokenName],
    queryFn: () => fetchHistoricalHolders(tokenName!),
    enabled: !!tokenName && enabled,
    staleTime: 3600000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
