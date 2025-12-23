"use client";
//import { ArticleAuthProvider } from "./helpers/articleAuthContext";
import { ArticleAuthProviderNew } from "../../../store/AdminAuthStore";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ArticleAuthProviderNew>
      {children}
      {/*<ArticleAuthProvider>
        {children}
      </ArticleAuthProvider>*/}
    </ArticleAuthProviderNew>
  );
}
