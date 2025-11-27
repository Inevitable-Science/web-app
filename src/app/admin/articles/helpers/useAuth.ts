import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { NonceResponseZ, UserResponseType, UserResponseZ } from "./types";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";

export interface UseAuthBody {
  user: UserResponseType | null;
  authToken: string | null;
  status: "loading" | "authenticated" | "unauthenticated";
  logout: () => void;
  revalidateUser: () => Promise<boolean>;
  fetchNonce: () => Promise<number | null>;
};

export function useAuth(): UseAuthBody {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/getNonce/${address}`);
      if (!response.ok) return null;

      const data = await response.json();
      const parsed = NonceResponseZ.parse(data);

      return parsed.nonce;
    } catch {
      return null;
    }
  };

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/getUser`, {
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
      localStorage.removeItem('articleAuthToken');
      setUser(null);
      setAuthToken(null);
      setStatus('unauthenticated');
      linkToLogin();
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
    }
  }, [isConnected, wagmiStatus, revalidateUser]);


  useEffect(() => {
    if (!isConnected && wagmiStatus !== "connecting" && wagmiStatus !== "reconnecting") {
      logout();
    };
  }, [isConnected, wagmiStatus]);

  const logout = () => {
    localStorage.removeItem('articleAuthToken');
    setAuthToken(null);
    setUser(null);
    setStatus('unauthenticated');
    linkToLogin();
  };

  return { user, authToken, status, logout, revalidateUser, fetchNonce };
};