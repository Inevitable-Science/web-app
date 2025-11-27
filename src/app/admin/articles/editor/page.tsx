"use client"
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
//import { ArticleSchema, ArticleType } from "../types";
import { Input } from "@/components/ui/input";
import { DeleteArticleDialogue } from "../components/admin/deleteArticleDialogue";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleEditor } from "./components/articleEditor";
import { useAuth } from "../helpers/useAuth";
import { useArticleAuthContext } from "../helpers/articleAuthContext";


export default function ArticleEditorPage() {
  const params = useParams();
  const articleId = params.articleId;
  //const { status, user, authToken } = useAuth();
    const { user, authToken, status, logout, revalidateUser, fetchNonce } = useArticleAuthContext();


  if (status === "loading") return;

  if (!user || !authToken) return;
  
  return (
    <ArticleEditor />
  )
}