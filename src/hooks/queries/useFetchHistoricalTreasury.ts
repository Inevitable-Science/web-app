import { fetchHistoricalTreasury } from "@/lib/api/fetchHistoricalTreasury";
import { HistoricalTreasuryResponse } from "@/lib/types/AnalyticTypes";
import { useQuery } from "@tanstack/react-query";

export const useFetchHistoricalTreasury = (daoName: string) => {
  const enabled = !!daoName;

  return useQuery<HistoricalTreasuryResponse>({
    queryKey: ["historical_treasury", daoName],
    queryFn: () => fetchHistoricalTreasury(daoName!),
    enabled,
    staleTime: 3600000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
