import { Button } from "@/components/ui/button";
import { useKeywords, useTags } from "@/store/ArticleEditorStore";

export function KeywordTable() {
  const { keywords, setKeywords } = useKeywords();
  const hasKeywordEmpty = keywords.find((keyword) => keyword === "");

  return (
    <div className="bg-grey-450 flex w-full flex-col gap-2 rounded-lg border-none p-2 font-light">
      <h4>Keywords</h4>
      {keywords.map((keyword, index) => (
        <input
          key={index}
          className="background-color placeholder:text-muted-foreground focus:ring-cerulean focus:ring-offset-grey-450 w-full rounded-lg border-none p-2 text-sm font-light outline-hidden transition-shadow focus:ring-2 focus:ring-offset-2"
          type="text"
          placeholder={`Keyword ${index + 1}`}
          value={keyword}
          onChange={(e) =>
            setKeywords((prev) => {
              const newKeywords = [...prev];
              newKeywords[index] = e.target.value;
              return newKeywords;
            })
          }
        />
      ))}
      <Button
        className="background-color hover:background-color"
        onClick={() => setKeywords((prev) => [...prev, ""])}
        disabled={hasKeywordEmpty !== undefined || keywords.length >= 4}
      >
        Add Keyword
      </Button>
    </div>
  );
}

export function TagsTable() {
  const { tags, setTags } = useTags();
  const hasTagEmpty = tags.find((tag) => tag === "");

  return (
    <div className="bg-grey-450 flex w-full flex-col gap-2 rounded-lg border-none p-2 font-light">
      <h4>Tags</h4>
      {tags.map((tag, index) => (
        <input
          key={index}
          className="background-color placeholder:text-muted-foreground focus:ring-cerulean focus:ring-offset-grey-450 w-full rounded-lg border-none p-2 text-sm font-light outline-hidden transition-shadow focus:ring-2 focus:ring-offset-2"
          type="text"
          placeholder={`Tag ${index + 1}`}
          value={tag}
          onChange={(e) =>
            setTags((prev) => {
              const newTags = [...prev];
              newTags[index] = e.target.value;
              return newTags;
            })
          }
        />
      ))}
      <Button
        className="background-color hover:background-color"
        onClick={() => setTags((prev) => [...prev, ""])}
        disabled={hasTagEmpty !== undefined || tags.length >= 3}
      >
        Add Tag
      </Button>
    </div>
  );
}
