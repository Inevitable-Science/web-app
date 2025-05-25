"use client";
import { Button } from "@/components/ui/button";
import { JB_CHAINS } from "juice-sdk-core";
import Image from "next/image";
import Link from "next/link";
import { mainnet } from "viem/chains";
import { sdk } from "@farcaster/frame-sdk";
import { use, useEffect, useState } from "react";

const RevLink = ({
  network,
  id,
  text,
}: {
  network: string;
  id: number;
  text: string;
}) => {
  return (
    <span>
      $
      <Link
        href={`/${network}:${id}`}
        className="underline hover:text-black/70"
      >
        {text}
      </Link>
    </span>
  );
};

const Pipe = () => {
  return <div className="text-zinc-300">{" | "}</div>;
};

export default function Page() {
  const [user, setUser] = useState<{ fid: number; pfp: string, userName: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      await sdk.actions.ready();

      try {
        await sdk.actions.addFrame();
      } catch (error) {
        if (error){
          console.log("User rejected the mini app addition or domain manifest JSON is invalid");
          // Handle the rejection here
        }
      }

      const ctx = (await sdk.context);
      if (ctx?.user) {
        setUser({ fid: ctx.user.fid, pfp: ctx.user.pfpUrl || "", userName: ctx.user.username || "" });
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="container">
      {user?.pfp && (
        <div className="flex items-center mb-4">
          <span className="text-lg">Hello {user.userName}!</span>
        </div>
      )}
      <div className="flex flex-col items-left justify-left">
        {/* <Image
          src="/assets/img/revnet-full-bw.svg"
          width={840}
          height={240}
          alt="Revnet logo"
        />
        <span className="sr-only">Revnet</span> */}
        <div className="text-xl md:text-2xl mt-8 font-medium text-left">
          Fund radical science.
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex gap-4 mt-8">
            <Link href="/create">
              <Button className="md:h-12 h-16 text-xl md:text-xl px-4 flex gap-2 bg-teal-500 hover:bg-teal-600">
                Create yours
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
