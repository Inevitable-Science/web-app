import { fetchTokenPrices } from "@/lib/queryFns/fetchTokenPrices";
import { TokenPriceResponse } from "@/lib/types/AnalyticTypes";
import { useQuery } from "@tanstack/react-query"

export const useFetchTokenPrices = (tokens: string[] | null) => {
  const enabled = (tokens && tokens.length > 0) ?? false;

  return useQuery<TokenPriceResponse>({
    queryKey: ["tokenPrices", tokens],
    queryFn: () => fetchTokenPrices(tokens!),
    enabled,
    staleTime: 3600000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
