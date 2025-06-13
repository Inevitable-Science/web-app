"use client";
import { useEffect, useState } from "react";
import { Nav } from "@/components/layout/Nav";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";
import { sdk } from "@farcaster/frame-sdk";
import { JBChainId } from "juice-sdk-core";

export default function ClientComponent({
  chainId,
  projectId,
}: {
  chainId: JBChainId;
  projectId: bigint;
}) {
  const [user, setUser] = useState<{ fid: number; pfp: string; userName: string } | null>(null);

  useEffect(() => {
    if (user) return;
    const fetchUser = async () => {
      await sdk.actions.ready();
      const ctx = await sdk.context;
      if (ctx && ctx.user && typeof ctx.user.fid === "number") {
        setUser({
          fid: ctx.user.fid,
          pfp: ctx.user.pfpUrl || "",
          userName: ctx.user.username || "",
        });
      }
    };
    fetchUser();
  }, [user]);

  return (
    <Providers chainId={chainId} projectId={projectId}>
      <Nav />
      {user?.pfp && (
        <div className="flex items-center mb-4">
          <span className="px-4 text-lg">Hello {user.userName}!</span>
        </div>
      )}
      <NetworkDashboard />
    </Providers>
  );
}