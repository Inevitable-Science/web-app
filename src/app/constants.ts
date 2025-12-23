import { JBChainId } from "juice-sdk-react";
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

export const MAX_RULESET_COUNT = 3;
export const RESERVED_TOKEN_SPLIT_GROUP_ID = 1n;
export const REVNET_CASHOUT_FEE_PERCENT = 0.025;

export const chainSortOrder = new Map<JBChainId, number>([
  [sepolia.id, 0],
  [optimismSepolia.id, 1],
  [baseSepolia.id, 2],
  [arbitrumSepolia.id, 3],
]);

export const chainIdToLogo = {
  [sepolia.id]: "https://cdn.inevitable.science/static/img/logo/mainnet.svg",
  [optimismSepolia.id]: "https://cdn.inevitable.science/static/img/logo/optimism.svg",
  [baseSepolia.id]: "https://cdn.inevitable.science/static/img/logo/base.svg",
  [arbitrumSepolia.id]: "https://cdn.inevitable.science/static/img/logo/arbitrum.svg",
  [mainnet.id]: "https://cdn.inevitable.science/static/img/logo/mainnet.svg",
  [optimism.id]: "https://cdn.inevitable.science/static/img/logo/optimism.svg",
  [base.id]: "https://cdn.inevitable.science/static/img/logo/base.svg",
  [arbitrum.id]: "https://cdn.inevitable.science/static/img/logo/arbitrum.svg",
};

export const BACKED_BY_TOKENS = ["ETH", "USDC"] as const;
export const USDC_DECIMALS = 6;

export const JB_CURRENCY_ETH = 1;
export const JB_CURRENCY_USD = 2;

export const isProduction = process.env.NODE_ENV === "production";
export const externalBaseUrl = isProduction
  ? "https://inevitable.science/"
  : "https://147585e1f72a.ngrok.app";
