"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchComponent";
import { DynamicArticleCarousel } from "./ArticleCarousel";

interface Slide {
  title: string;
  overview: string;
  landingImage: string;
  articleId: string;
}

interface Carousel {
  category: string;
  slides: Slide[];
}

interface Article {
  title: string;
  datePublished: string;
  articleId: string;
  landingImage: string;
  keywords: string[];
  overview: string | null;
  img: string; // alias for landingImage
  organisation: {
    organisationName: string;
    organisationId: string;
  };
}

interface ArticlesClientProps {
  initialCarousels: Carousel[];
  initialCategories: string[];
  initialArticles: Article[];
  organisations?: { organisationId: string; organisationName: string }[];
}

export function ArticlesClient({
  initialCarousels,
  initialCategories,
  initialArticles,
}: ArticlesClientProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [carousels, setCarousels] = useState(initialCarousels);

  useEffect(() => {
    let updatedCarousels = [...initialCarousels];

    // Filter by selected keywords (categories)
    if (selectedCategories.length > 0) {
      updatedCarousels = updatedCarousels.filter(
        (carousel) =>
          carousel.category === "Trending" ||
          selectedCategories.includes(carousel.category)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filteredArticles = initialArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(lowerQuery) ||
          article.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
      );

      updatedCarousels = updatedCarousels
        .map((carousel) => ({
          ...carousel,
          slides: carousel.slides.filter((slide) =>
            filteredArticles.some((art) => art.articleId === slide.articleId)
          ),
        }))
        .filter((carousel) => carousel.slides.length > 0);
    }

    setCarousels(updatedCarousels);
  }, [selectedCategories, searchQuery, initialCarousels, initialArticles]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const hasNoResults = searchQuery && carousels.length === 0;

  return (
    <>
      <div className="mt-28 flex items-center justify-between">
        <h1 className="text-primary text-3xl font-extralight sm:text-5xl">
          Articles
        </h1>
        <div className="block sm:hidden">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex max-w-full items-center gap-6 overflow-x-auto whitespace-nowrap">
          <Button
            variant={"link"}
            className={`${selectedCategories.length === 0 ? "underline" : ""} px-0`}
            onClick={() => setSelectedCategories([])}
          >
            All
          </Button>
          {initialCategories.map((category) => (
            <Button
              key={category}
              variant={"link"}
              className={`${selectedCategories.includes(category) ? "underline" : ""} px-0`}
              onClick={() => toggleCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="hidden sm:block">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <section className="mt-16 mb-8 flex flex-col gap-12">
        {hasNoResults ? (
          <div className="text-muted-foreground text-center">
            No results found. Try a different search term.
          </div>
        ) : (
          carousels.map(({ category, slides }, index) => (
            <DynamicArticleCarousel
              key={`${category}-${index}`}
              category={category}
              slides={slides}
            />
          ))
        )}
      </section>
    </>
  );
}
