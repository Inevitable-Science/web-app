"use client";

import { ArticleAuthProvider } from "./helpers/articleAuthContext";

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return(
    <ArticleAuthProvider>
      {children}
    </ArticleAuthProvider>
  ); 
}