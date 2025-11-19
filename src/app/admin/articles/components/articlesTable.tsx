import { Pencil, Trash } from "lucide-react";
import { Article } from "../types";
import { Button } from "@/components/ui/button";
import { DeleteArticleDialogue } from "./deleteArticleDialogue";
import Link from "next/link";


export function ArticlesTable({ articles }: { articles: Article[] }) {

  function deleteArticle(articleId: string) {

  }

  return (
    <div className="flex flex-col gap-[12px] bg-grey-450 p-[12px] rounded-2xl">
      <h3 className="text-xl">Articles</h3>
      <div className="">
        {articles.map(article => (
          <div key={article.article_id} className="flex items-center justify-between pb-2 border-b border-color">
            <div className="flex flex-col">
              <h4>{article.title}</h4>
              <p className="text-sm text-muted-foreground">{article.article_id}</p>
            </div>

            <div className="">
              <h5 className="text-sm text-right mb-1">{article.organisation_id}</h5>

              <div className="flex items-center gap-1">
                {article.canDelete &&
                  <DeleteArticleDialogue article={{ articleId: article.article_id, articleTitle: article.title }}>
                    <Button variant={"destructive"} className="h-8 w-8 p-0">
                      <Trash height={16} width={16} />
                    </Button>
                  </DeleteArticleDialogue>
                }
                {article.canEdit &&
                  <Button className="h-8 p-0 px-3 bg-cerulean hover:bg-cerulean">
                    <Link className="flex items-center gap-1" href={`/admin/articles/${article.article_id}`}>
                      <Pencil height={16} width={16} /> Edit
                    </Link>
                  </Button>
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}