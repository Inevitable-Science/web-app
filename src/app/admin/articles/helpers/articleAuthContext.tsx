import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useAuth, UseAuthBody } from "./useAuth";
import { NonceResponseZ, UserResponseType, UserResponseZ } from "./types";
import { useAccount } from "wagmi";
import { usePathname } from "next/navigation";


export interface ArticleAuthType {
  user: UserResponseType | null;
  authToken: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  logout: () => void;
  revalidateUser: () => Promise<boolean>;
  silentRevalidateUser: () => Promise<void>;
  fetchNonce: () => Promise<number | null>;
};

const ArticleAuthContext = createContext<ArticleAuthType | null>(null);

export function ArticleAuthProvider({ children }: { children: React.ReactNode }) {
  //const { user, authToken, status, logout, revalidateUser, fetchNonce } = useAuth();

  const { address, isConnected, status: wagmiStatus } = useAccount();
  const pathname = usePathname();

  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<UserResponseType | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  function linkToLogin() {
    if (pathname !== "/admin/articles") {
      window.location.href = ("/admin/articles");
      return;
    };

    return;
  };

  const fetchNonce = async (): Promise<number | null> => {
    try {
      if (!address) return null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/getNonce/${address}`, {
        cache: "no-store"
      });
      if (!response.ok) return null;

      const data = await response.json();
      const parsed = NonceResponseZ.parse(data);

      return parsed.nonce;
    } catch {
      return null;
    }
  };

  const silentRevalidateUser = useCallback(async () => {

    if (!authToken) {
      console.log("NO AUTH TOKEN");
      logout();
    };

    //setStatus('loading');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/fetch`, {
        method: "POST",
        headers: { authorization: `Bearer ${authToken}` },
      });

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();
      const parsed = UserResponseZ.parse(data);
      setUser(parsed);
      
      //setStatus('authenticated');
      return;

    } catch (err) {
      console.error(err);
      logout();
      return;
    };
  }, [authToken]);

  const revalidateUser = useCallback(async () => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('articleAuthToken')
      : null;

    if (!token) {
      setStatus('unauthenticated');
      setUser(null);
      setAuthToken(null);
      linkToLogin();
      return false;
    }

    setAuthToken(token);
    setStatus('loading');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/fetch`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Invalid token");

      const data = await res.json();
      const parsed = UserResponseZ.parse(data);
      setUser(parsed);
      setStatus('authenticated');
      return true;

    } catch (err) {
      console.error(err);
      logout();
      return false;
    }
  }, []);

  useEffect(() => {
    if (wagmiStatus === "connecting" || wagmiStatus === "reconnecting") return;

    if (isConnected) {
      revalidateUser();
    } else {
      setStatus("unauthenticated");
      linkToLogin();
    };
  }, [isConnected, wagmiStatus, revalidateUser]);


  useEffect(() => {
    if (!isConnected && wagmiStatus !== "connecting" && wagmiStatus !== "reconnecting") {
      logout();
    };
  }, [isConnected, wagmiStatus]);

  const logout = () => {
    console.log("LOGOUT");
    localStorage.removeItem('articleAuthToken');
    setAuthToken(null);
    setUser(null);
    setStatus('unauthenticated');
    linkToLogin();
  };

  return (
    <ArticleAuthContext.Provider value={{ user, authToken, status, logout, revalidateUser, silentRevalidateUser, fetchNonce }}>
      {children}
    </ArticleAuthContext.Provider>
  )
}

export function useArticleAuthContext() {
  const ctx = useContext(ArticleAuthContext);
  if (!ctx) throw new Error("useArticleAuthContext must be used in a ArticleAuthProvider");
  return ctx;
};