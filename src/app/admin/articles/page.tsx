"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { UserTable } from "./components/userTable";
import { OrganisationTable } from "./components/orgTable";
import { ArticlesTable } from "./components/articlesTable";
import { LoginResponseZ } from "../../../lib/types/AdminArticleTypes";
import { useToast } from "@/components/ui/use-toast";
import { useArticleAuth } from "../../../store/AdminAuthStore";

export default function AdminArticlesPage() {
  const { toast } = useToast();

  const { user, status, revalidateUser } = useArticleAuth();

  const [isLogginIn, setIsLoggingIn] = useState(false);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const login = async () => {
    try {
      if (!userId || !password || !mfaCode) return;
      setIsLoggingIn(true);

      const reqBody = {
        userId,
        password,
        mfaCode,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        },
      );
      
      if (!res.ok) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Incorrect Credentials"
        });
        return;
      };

      const data = await res.json();
      const parsed = LoginResponseZ.parse(data);
      localStorage.setItem("articleAuthToken", parsed.key);
      await revalidateUser();
      return;
    } catch (err) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Error Occured Logging In"
      });
      return;
    } finally {
      setUserId("");
      setPassword("");
      setMfaCode("");
      setIsLoggingIn(false);
    };
  };

  if (status === "loading") return;

  if (status === "unauthenticated") {
    return (
      <div className="ctWrapper mt-32 flex flex-col gap-2">
        <h2 className="font-optima text-3xl">Login To View Articles</h2>
        <p className="mb-4">Login with your admin credentials.</p>

        <div className="w-[400px] flex flex-col gap-2 bg-grey-450 p-4 rounded-lg border-2 border-color">
          <input
            type="text"
            className="w-full rounded-lg border-none p-2 background-color font-light outline-hidden transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
            placeholder="User ID"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-lg border-none p-2 background-color font-light outline-hidden transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="text"
            className="w-full rounded-lg border-none background-color p-2 font-light outline-hidden transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
            placeholder="MFA Code"
            maxLength={6}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
          />

          <Button
            loading={isLogginIn}
            disabled={!userId || !password || !mfaCode}
            variant={"accent"}
            className="w-full mt-2"
            onClick={() => login()}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <div className="ctWrapper">
        <div className="mt-32 flex flex-col gap-2">
          <h2 className="font-optima text-3xl">Welcome back</h2>
          <p className="mb-4">
            Below are all articles you have permission to edit. Treat <u>all</u>{" "}
            info as if it were public.
          </p>
        </div>

        <div className="flex flex-col gap-[12px]">
          {user.user && <UserTable />}
          {user.organisations && (
            <OrganisationTable organisations={user.organisations} />
          )}

          {user.editableArticles && <ArticlesTable />}
        </div>
      </div>
    );
  }
}
