"use client"
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ArticleSchema, ArticleType } from "../types";
import { Input } from "@/components/ui/input";
import { DeleteArticleDialogue } from "../components/deleteArticleDialogue";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function ArticleEditor() {
  const params = useParams();
  const articleId = params.articleId;

  const { address, isConnected } = useAccount();

  const [data, setData] = useState<ArticleType | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    console.log(isConnected);
  }, [isConnected]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        if (mounted && (!address || !articleId)) throw new Error;
        if (!mounted && !address) return;
        
        const response = await fetch(`http://localhost:3001/article/fetchArticle/${articleId}/${address}`);

        if (!response.ok) throw new Error;

        const data = await response.json();
        console.log(data);
        const parsed = ArticleSchema.parse(data);

        setData(parsed);
      } catch {
        console.log("err");
        notFound();
      } finally {
        setMounted(true);
      };
    };

    fetchArticle();
  }, [address]);

  //if (address && !)

  if (!data || (!mounted && !isConnected)) return;

  const article = data.article;

  return (
    <>
    {/*<h1>
      {articleId}
    </h1>
    <pre>{JSON.stringify(article, null, 2)}</pre>*/}

    <div className="ctWrapper">
      <div className="flex gap-2 mt-24">
        <input
          type="text"
          className="bg-grey-450 w-full rounded-lg border-none p-2 text-lg font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
          placeholder="Article Title"
          //value={username}
          //onChange={(e) => setUsername(e.target.value)}
        />
        <DeleteArticleDialogue article={{ articleId: article.article_id, articleTitle: article.title }}>
          <Button className="gap-1" variant="destructive">
            <Trash height={18} width={18} />
            Delete
          </Button>
        </DeleteArticleDialogue>
      </div>

      <div className="">
        
      </div>
    </div>
    </>
  )
}