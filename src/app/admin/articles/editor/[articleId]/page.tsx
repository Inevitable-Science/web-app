"use client";
import { notFound } from "next/navigation";
import { ArticleEditor } from "../components/ArticleEditor";
import { useAdminArticleQuery } from "@/hooks/queries/useFetchAdminArticle";
import { LoadState } from "./LoadState";

export default function ArticleEditorPage() {
  const { data: article, isLoading, isError } = useAdminArticleQuery();

  if (isLoading) return;
  if (isError) return notFound();

  return (
    <>
      <LoadState />
      <ArticleEditor article={article} />
    </>
  );
}
