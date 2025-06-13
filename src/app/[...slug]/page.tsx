"use client";
import { useEffect, useState } from "react";
import { Nav } from "@/components/layout/Nav";
import { JB_CHAINS, JBChainId, jbUrn } from "juice-sdk-core";
import { Providers } from "./Providers";
import { NetworkDashboard } from "./components/NetworkDashboard/NetworkDashboard";
import { sdk } from "@farcaster/frame-sdk";
import { notFound as triggerNotFound } from 'next/navigation';

export default function Page({ params }: { params: { slug?: string[] } }) {
  const [projectId, setProjectId] = useState<bigint | undefined>(undefined);
  const [chainId, setChainId] = useState<JBChainId | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);
  
  const [initialized, setInitialized] = useState(false);

  const [user, setUser] = useState<{ fid: number; pfp: string; userName: string } | null>(null);

  useEffect(() => {
    if (user) return;
    const fetchUser = async () => {
      await sdk.actions.ready();
      const ctx = await (await sdk.context);
      if (ctx && ctx.user && typeof ctx.user.fid === "number") {
        setUser({ fid: ctx.user.fid, pfp: ctx.user.pfpUrl || "", userName: ctx.user.username || "" });
      }
    };
    fetchUser();
  }, [user]);

  useEffect(() => {
    try {
      const raw = params.slug?.[0];
      if (!raw || typeof raw !== "string") {
        throw new Error("Missing or invalid slug param");
      }

      // Sanitize input by removing query strings and trimming whitespace
      const sanitizedSlug = raw.split("?")[0].trim();

      const decoded = decodeURIComponent(sanitizedSlug);
      const urn = jbUrn(decoded);

      if (!urn?.projectId || !urn?.chainId || !JB_CHAINS[urn.chainId]) {
        throw new Error("Invalid URN format or unknown chain");
      }

      setProjectId(urn.projectId);
      setChainId(urn.chainId);
      setNotFound(false);
    } catch (error) {
      console.warn("URN decoding error:", error);
      setNotFound(true);
      setProjectId(undefined);
      setChainId(undefined);
    } finally {
    setInitialized(true);
  }
  }, [params.slug]);

  if (initialized && (notFound || !projectId || !chainId)) {
    triggerNotFound();
  }

  /*if (notFound || !projectId || !chainId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        {notFound ? "Not found" : "Loading..."}
      </div>
    );
  }*/

  if (initialized && chainId && projectId) {
    return (
      <Providers chainId={chainId} projectId={projectId}>
        <Nav />
        <NetworkDashboard />
      </Providers>
    );
  }
}