"use client";

import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs";
import { JBProjectProvider, JBChainId, JBVersion } from "juice-sdk-react";
import { SelectedSuckerProvider } from "./components/PayCard/SelectedSuckerContext";
import { BendystrawConfig } from "juice-sdk-react/dist/lib/bendystraw/getBendystrawUrl";
import { notFound } from "next/navigation";

export function Providers({
  children,
  projectId,
  chainId,
  version,
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
      bendystraw={bendystrawProvider as BendystrawConfig}
      ctxProps={{
        metadata: { ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME },
      }}
    >
      <SelectedSuckerProvider>{children}</SelectedSuckerProvider>
    </JBProjectProvider>
  );
}
