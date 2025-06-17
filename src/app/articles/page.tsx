/*import { Button } from "@/components/ui/button";
import SearchBar from "./SearchComponent";
import DynamicArticleCarousel from "./ArticleCarousel";
import { generateMetadata } from "@/lib/metadata";
import articleSchema, { Article } from "./Articles";

export const metadata = generateMetadata({
  title: "Articles | Inevitable Protocol",
  path: "/articles",
});

export default function Articles() {

  // Sort articles by date (latest first)
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

  // Get unique categories and limit to max 14 (for 15 total carousels including Trending)
  const uniqueCategories = Array.from(
    new Set(sortedArticles.flatMap((article) => article.category))
  ).slice(0, 14); // Limit to 14 categories

  // Map articles to slides by category
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
      <div className="flex items-center justify-between mt-28">
        <h1 className="sm:text-5xl text-3xl font-extralight text-primary">
          Articles
        </h1>

        <div className="sm:hidden block">
          <SearchBar />
        </div>
      </div>
      
      <div className="flex justify-between items-center gap-4 mt-6">
        <div className="flex items-center gap-6 max-w-full overflow-x-auto whitespace-nowrap">
          <Button variant={"link"} className="px-0">
            Category
          </Button>
          <Button variant={"link"} className="px-0">
            Category
          </Button>
          <Button variant={"link"} className="px-0">
            Category
          </Button>
          <Button variant={"link"} className="px-0">
            Category
          </Button>
          <Button variant={"link"} className="px-0">
            Category
          </Button>
        </div>

        <div className="sm:block hidden">
          <SearchBar />
        </div>
      </div>

      <section className="flex flex-col gap-12 mt-16 mb-8">
        {carousels.map(({ category, slides }, index) => (
          <DynamicArticleCarousel
            key={index}
            category={category}
            slides={slides}
          />
        ))}
      </section>
    </div>
  );
}*/

import articleSchema, { Article } from "./Articles";
import ArticlesClient from "./ArticlesClient";

import { headers } from "next/headers";
import type { Metadata } from "next";
import { metadata } from "@/lib/metadata"

export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
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
    keywords: metadata.keywords, 
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