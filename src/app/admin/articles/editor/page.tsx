"use client";
import { useAuthStatus, useAuthToken, useUser } from "@/store/AdminAuthStore";
import { LoadState } from "./[articleId]/LoadState";
import { ArticleEditor } from "./components_new/ArticleEditor";

export default function ArticleEditorPage() {
  const { user } = useUser();
  const { authToken } = useAuthToken();
  const { authStatus } = useAuthStatus();

  if (authStatus === "loading") return;
  if (!user || !authToken) return;

  return (
    <>
      <LoadState />
      <ArticleEditor />
    </>
  );
}
