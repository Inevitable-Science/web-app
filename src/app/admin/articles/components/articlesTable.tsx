import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteArticleDialogue } from "./admin/deleteArticleDialogue";
import { ArticlePreview, Organisation } from "../../../../lib/types/AdminArticleTypes";
//import { useArticleAuthContext } from "../helpers/articleAuthContext";
import { Pencil, Plus, Trash } from "lucide-react";
import { useUser } from "../../../../store/AdminAuthStore";

export function ArticlesTable() {
  //const { user: data } = useArticleAuthContext();
  const { user: data } = useUser();
  const user = data?.user;
  const organisations = data?.organisations;
  const writtenArticles = data?.writtenArticles;
  const editedArticles = data?.editedArticles;
  const allArticles = data?.editableArticles;

  if (
    !user ||
    !organisations ||
    !writtenArticles ||
    !editedArticles ||
    !allArticles
  )
    return;

  return (
    <div className="flex flex-col gap-[12px] rounded-2xl bg-grey-450 p-[12px]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl">Articles</h3>
        <Button
          variant={"secondary"}
          disabled={
            !user.isTopLevelAdmin &&
            organisations.filter((org) => org.userPermissions.canCreate)
              .length === 0
          }
        >
          <Link
            className="flex items-center gap-1"
            href="/admin/articles/editor"
          >
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
  );
}

function ArticleTable({
  articles,
  articleType,
  isTopLevelAdmin,
  organisations,
}: {
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
          {articles.map((article) => (
            <div
              key={article.articleId}
              className="border-color flex items-center justify-between border-b pb-2"
            >
              <div className="flex flex-col">
                <h4>{article.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {article.articleId}
                </p>
              </div>

              <div className="">
                <h5 className="mb-1 text-right text-sm">
                  {article.organisationId}
                </h5>

                <div className="flex items-center gap-1">
                  {(organisations.find(
                    (org) => org.organisationId === article.organisationId
                  )?.userPermissions.canDelete ||
                    isTopLevelAdmin) && (
                    <DeleteArticleDialogue
                      article={{
                        articleId: article.articleId,
                        articleTitle: article.title,
                      }}
                      organisationId={article.organisationId}
                    >
                      <Button variant={"destructive"} className="h-8 w-8 p-0">
                        <Trash height={16} width={16} />
                      </Button>
                    </DeleteArticleDialogue>
                  )}

                  {(organisations.find(
                    (org) => org.organisationId === article.organisationId
                  )?.userPermissions.canEdit ||
                    isTopLevelAdmin) && (
                    <Button className="h-8 bg-cerulean p-0 px-3 hover:bg-cerulean">
                      <Link
                        className="flex items-center gap-1"
                        href={`/admin/articles/editor/${article.articleId}`}
                      >
                        <Pencil height={16} width={16} /> Edit
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="border-color flex h-[60px] items-center justify-center border-b pb-4">
          <p className="text-sm text-muted-foreground">No {articleType}</p>
        </div>
      )}
    </div>
  );
}
