import {
  LatestArticlesResponse,
  LatestArticlesResponseZ,
} from "@/lib/types/PublicArticleTypes";

export const fetchLatestArticles =
  async (): Promise<LatestArticlesResponse | null> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CORE_API_URL}/articles/latest`
    );

    const data = await response.json();
    return LatestArticlesResponseZ.parse(data);
  };
