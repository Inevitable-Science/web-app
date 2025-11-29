"use client";
import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";

import { ButtonWithWallet } from "@/components/ButtonWithWallet";
import { Button } from "@/components/ui/button";
import { UserTable } from "./components/userTable";
import { OrganisationTable } from "./components/orgTable";
import { ArticlesTable } from "./components/articlesTable";
import { LoginResponseZ } from "./helpers/types";
import { useArticleAuthContext } from "./helpers/articleAuthContext";
import { useToast } from "@/components/ui/use-toast";

export default function AdminArticlesPage() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();

  const { user, status, revalidateUser } = useArticleAuthContext();

  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [nonce, setNonce] = useState<number | null>(null);
  const [isLogginIn, setIsLoggingIn] = useState(false);

  const [userId, setUserId] = useState("0xf73544");
  const [password, setPassword] = useState("H(+uPD#D1x");
  const [mfaCode, setMfaCode] = useState("");

  /*const checkUser = async () => {
    try {
      const nonce = await fetchNonce();
      if (typeof nonce !== "number") {
        setUserExists(false);
        return;
      }

      setNonce(nonce);
      setUserExists(true);
    } catch (err) {
      setUserExists(false);
      console.log(err);
    }
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
        message: `Authorize this action by signing below.\nNo cost. No sensitive data shared.\nAction: login\nAddress: ${address.toLowerCase()}\nNonce: ${nonce}`,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
            signature,
          }),
        }
      );

      console.log(response);

      if (!response.ok) throw new Error();

      const data = await response.json();
      console.log(data);
      const parsed = LoginResponseZ.parse(data);

      console.log(parsed);
      localStorage.setItem("articleAuthToken", parsed.key);
      await revalidateUser();
      return;
    } catch {
      return;
    } finally {
      setIsSigning(false);
    }
  }*/

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
        //`${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/login`,
        `http://localhost:3001/user/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        },
      );
      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        toast({
          title: "Error",
          variant: "destructive",
          description: "Incorrect Credentials"
        });
        return;
      };

      //const data = await res.json();
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

  /*if (isConnected === false) {
    return (
      <div className="ctWrapper mt-32 flex flex-col gap-2">
        <h2 className="font-optima text-3xl">Connect Your Wallet</h2>
        <p className="mb-4">
          Connect your wallet in order to view & manage articles.
        </p>
        <ButtonWithWallet variant={"accent"}>Connect Wallet</ButtonWithWallet>
      </div>
    );
  }

  if (userExists === false) {
    return (
      <div className="ctWrapper mt-32 flex flex-col gap-2">
        <h2 className="font-optima text-3xl">You Cannot Access This</h2>
        <p className="mb-4">
          Sorry you cannot access this... maybe try another account?
        </p>
        <Button variant={"accent"} onClick={() => disconnect()}>
          Disconnect
        </Button>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="ctWrapper mt-32 flex flex-col gap-2">
        <h2 className="font-optima text-3xl">Login To View Articles</h2>
        <p className="mb-4">Sign a quick message to login.</p>
        <Button
          loading={isSigning}
          variant={"accent"}
          onClick={() => signMessage()}
        >
          Sign Message
        </Button>
      </div>
    );
  }*/

  if (status === "unauthenticated") {
    return (
      <div className="ctWrapper mt-32 flex flex-col gap-2">
        <h2 className="font-optima text-3xl">Login To View Articles</h2>
        <p className="mb-4">Login with your admin credentials.</p>
        <input
          type="text"
          className="w-full rounded-lg border-none bg-grey-450 p-2 font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <input
          type="text"
          className="w-full rounded-lg border-none bg-grey-450 p-2 font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="text"
          className="w-full rounded-lg border-none bg-grey-450 p-2 font-light outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-cerulean focus:ring-offset-2 focus:ring-offset-grey-450"
          placeholder="MFA Code"
          maxLength={6}
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
        />

        <Button
          loading={isLogginIn}
          disabled={!userId || !password || !mfaCode}
          variant={"accent"}
          onClick={() => login()}
        >
          Login
        </Button>
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
