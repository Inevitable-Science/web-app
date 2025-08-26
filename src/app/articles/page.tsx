import articleSchema, { Article } from "./Articles";
import ArticlesClient from "./ArticlesClient";

import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") || "http";
  const origin = `${proto}://${host}`;

  const fullPath = "/";
  const url = new URL(fullPath, origin);

  const imgUrl = `${origin}/assets/img/branding/seo_banner.png`;

  return {
    title: "Articles | Inevitable Protocol",
    description: metadata.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: "Articles | Inevitable Protocol",
      description: metadata.description,
      siteName: metadata.siteName,
      images: [
        {
          url: imgUrl,
          width: 700,
          height: 370,
          alt: "Inevitable preview image",
        },
      ],
      url: url,
      type: "website",
    },
    twitter: {
      title: "Articles | Inevitable Protocol",
      description: metadata.description,
      card: "summary_large_image",
      images: [imgUrl],
    },
    manifest: metadata.manifest,
  };
}

export default function Articles() {
  // Sort articles by date (latest first) on server
  const sortedArticles = [...articleSchema.articles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get trending slides (latest 3 articles)
  const trendingSlides = sortedArticles
    .slice(0, 3)
    .map((article: Article) => ({
      img: article.image,
      title: article.title,
      description: article.overview,
    }));

  const uniqueCategories = Array.from(
    new Set(sortedArticles.flatMap((article) => article.category))
  ).slice(0, 14); // Limit to 14 categories

  const categorySlides = uniqueCategories.map((category) => ({
    category,
    slides: sortedArticles
      .filter((article) => article.category.includes(category))
      .map((article: Article) => ({
        img: article.image,
        title: article.title,
        description: article.overview,
      })),
  }));

  // Combine Trending and Category carousels (max 15)
  const carousels = [
    { category: "Trending", slides: trendingSlides },
    ...categorySlides,
  ].slice(0, 15); // Limit to 15 carousels

  return (
    <div className="ctWrapper">
      <ArticlesClient
        initialCarousels={carousels}
        initialCategories={uniqueCategories}
        initialArticles={sortedArticles}
      />
    </div>
  );
}