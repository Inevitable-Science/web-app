"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider } from "connectkit";
import { wagmiConfig } from "@/lib/wagmiConfig";
import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { WagmiProvider } from "wagmi";

const DynamicAppSpecificProviders = dynamic(
  () => import('./AppSpecificProviders').then(mod => mod.AppSpecificProviders),
  {
    ssr: false,
    loading: () => null,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't load providers for splash
  const isSplashPage = pathname === '/';
  if (isSplashPage) {
    const queryClient = new QueryClient();

    return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
                  theme="auto"
                  mode="dark"
                  customTheme={{
                    "--ck-font-family": "var(--font-simplon-norm)",
                    "--ck-connectbutton-border-radius": "0",
                    "--ck-accent-color": "#14B8A6",
                    "--ck-accent-text-color": "#ffffff",
                  }}
                >
      {children}
      </ConnectKitProvider>
      </QueryClientProvider>
      </WagmiProvider>
      );
  }

  // For all other pages, render the dynamically imported AppSpecificProviders
  return <DynamicAppSpecificProviders>{children}</DynamicAppSpecificProviders>;
}