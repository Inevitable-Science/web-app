"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SearchBar from "./SearchComponent";
import DynamicArticleCarousel from "./ArticleCarousel";
import { Article } from "./Articles";

interface ArticlesClientProps {
  initialCarousels: { category: string; slides: { img: string; title: string; description: string }[] }[];
  initialCategories: string[];
  initialArticles: Article[];
}

const ArticlesClient: React.FC<ArticlesClientProps> = ({
  initialCarousels,
  initialCategories,
  initialArticles,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [carousels, setCarousels] = useState(initialCarousels);

  // Update carousels based on category filter and search
  useEffect(() => {
    let updatedCarousels = [...initialCarousels];

    if (selectedCategories.length > 0) {
      updatedCarousels = updatedCarousels.filter((carousel) =>
        carousel.category === "Trending" || selectedCategories.some((cat) => carousel.category === cat)
      );
    }

    if (searchQuery) {
      const filteredArticles = initialArticles.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.overview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      updatedCarousels = updatedCarousels.map((carousel) => ({
        ...carousel,
        slides: carousel.slides.filter((slide) =>
          filteredArticles.some(
            (article) => article.title === slide.title && article.overview === slide.description
          )
        ),
      })).filter((carousel) => carousel.slides.length > 0);
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
      <div className="flex items-center justify-between mt-28">
        <h1 className="sm:text-5xl text-3xl font-extralight text-primary">Articles</h1>
        <div className="sm:hidden block">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 mt-6">
        <div className="flex items-center gap-6 max-w-full overflow-x-auto whitespace-nowrap">
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
        <div className="sm:block hidden">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <section className="flex flex-col gap-12 mt-16 mb-8">
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

export default ArticlesClient;