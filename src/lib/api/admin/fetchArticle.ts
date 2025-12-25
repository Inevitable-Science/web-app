import { ArticleResponse, ArticleResponseZ } from "../../types/AdminArticleTypes";

export const fetchArticle = async (
  articleId: string,
  authToken: string
): Promise<ArticleResponse> => {
  if (!articleId) throw new Error("Missing articleId");
  if (!authToken) throw new Error("Missing authToken");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/article/fetch/${articleId}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    // Optional: include status for better error handling
    throw new Error(`Failed to fetch article: ${res.status}`);
  }

  const data = await res.json();
  return ArticleResponseZ.parse(data);
};
