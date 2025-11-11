"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./SearchComponent";
import { DynamicArticleCarousel } from "./ArticleCarousel";
import { Article } from "./Articles";

interface ArticlesClientProps {
  initialCarousels: {
    category: string;
    slides: { img: string; title: string; description: string }[];
  }[];
  initialCategories: string[];
  initialArticles: Article[];
}

export function ArticlesClient({
  initialCarousels,
  initialCategories,
  initialArticles,
}: ArticlesClientProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [carousels, setCarousels] = useState(initialCarousels);

  // Update carousels based on category filter and search
  useEffect(() => {
    let updatedCarousels = [...initialCarousels];

    if (selectedCategories.length > 0) {
      updatedCarousels = updatedCarousels.filter(
        (carousel) =>
          carousel.category === "Trending" ||
          selectedCategories.some((cat) => carousel.category === cat)
      );
    }

    if (searchQuery) {
      const filteredArticles = initialArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      updatedCarousels = updatedCarousels
        .map((carousel) => ({
          ...carousel,
          slides: carousel.slides.filter((slide) =>
            filteredArticles.some(
              (article) =>
                article.title === slide.title &&
                article.overview === slide.description
            )
          ),
        }))
        .filter((carousel) => carousel.slides.length > 0);
    }

    setCarousels(updatedCarousels);
  }, [selectedCategories, searchQuery, initialCarousels, initialArticles]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  // Check if there are no results
  const hasNoResults = searchQuery && carousels.length === 0;

  return (
    <>
      <div className="mt-28 flex items-center justify-between">
        <h1 className="text-3xl font-extralight text-primary sm:text-5xl">
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

      <section className="mb-8 mt-16 flex flex-col gap-12">
        {hasNoResults ? (
          <div className="text-center text-muted-foreground">
            No results found. Try a different search term.
          </div>
        ) : (
          carousels.map(({ category, slides }, index) => (
            <DynamicArticleCarousel
              key={index}
              category={category}
              slides={slides}
            />
          ))
        )}
      </section>
    </>
  );
};
