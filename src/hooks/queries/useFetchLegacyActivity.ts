import { fetchLegacyActivity } from "@/lib/api/fetchLegacyActivity";
import { keepPreviousData, useQuery } from "@tanstack/react-query";


export const useFetchLegacyActivity = (daoName?: string, page?: number) => {
  const enabled = !!daoName && page !== undefined;

  return useQuery({
    queryKey: ["legacy_activity", daoName, page],
    queryFn: () => fetchLegacyActivity(daoName!, page!),
    enabled,
    staleTime: 3600000,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: keepPreviousData,
  })
}