import { cache } from "react";
import { Chain, createPublicClient, Transport } from "viem";
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

const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

const mainnetChains = [mainnet, base, arbitrum, optimism] as const;
const testnetChains = [sepolia, baseSepolia, arbitrumSepolia, optimismSepolia] as const;

const chains: readonly [Chain, ...Chain[]] = [
  ...mainnetChains,
  ...(isProduction ? [] : testnetChains),
];

const testnetTransports = {
  [sepolia.id]: fallback([
    http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http(
      `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY}`
    ),
    http(`https://juicebox.center/v1/rpc/${sepolia.id}`),
  ]),
  [optimismSepolia.id]: fallback([
    http(
      `https://optimism-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY}`
    ),
    http(`https://juicebox.center/v1/rpc/${optimismSepolia.id}`),
  ]),
  [baseSepolia.id]: fallback([
    http(
      `https://base-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY}`
    ),
    http(`https://juicebox.center/v1/rpc/${baseSepolia.id}`),
  ]),
  [arbitrumSepolia.id]: fallback([
    http(
      `https://arbitrum-sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY}`
    ),
    http(`https://juicebox.center/v1/rpc/${arbitrumSepolia.id}`),
  ]),
};

const mainnetTransports = {
  [mainnet.id]: fallback([
    http(`https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`),
    http(
      `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY}`
    ),
    http(`https://juicebox.center/v1/rpc/${mainnet.id}`),
  ]),
  [optimism.id]: fallback([
    http(
      `https://optimism-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY}`
    ),
    http(`https://juicebox.center/v1/rpc/${optimism.id}`),
  ]),
  [base.id]: fallback([
    http(
      `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY}`
    ),
    http(`https://juicebox.center/v1/rpc/${base.id}`),
  ]),
  [arbitrum.id]: fallback([
    http(
      `https://arbitrum-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`
    ),
    http(
      `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_RPC_KEY}`
    ),
    http(`https://juicebox.center/v1/rpc/${arbitrum.id}`),
  ]),
};

// Testnet RPCs are only included in development
const transports: Record<number, Transport> = isProduction
  ? mainnetTransports
  : { ...mainnetTransports, ...testnetTransports };

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    safeConnector,
    coinbaseWallet({
      appName: "Inevitable",
      appLogoUrl: "https://cdn.inevitable.science/static/img/branding/icon.svg",
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      showQrModal: false,
      metadata: {
        name: "Inevitable Science",
        description: "Fund radical science.",
        url: "https://inevitable.science",
        icons: ["https://cdn.inevitable.science/static/img/branding/icon.svg"],
      },
    }),
  ],
  transports,
});

export type ViemChainIdType =
  | keyof typeof mainnetTransports
  | keyof typeof testnetTransports;

export const TransportChainIds = Object.keys(transports).map(Number);

export const getViemPublicClient = cache((chainId: ViemChainIdType) => {
  const transport = transports[chainId];
  if (!transport)
    throw new Error(`Transport not found for chainId: ${chainId}`);

  return createPublicClient({
    batch: { multicall: true },
    chain: chains.find((chain) => chain.id === chainId),
    transport,
  });
});
