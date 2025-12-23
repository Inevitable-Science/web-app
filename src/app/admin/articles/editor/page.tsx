"use client";
import { ArticleEditor } from "./components/articleEditor";
//import { useArticleAuthContext } from "../helpers/articleAuthContext";
import { useArticleAuth } from "../../../../store/AdminAuthStore";
import { useAuthStatus, useAuthToken, useUser } from "../../../../store/AdminAuthStore";

export default function ArticleEditorPage() {
  //const { user, authToken, status } = useArticleAuthContext();
  const { user } = useUser();
  const { authToken } = useAuthToken();
  const { authStatus } = useAuthStatus();

  if (authStatus === "loading") return;

  if (!user || !authToken) return;

  return <ArticleEditor />;
}
