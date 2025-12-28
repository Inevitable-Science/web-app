/*
// Include Testnets
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  sepolia,
} from "viem/chains";
import { createConfig, http, fallback } from "wagmi";
import { coinbaseWallet, safe, walletConnect } from "wagmi/connectors";

const safeConnector = safe({
  allowedDomains: [/^app\.safe\.global$/],
  debug: true,
  shimDisconnect: true,
});

export const wagmiConfig = createConfig({
    chains: [mainnet, optimism, arbitrum, base, sepolia, optimismSepolia, baseSepolia, arbitrumSepolia],
    connectors: [
      safeConnector,
      coinbaseWallet({
        appName: "REVNET",
        appLogoUrl: "https://inevitable.science/assets/img/branding/icon.svg",
      }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        showQrModal: false,
        metadata: {
          name: "Inevitable Sciences",
          description: "Fund radical science.",
          url: "https://app.inevitable.science",
          icons: ["https://inevitable.science/assets/img/branding/icon.svg"],
        },
      }),
    ],
    transports: {
      [sepolia.id]: fallback([
        http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
        http("https://eth-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      ]),
      [optimismSepolia.id]: fallback([
        http(`https://optimism-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
        http("https://opt-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      ]),
      [baseSepolia.id]: fallback([
        http("https://base-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
        http(`https://api.developer.coinbase.com/rpc/v1/base-sepolia/${process.env.NEXT_PUBLIC_BASE_ID}`),
      ]),
      [arbitrumSepolia.id]: fallback([
        http(`https://arbitrum-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
        http("https://arb-sepolia.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      ]),
      [mainnet.id]: fallback([
        http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
        http("https://eth-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      ]),
      [optimism.id]: fallback([
        http(`https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
        http("https://opt-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      ]),
      [base.id]: fallback([
        http(`https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
        http(`https://api.developer.coinbase.com/rpc/v1/base/${process.env.NEXT_PUBLIC_BASE_ID}`),
        http("https://base-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      ]),
      [arbitrum.id]: fallback([
        http(`https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
        http("https://arb-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"),
      ]),
    },
  });
*/

import { cache } from "react";
import { createPublicClient } from "viem";
import { arbitrum, base, mainnet, optimism } from "viem/chains";
import { createConfig, http, fallback } from "wagmi";
import {
  coinbaseWallet,
  safe,
  walletConnect,
} from "wagmi/connectors";

const safeConnector = safe({
  allowedDomains: [/^app\.safe\.global$/],
  debug: true,
  shimDisconnect: true,
});

const isProduction = process.env.NODE_ENV === "production";

const chains = [
  arbitrum,
  base,
  mainnet,
  optimism
] as const;

const transports = {
  [mainnet.id]: fallback([
    http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http(
      "https://eth-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"
    ),
  ]),
  [optimism.id]: fallback([
    http(
      `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      "https://opt-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"
    ),
  ]),
  [base.id]: fallback([
    http(
      `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      `https://api.developer.coinbase.com/rpc/v1/base/${process.env.NEXT_PUBLIC_BASE_ID}`
    ),
    http(
      "https://base-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"
    ),
  ]),
  [arbitrum.id]: fallback([
    http(
      `https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      "https://arb-mainnet.g.alchemy.com/v2/Y7igjs135LhJTJbYavxq9WlhuAZQVn03"
    ),
  ]),
};

export const wagmiConfig = createConfig({
  chains,
  ssr: true,
  connectors: [
    coinbaseWallet({
      appName: "Inevitable Science",
      appLogoUrl: "https://inevitable.science/assets/img/branding/icon.svg",
    }),
    safeConnector,
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      showQrModal: false,
      metadata: {
        name: "Inevitable Sciences",
        description: "Fund radical science.",
        url: isProduction
          ? "https://inevitable.science"
          : "http://localhost:3000",
        icons: ["https://inevitable.science/assets/img/branding/icon.svg"],
      },
    }),
  ],
  transports,
});

export type ViemChainIdType = keyof typeof transports;

export const getViemPublicClient = cache((chainId: ViemChainIdType) => {
  const transport = transports[chainId];
  if (!transport) throw new Error(`Transport not found for chainId: ${chainId}`);

  return createPublicClient({
    batch: { multicall: true },
    chain: chains.find((chain) => chain.id === chainId),
    transport,
  });
});
