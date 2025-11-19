"use client"
import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { ConnectKitButton } from "connectkit";
import { CircleUserRound, Crown, Link, Pencil } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi"
import z from "zod";
import { Article, UserSchema, User } from "./types";
import { UserTable } from "./components/userTable";
import { OrganisationTable } from "./components/orgTable";
import { ArticlesTable } from "./components/articlesTable";


export default function AdminArticlesPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect()

  const [user, setUser] = useState<User | null>(null);
  const [isUserValid, setIsUserValid] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<Article[] | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        if (!address) return;

        const response = await fetch(`http://localhost:3001/article/user/verifyAddress/${address}`);
        if (!response.ok) throw new Error();

        const data = await response.json();
        const parsed = UserSchema.parse(data);

        setIsUserValid(true);
        setUser(parsed.user);
        setArticles(parsed.articles);
      } catch {
        setIsUserValid(false);
        return;
      }
    };

    fetchArticles();
  }, [address]);

  if (isUserValid === null && address) return;
  
  if (!isConnected) {
    return (
      <div className="ctWrapper mt-32 flex flex-col gap-2">
        <h2 className="text-3xl font-optima">Connect Your Wallet</h2>
        <p className="mb-4">Connect your wallet in order to view & manage articles.</p>
        <ButtonWithWallet variant={"accent"}>
          Connect Wallet
        </ButtonWithWallet>
      </div>
    );
  };

  if (isUserValid !== true) {
    return (
      <div className="ctWrapper mt-32 flex flex-col gap-2">
        <h2 className="text-3xl font-optima">You Cannot Access This</h2>
        <p className="mb-4">Sorry you cannot access this... maybe try another account?</p>
        <Button variant={"accent"} onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  };

  return (
    <div className="ctWrapper">
      <div className="mt-32 flex flex-col gap-2">
        <h2 className="text-3xl font-optima">Welcome back</h2>
        <p className="mb-4">Below are all articles you have permission to edit. Note <u>all</u> info is public.</p>
      </div>

      <div className="flex flex-col gap-[12px]">
        {user && (
          <>
            <UserTable user={user} />
            <OrganisationTable user={user} />
          </>
        )}

        {articles && <ArticlesTable articles={articles} />}
      </div>


      {/*<div className="">
        {articles && articles.map(article => (
          <div key={article.article_id} className="">
            {JSON.stringify(article, null, 2)}
          </div>
        ))}
      </div>
    <pre>{JSON.stringify(user, null, 2)}</pre>
    <pre>{JSON.stringify(articles, null, 2)}</pre>*/}
    </div>
  )
}