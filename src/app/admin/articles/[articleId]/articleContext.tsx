"use client";

import { createContext, useContext, useState } from "react";

type EditableArticle = {
  title: string;
  organisation_id: string;
  isHidden: boolean;
  content: {
    keywords: string[];
    tags: string[];
    landingImage: string;
    content: string;
  };
};

type ArticleContextType = {
  article: EditableArticle;
  setArticle: React.Dispatch<React.SetStateAction<EditableArticle>>;
  updateField: <K extends keyof EditableArticle>(
    key: K,
    value: EditableArticle[K]
  ) => void;
  updateContentField: <
    K extends keyof EditableArticle["content"]
  >(
    key: K,
    value: EditableArticle["content"][K]
  ) => void;
};

const defaultArticle: EditableArticle = {
  title: "",
  organisation_id: "",
  isHidden: false,
  content: {
    keywords: [],
    tags: [],
    landingImage: "",
    content: "",
  },
};

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export function ArticleProvider({ children }: { children: React.ReactNode }) {
  const [article, setArticle] = useState<EditableArticle>(defaultArticle);

  const updateField = (key: keyof EditableArticle, value: any) => {
    setArticle((prev) => ({ ...prev, [key]: value }));
  };

  const updateContentField = (
    key: keyof EditableArticle["content"],
    value: any
  ) => {
    setArticle((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [key]: value,
      },
    }));
  };

  return (
    <ArticleContext.Provider
      value={{ article, setArticle, updateField, updateContentField }}
    >
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticle() {
  const ctx = useContext(ArticleContext);
  if (!ctx) throw new Error("useArticle must be used inside <ArticleProvider>");
  return ctx;
}
