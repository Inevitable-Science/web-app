import { Pencil, Plus, Trash } from "lucide-react";
import { ArticlePreview, Organisation, User } from "../helpers/types";
import { Button } from "@/components/ui/button";
import { DeleteArticleDialogue } from "./deleteArticleDialogue";
import Link from "next/link";
import { useArticleAuthContext } from "../helpers/articleAuthContext";


export function ArticlesTable() {

  const { user: data } = useArticleAuthContext();
  const user = data?.user;
  const organisations = data?.organisations;
  const writtenArticles = data?.writtenArticles;
  const editedArticles = data?.editedArticles;
  const allArticles = data?.editableArticles;

  if (!user || !organisations || !writtenArticles || !editedArticles || !allArticles) return;
  
  return (
    <div className="flex flex-col gap-[12px] bg-grey-450 p-[12px] rounded-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl">Articles</h3>
        <Button
          variant={"secondary"}
          disabled={!user.isTopLevelAdmin && organisations.filter(org => org.userPermissions.canCreate).length === 0}
        >
          <Link className="flex items-center gap-1" href="/admin/articles/editor">
            Create Article
            <Plus height={20} width={20} />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <ArticleTable
          articles={writtenArticles}
          articleType={"Written Articles"}
          isTopLevelAdmin={user.isTopLevelAdmin}
          organisations={organisations}
        />

        <ArticleTable
          articles={editedArticles}
          articleType={"Edited Articles"}
          isTopLevelAdmin={user.isTopLevelAdmin}
          organisations={organisations}
        />

        <ArticleTable
          articles={allArticles}
          articleType={"Editable Articles"}
          isTopLevelAdmin={user.isTopLevelAdmin}
          organisations={organisations}
        />
      </div>
    </div>
  )
};


function ArticleTable({ articles, articleType, isTopLevelAdmin, organisations }: 
  {
    articles: ArticlePreview[];
    organisations: Organisation[];
    isTopLevelAdmin: boolean;
    articleType: string;
  }) {
  return (
    <div>
      <h3>{articleType}</h3>
      {articles.length > 0 ? (
        <>
        {articles.map(article => (
          <div key={article.articleId} className="flex items-center justify-between pb-2 border-b border-color">
            <div className="flex flex-col">
              <h4>{article.title}</h4>
              <p className="text-sm text-muted-foreground">{article.articleId}</p>
            </div>

            <div className="">
              <h5 className="text-sm text-right mb-1">{article.organisationId}</h5>

              <div className="flex items-center gap-1">
                {(organisations
                  .find(org => org.organisationId === article.organisationId)?.userPermissions.canDelete ||
                  isTopLevelAdmin) &&

                  <DeleteArticleDialogue article={{ articleId: article.articleId, articleTitle: article.title }} organisationId={article.organisationId}>
                    <Button variant={"destructive"} className="h-8 w-8 p-0">
                      <Trash height={16} width={16} />
                    </Button>
                  </DeleteArticleDialogue>
                }

                {(organisations
                  .find(org => org.organisationId === article.organisationId)?.userPermissions.canEdit ||
                  isTopLevelAdmin) &&

                  <Button className="h-8 p-0 px-3 bg-cerulean hover:bg-cerulean">
                    <Link className="flex items-center gap-1" href={`/admin/articles/editor/${article.articleId}`}>
                      <Pencil height={16} width={16} /> Edit
                    </Link>
                  </Button>
                }
              </div>
            </div>
          </div>
        ))}
      </>
      ) : (
        <div className="h-[60px] pb-4 flex items-center justify-center border-b border-color">
          <p className="text-muted-foreground text-sm">No {articleType}</p>
        </div>
      )}
    </div>
  )
};