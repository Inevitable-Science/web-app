"use client";

import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

import { UserResponseType, UserResponseZ } from "@/lib/types/AdminArticleTypes";

interface ArticleStoreType {
  user: UserResponseType | null;
  authToken: string | null;
  authStatus: "loading" | "authenticated" | "unauthenticated";

  setUser: (user: UserResponseType | null) => void;
  setAuthToken: (authToken: string | null) => void;
  setAuthStatus: (status: "loading" | "authenticated" | "unauthenticated") => void;
  logout: () => void;
  revalidateUser: () => Promise<boolean>;
  silentRevalidateUser: (token: string) => Promise<void>;
}

const useArticleAuthStore = create<ArticleStoreType>((set, get) => ({
  user: null,
  authToken: null,
  authStatus: "loading",

  setUser: (user) => set({ user }),
  setAuthToken: (authToken) => set({ authToken }),
  setAuthStatus: (authStatus) => set({ authStatus }),

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("articleAuthToken");
    }
    set({
      user: null,
      authToken: null,
      authStatus: "unauthenticated",
    });
  },

  revalidateUser: async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("articleAuthToken")
        : null;

    if (!token) {
      get().logout();
      set({ authStatus: "unauthenticated" });
      return false;
    }

    set({ authToken: token, authStatus: "loading" });

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

      set({
        user: parsed,
        authStatus: "authenticated",
      });
      return true;
    } catch (err) {
      console.error(err);
      get().logout();
      return false;
    }
  },

  silentRevalidateUser: async (token: string) => {
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

      set({ user: parsed });
    } catch (err) {
      console.error(err);
      get().logout();
    }
  },
}));

// === Provider Component (only for side effects) ===
export function ArticleAuthProviderNew({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { revalidateUser, logout, authToken } = useArticleAuthStore();

  const linkToLogin = useCallback(() => {
    if (pathname !== "/admin/articles") {
      window.location.href = "/admin/articles";
    }
  }, [pathname]);

  // Silent revalidation when token exists (e.g., on focus or route change)
  const silentRevalidateUser = useArticleAuthStore(
    (state) => state.silentRevalidateUser
  );

  useEffect(() => {
    if (authToken) {
      silentRevalidateUser(authToken);
    }
  }, [authToken, silentRevalidateUser]);

  // Initial auth check on mount
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("articleAuthToken")
        : null;

    if (token) {
      revalidateUser();
    } else {
      logout();
      linkToLogin();
    }
  }, [revalidateUser, logout, linkToLogin]);

  return <>{children}</>;
}

// === Custom Hooks for Consumption ===
export const useArticleAuth = () => {
  return useArticleAuthStore(
    useShallow((state) => ({
      user: state.user,
      authToken: state.authToken,
      status: state.authStatus,
      logout: state.logout,
      revalidateUser: state.revalidateUser,
      silentRevalidateUser: state.silentRevalidateUser,
    }))
  );
};

// Optional granular hooks (if you prefer)
export const useUser = () => {
  return useArticleAuthStore(useShallow((state) => ({ user: state.user })));
};

export const useAuthStatus = () => {
  return useArticleAuthStore(
    useShallow((state) => ({ authStatus: state.authStatus }))
  );
};

export const useAuthToken = () => {
  return useArticleAuthStore(
    useShallow((state) => ({ authToken: state.authToken }))
  );
};