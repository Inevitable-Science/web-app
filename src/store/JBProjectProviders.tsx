// Initializes JB Contexts within project pages - crucial for data & stores.

"use client";
import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs/ipfs";
import { JBProjectProvider, JBChainId, JBVersion } from "juice-sdk-react";
import { notFound } from "next/navigation";

export function JBProjectProviderRoot({
  children,
  projectId,
  version,
  chainId,
}: {
  projectId: bigint;
  chainId: JBChainId;
  version: JBVersion;
  children: React.ReactNode;
}) {
  const url = process.env.NEXT_PUBLIC_BENDYSTRAW_URL;
  if (!url) return notFound();

  const pathname = new URL(url).pathname;
  const bendystrawApiKey = pathname.replace("/", "");

  const bendystrawProvider = {
    apiKey: bendystrawApiKey,
  };

  return (
    <JBProjectProvider
      chainId={chainId}
      projectId={projectId}
      version={version}
      bendystraw={bendystrawProvider}
      ctxProps={{
        metadata: { ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME },
      }}
    >
      {children}
    </JBProjectProvider>
  );
}
