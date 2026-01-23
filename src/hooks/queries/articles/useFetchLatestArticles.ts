import { fetchLatestArticles } from "@/lib/queryFns/articles/fetchLatestArticles";
import { useQuery } from "@tanstack/react-query";

export const useFetchLatestArticles = () => {
  return useQuery({
    queryKey: ["latest_articles"],
    queryFn: () => fetchLatestArticles(),
    staleTime: 3600000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};
