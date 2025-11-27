"use client"
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
//import { ArticleSchema, ArticleType } from "../types";
import { Input } from "@/components/ui/input";
import { DeleteArticleDialogue } from "../../components/deleteArticleDialogue";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleEditor } from "../components/articleEditor";
import { useAuth } from "../../helpers/useAuth";
import { ArticleResponseZ, ArticleResponse } from "../../helpers/types";
import { useArticleAuthContext } from "../../helpers/articleAuthContext";


export default function ArticleEditorPage() {
  const params = useParams();
  const articleId = params.articleId;
  const { status, user, authToken } = useArticleAuthContext();


  //const { address, isConnected } = useAccount();

  //const [data, setData] = useState<ArticleType | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [article, setArticle] = useState<ArticleResponse | null>(null);

  useEffect(() => {
    
    const fetchArticle = async () => {
      try {
        const response = await fetch(`http://localhost:3001/article/fetch/${articleId}`, {
          headers: {
            authorization: `Bearer ${authToken}`
          },
          cache: 'no-store',
        });

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

  if (!article && (!user || status === "loading")) return;

  if (mounted && !article) return notFound();

  if (article) {
    return (
      <>
        <ArticleEditor article={article} />
      </>
    )
  }
}