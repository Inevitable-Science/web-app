import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useAuthToken } from "@/store/AdminAuthStore";
import { fetchArticle } from "@/lib/api/admin/fetchArticle";
import { ArticleResponse } from "@/lib/types/AdminArticleTypes";

export const useAdminArticleQuery = () => {
  const params = useParams();
  const articleId = params.articleId as string | undefined;

  const { authToken } = useAuthToken();

  const enabled = !!articleId && !!authToken;

  return useQuery<ArticleResponse, Error>({
    queryKey: ["article", articleId],
    queryFn: () => fetchArticle(articleId!, authToken!),
    enabled,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};