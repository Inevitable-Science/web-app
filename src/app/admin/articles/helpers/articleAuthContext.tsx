"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { UserResponseType, UserResponseZ } from "./types";
import { usePathname } from "next/navigation";

export interface ArticleAuthType {
  user: UserResponseType | null;
  authToken: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  logout: () => void;
  revalidateUser: () => Promise<boolean>;
  silentRevalidateUser: () => Promise<void>;
}

const ArticleAuthContext = createContext<ArticleAuthType | null>(null);

export function ArticleAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading");
  const [user, setUser] = useState<UserResponseType | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  function linkToLogin() {
    if (pathname !== "/admin/articles") {
      window.location.href = "/admin/articles";
      return;
    }

    return;
  }

  const silentRevalidateUser = useCallback(async () => {
    if (!authToken) {
      console.log("NO AUTH TOKEN");
      logout();
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/fetch`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${authToken}` },
        }
      );

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();
      const parsed = UserResponseZ.parse(data);
      setUser(parsed);

      return;
    } catch (err) {
      console.error(err);
      logout();
      return;
    }
  }, [authToken]);

  const revalidateUser = useCallback(async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("articleAuthToken")
        : null;

    if (!token) {
      setStatus("unauthenticated");
      setUser(null);
      setAuthToken(null);
      linkToLogin();
      return false;
    }

    setAuthToken(token);
    setStatus("loading");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/fetch`,
        {
          method: "POST",
          headers: { authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();
      const parsed = UserResponseZ.parse(data);
      setUser(parsed);
      setStatus("authenticated");
      return true;
    } catch (err) {
      console.error(err);
      logout();
      return false;
    }
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("articleAuthToken")
        : null;

    if (token) {
      revalidateUser();
    } else {
      setStatus("unauthenticated");
      linkToLogin();
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("articleAuthToken");
    setAuthToken(null);
    setUser(null);
    setStatus("unauthenticated");
    linkToLogin();
  };

  return (
    <ArticleAuthContext.Provider
      value={{
        user,
        authToken,
        status,
        logout,
        revalidateUser,
        silentRevalidateUser,
        //fetchNonce,
      }}
    >
      {children}
    </ArticleAuthContext.Provider>
  );
}

export function useArticleAuthContext() {
  const ctx = useContext(ArticleAuthContext);
  if (!ctx)
    throw new Error(
      "useArticleAuthContext must be used in a ArticleAuthProvider"
    );
  return ctx;
}
