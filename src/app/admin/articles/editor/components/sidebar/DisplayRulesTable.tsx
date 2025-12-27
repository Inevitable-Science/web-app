import { Button } from "@/components/ui/button";
import { useArticleIsHidden, useArticleIsShownOnMainSite, useToggleArticleIsHidden, useToggleArticleIsShownOnMainSite } from "@/store/ArticleEditorStore";


export function DisplayRulesTable() {
  const { articleIsHidden } = useArticleIsHidden();
  const { articleIsShownOnMainSite } = useArticleIsShownOnMainSite();
  const toggleArticleIsHidden = useToggleArticleIsHidden();
  const toggleArticleIsShownOnMainSite = useToggleArticleIsShownOnMainSite();

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border-none bg-grey-450 p-2 font-light">
      <h4 className="">Display Rules</h4>
      <Button
        onClick={toggleArticleIsHidden}
        className="background-color hover:background-color"
      >
        {articleIsHidden ? (
          <span className="flex flex-col">
            Show Article
            <span className="text-xs text-muted-foreground">
              (Currently Hidden)
            </span>
          </span>
        ) : (
          <span className="flex flex-col">
            Hide Article
            <span className="text-xs text-muted-foreground">
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
            <span className="text-xs text-muted-foreground">
              (Currently Visible)
            </span>
          </span>
        ) : (
          <span className="flex flex-col">
            Show On Inev Site
            <span className="text-xs text-muted-foreground">
              (Currently Hidden)
            </span>
          </span>
        )}
      </Button>
    </div>
  )
}