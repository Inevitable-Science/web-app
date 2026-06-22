import { fetchOfacStatus } from "@/lib/queryFns/fetchOfacStatus";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export const useFetchOfacStatus = (address: Address) => {
  return useQuery({
    queryKey: ["ofac_status", address],
    queryFn: () => fetchOfacStatus(address),
    enabled: !!address,
    staleTime: 3600000,
    retry: 3,
    retryDelay: (failureCount) => Math.min(1000 * 2 ** failureCount, 30000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })
};
