"use client";

import { OPEN_IPFS_GATEWAY_HOSTNAME } from "@/lib/ipfs";
import { JBProjectProvider, JBChainId } from "juice-sdk-react";
import { SelectedSuckerProvider } from "./components/PayCard/SelectedSuckerContext";

export function Providers({
  children,
  projectId,
  chainId,
}: {
  projectId: bigint;
  chainId: JBChainId;
  children: React.ReactNode;
}) {
  return (
    <JBProjectProvider
      chainId={chainId}
      projectId={projectId}
      ctxProps={{
        metadata: { ipfsGatewayHostname: OPEN_IPFS_GATEWAY_HOSTNAME },
      }}
    >
      <SelectedSuckerProvider>
      {children}
      </SelectedSuckerProvider>
    </JBProjectProvider>
  );
}
