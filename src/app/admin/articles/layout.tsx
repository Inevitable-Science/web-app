"use client";
import { ArticleAuthProvider } from "@/store/AdminAuthStore";

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ArticleAuthProvider>
      {children}
    </ArticleAuthProvider>
  );
}
