"use client"
import { ArticleEditor } from "./components/articleEditor";
import { useArticleAuthContext } from "../helpers/articleAuthContext";

export default function ArticleEditorPage() {
  const { user, authToken, status } = useArticleAuthContext();

  if (status === "loading") return;

  if (!user || !authToken) return;
  
  return (
    <ArticleEditor />
  )
}