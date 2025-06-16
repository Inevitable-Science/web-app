import { Button } from "@/components/ui/button";
import SearchBar from "./SearchComponent";
import DynamicArticleCarousel from "./ArticleCarousel";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Articles | Inevitable Protocol",
  path: "/articles",
});

export default function Articles() {
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
        <DynamicArticleCarousel category="Trending" />

        <DynamicArticleCarousel />

        <DynamicArticleCarousel />
      </section>
    </div>
  );
}