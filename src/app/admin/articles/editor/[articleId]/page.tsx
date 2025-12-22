"use client";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ArticleEditor } from "../components/articleEditor";
import { ArticleResponseZ, ArticleResponse } from "../../../../../lib/types/AdminArticleTypes";
//import { useArticleAuthContext } from "../../helpers/articleAuthContext";
import { useAuthStatus, useAuthToken, useUser } from "../../../../../store/AdminAuthStore";

export default function ArticleEditorPage() {
  const params = useParams();
  const articleId = params.articleId;
  //const { status, user, authToken } = useArticleAuthContext();
  const { user } = useUser();
  const { authToken } = useAuthToken();
  const { authStatus } = useAuthStatus();

  const [mounted, setMounted] = useState<boolean>(false);
  const [article, setArticle] = useState<ArticleResponse | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/article/fetch/${articleId}`,
          {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error();

        const data = await response.json();
        const parsed = ArticleResponseZ.parse(data);

        setArticle(parsed);
        return;
      } catch (err) {
        console.log(err);
        return;
      } finally {
        setMounted(true);
      }
    };

    fetchArticle();
  });

  if (!article && (!user || authStatus === "loading")) return;

  if (mounted && !article) return notFound();

  if (article) {
    return (
      <>
        <ArticleEditor article={article} />
      </>
    );
  }
}
