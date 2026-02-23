import {
  LatestArticlesResponse,
  LatestArticlesResponseZ,
} from "@/lib/types/PublicArticleTypes";

export const fetchLatestArticles =
  async (): Promise<LatestArticlesResponse | null> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/articles/latest`
    );

    const data = await response.json();
    return LatestArticlesResponseZ.parse(data);
  };
