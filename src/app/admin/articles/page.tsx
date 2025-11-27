"use client"
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi"

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { UserTable } from "./components/userTable";
import { OrganisationTable } from "./components/orgTable";
import { ArticlesTable } from "./components/articlesTable";
import { LoginResponseZ } from "./helpers/types";
import { useArticleAuthContext } from "./helpers/articleAuthContext";


export default function AdminArticlesPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const { user, status, revalidateUser, fetchNonce } = useArticleAuthContext();

  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [nonce, setNonce] = useState<number | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  const checkUser = async () => {
    try {
      const nonce = await fetchNonce();
      if (typeof nonce !== "number") {
        setUserExists(false);
        return;
      };

      setNonce(nonce);
      setUserExists(true);
    } catch (err) {
      setUserExists(false);
      console.log(err);
    };
  };
  
  useEffect(() => {
    if (!address || status !== "unauthenticated") return;
    checkUser();
  }, [address, status, checkUser]);

  
  async function signMessage() {
    try {
      if (!address) return;
      setIsSigning(true);

      await checkUser();

      if (typeof nonce !== "number") return;

      const signature = await signMessageAsync({
        account: address,
        message: `Authorize this action by signing below.\nNo cost. No sensitive data shared.\nAction: login\nAddress: ${address.toLowerCase()}\nNonce: ${nonce}`
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          signature
        }),
      });

      console.log(response);
      
      if (!response.ok) throw new Error();

      const data = await response.json();
      console.log(data);
      const parsed = LoginResponseZ.parse(data);
      
      console.log(parsed);
      localStorage.setItem('articleAuthToken', parsed.key);
      await revalidateUser();
      return;
    } catch {
      return;
    } finally {
      setIsSigning(false);
    }
  };

  if (status === "loading") return;
  
  if (isConnected === false) {
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

  if (userExists === false) {
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

  if (status === "unauthenticated") {
    return (
      <div className="ctWrapper mt-32 flex flex-col gap-2">
        <h2 className="text-3xl font-optima">Login To View Articles</h2>
        <p className="mb-4">Sign a quick message to login.</p>
        <Button loading={isSigning} variant={"accent"} onClick={() => signMessage()}>
          Sign Message
        </Button>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <div className="ctWrapper">
        <div className="mt-32 flex flex-col gap-2">
          <h2 className="text-3xl font-optima">Welcome back</h2>
          <p className="mb-4">Below are all articles you have permission to edit. Treat <u>all</u> info as if it were public.</p>
        </div>

        <div className="flex flex-col gap-[12px]">
          {user.user && <UserTable />}
          {user.organisations && <OrganisationTable organisations={user.organisations} />}

          {user.editableArticles && 
            <ArticlesTable />
          }
        </div>
      </div>
    )
  }
}