import { headers } from "next/headers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { metadata } from "@/lib/metadata";
import { ArticlesClient } from "./ArticlesClient";
import {
  AllArticlesResponse,
  AllArticlesResponseZ,
} from "@/lib/types/PublicArticleTypes";

const fetchArticles = async (): Promise<AllArticlesResponse | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CORE_API_URL}/articles`
    );

    const data = await response.json();
    const parsedData = AllArticlesResponseZ.parse(data);

    return parsedData;
  } catch (err) {
    console.error(err);
    return null;
  }
};

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  return {
    title: "Articles | Inevitable Science",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Articles | Inevitable Science",
      description: metadata.description,
      siteName: metadata.siteName,
      images: [
        {
          url: "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
          width: 700,
          height: 370,
          alt: "Inevitable preview image",
        },
      ],
      url: url,
      type: "website",
    },
    twitter: {
      title: "Articles | Inevitable Science",
      description: metadata.description,
      card: "summary_large_image",
      images: [
        "https://cdn.inevitable.science/static/img/branding/seo_banner.png",
      ],
    },
  };
}

export default async function Articles() {
  const articlesResponse = await fetchArticles();
  const articles = articlesResponse?.data;

  if (!articles) {
    return notFound();
  }

  // Sort articles by datePublished (latest first)
  const sortedArticles = [...articles].sort(
    (a, b) =>
      new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
  );

  // Get trending slides (latest 3 articles)
  const trendingSlides = sortedArticles.slice(0, 3).map((article) => ({
    landingImage: article.landingImage,
    title: article.title,
    overview: article.overview ?? "",
    articleId: article.articleId,
  }));

  // Get unique keywords (as categories), limit to 14
  const uniqueKeywords = Array.from(
    new Set(sortedArticles.flatMap((article) => article.keywords))
  ).slice(0, 14);

  // Create carousels for each keyword
  const keywordCarousels = uniqueKeywords.map((keyword) => ({
    category: keyword,
    slides: sortedArticles
      .filter((article) => article.keywords.includes(keyword))
      .map((article) => ({
        landingImage: article.landingImage,
        title: article.title,
        overview: article.overview ?? "",
        articleId: article.articleId,
      })),
  }));

  // Combine Trending + Keyword carousels (max 15 total)
  const carousels = [
    { category: "Trending", slides: trendingSlides },
    ...keywordCarousels,
  ].slice(0, 15);

  // Extract unique organisations (you already had this logic)
  const organisations =
    articles
      ?.map((article) => ({
        organisationId: article.organisation.organisationId,
        organisationName: article.organisation.organisationName,
      }))
      .filter(
        (org, index, self) =>
          index ===
          self.findIndex((o) => o.organisationId === org.organisationId)
      ) ?? [];

  return (
    <div className="ctWrapper">
      <ArticlesClient
        initialCarousels={carousels}
        initialCategories={uniqueKeywords}
        initialArticles={sortedArticles.map((article) => ({
          ...article,
          img: article.landingImage,
        }))}
        organisations={organisations}
      />
    </div>
  );
}
