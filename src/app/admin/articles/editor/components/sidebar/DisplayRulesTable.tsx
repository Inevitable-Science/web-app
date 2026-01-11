import { Button } from "@/components/ui/button";
import {
  useArticleIsHidden,
  useArticleIsShownOnMainSite,
  useToggleArticleIsHidden,
  useToggleArticleIsShownOnMainSite,
} from "@/store/ArticleEditorStore";

export function DisplayRulesTable() {
  const { articleIsHidden } = useArticleIsHidden();
  const { articleIsShownOnMainSite } = useArticleIsShownOnMainSite();
  const toggleArticleIsHidden = useToggleArticleIsHidden();
  const toggleArticleIsShownOnMainSite = useToggleArticleIsShownOnMainSite();

  return (
    <div className="bg-grey-450 flex w-full flex-col gap-2 rounded-lg border-none p-2 font-light">
      <h4 className="">Display Rules</h4>
      <Button
        onClick={toggleArticleIsHidden}
        className="background-color hover:background-color"
      >
        {articleIsHidden ? (
          <span className="flex flex-col">
            Show Article
            <span className="text-muted-foreground text-xs">
              (Currently Hidden)
            </span>
          </span>
        ) : (
          <span className="flex flex-col">
            Hide Article
            <span className="text-muted-foreground text-xs">
              (Currently Visible)
            </span>
          </span>
        )}
      </Button>

      <Button
        onClick={toggleArticleIsShownOnMainSite}
        className="background-color hover:background-color"
      >
        {articleIsShownOnMainSite ? (
          <span className="flex flex-col">
            Hide On Inev Site
            <span className="text-muted-foreground text-xs">
              (Currently Visible)
            </span>
          </span>
        ) : (
          <span className="flex flex-col">
            Show On Inev Site
            <span className="text-muted-foreground text-xs">
              (Currently Hidden)
            </span>
          </span>
        )}
      </Button>
    </div>
  );
}
