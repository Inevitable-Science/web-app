import { z } from "zod";

export interface TokenResponse {
  name: string;
  isIptToken: boolean;
  logo: string;
  tags: string;
  socials: {
    site: string | null;
    linked_in: string | null;
    x: string | null;
    discord: string | null;
  };
  assetsUnderManagement: number | null;
  selectedToken: {
    address: string | null;
    chain_id: number | null;
    logoUrl: string | null;
    ticker: string | null;
    tokenType: string | null;
    website: string | null;
    name: string | null;
    description: string | null;
    parentDao: string | null;
    networks: string[] | null;
    totalSupply: number | null;
    marketCap: number | null;
    averageBal: number | null;
    medianBal: number | null;
    totalHolders: string | null;
  };
  topHolders: Array<{
    address: string | null;
    token_amount: number | null;
    account_type: string | null;
  }> | null;
  tokenDistribution: Array<{
    range: string | null;
    accounts: string | null;
    amount_tokens_held: number | null;
    percent_tokens_held: number | null;
  }> | null;
}

export interface DaoResponse {
  name: string;
  logo: string;
  backdrop: string;
  date_created: string;
  payments: number;
  eth_raised: string;
  tags: string;
  socials: {
    site: string | null;
    linked_in: string | null;
    x: string | null;
    discord: string | null;
  };
  description: string;
  treasuryHoldings: string | null;
  assetsUnderManagement: number | null;
  nativeToken: {
    name: string | null;
    address: string | null;
    mc_ticker: string | null;
    totalSupply: number | null;
    totalHolders: string | null;
    marketCap: number | null;
  };
  ipt: Array<{
    name: string | null;
    backdrop: string | null;
    logo: string | null;
    description: string | null;
    tokenType: string | null;
  }> | null;
}

export interface TreasuryResponse {
  name: string;
  logo: string;
  description: string;
  tags: string;
  socials: {
    site: string | null;
    linked_in: string | null;
    x: string | null;
    discord: string | null;
  };
  treasury: {
    address: string;
    ens_name: string;
  };
  signers: {
    required: number;
    total: number;
    signers: string[];
  };
  managed_accounts: {
    [key: string]: {
      comment: string;
      ens: string | null;
      chain: string;
    };
  };
  treasuryValue: number;
  assetsUnderManagement: number | null;
  lastUpdated: Date | string | null;
  treasuryTokens: Array<{
    metadata: {
      name: string;
      symbol: string;
      decimals: number;
    };
    contractAddress: string | null;
    rawBalance: string;
    decodedBalance: number;
    price: number;
    totalValue: number;
  }>;
  historicalReturns: {
    [key: string]: {
      pastValue: number | string;
      dollarReturn: string;
      percentReturn: string;
    };
  };
}

export interface MarketChartResponse {
  prices: [number, number][];
  market_caps: [number, number][];
}

// TODO : Migrate to ZOD

export const DaoResponseSchema = z.object({
  name: z.string(),
  logo: z.string(),
  backdrop: z.string(),
  date_created: z.string(),
  payments: z.number(),
  eth_raised: z.string(),
  tags: z.string(),
  socials: z.object({
    site: z.string().nullable(),
    linked_in: z.string().nullable(),
    x: z.string().nullable(),
    discord: z.string().nullable(),
  }),
  description: z.string(),
  treasuryHoldings: z.string().nullable(),
  assetsUnderManagement: z.number().nullable(),
  nativeToken: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    mc_ticker: z.string().nullable(),
    totalSupply: z.number().nullable(),
    totalHolders: z.string().nullable(),
    marketCap: z.number().nullable(),
  }),
  ipt: z
    .array(
      z.object({
        name: z.string().nullable(),
        backdrop: z.string().nullable(),
        logo: z.string().nullable(),
        description: z.string().nullable(),
        tokenType: z.string().nullable(),
      })
    )
    .nullable(),
});

export type DaoResponseZod = z.infer<typeof DaoResponseSchema>;

export const TokenResponseSchema = z.object({
  name: z.string(),
  isIptToken: z.boolean(),
  logo: z.string(),
  tags: z.string(),
  socials: z.object({
    site: z.string().nullable(),
    linked_in: z.string().nullable(),
    x: z.string().nullable(),
    discord: z.string().nullable(),
  }),
  assetsUnderManagement: z.number().nullable(),
  selectedToken: z.object({
    address: z.string().nullable(),
    chain_id: z.number().nullable(),
    logoUrl: z.string().nullable(),
    ticker: z.string().nullable(),
    tokenType: z.string().nullable(),
    website: z.string().nullable(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    parentDao: z.string().nullable(),
    networks: z.array(z.string()).nullable(),
    totalSupply: z.number().nullable(),
    marketCap: z.number().nullable(),
    averageBal: z.number().nullable(),
    medianBal: z.number().nullable(),
    totalHolders: z.string().nullable(),
  }),
  topHolders: z
    .array(
      z.object({
        address: z.string().nullable(),
        token_amount: z.number().nullable(),
        account_type: z.string().nullable(),
      })
    )
    .nullable(),
  tokenDistribution: z
    .array(
      z.object({
        range: z.string().nullable(),
        accounts: z.string().nullable(),
        amount_tokens_held: z.number().nullable(),
        percent_tokens_held: z.number().nullable(),
      })
    )
    .nullable(),
});

export type TokenResponseZod = z.infer<typeof TokenResponseSchema>;

export const TreasuryResponseSchema = z.object({
  name: z.string(),
  logo: z.string(),
  description: z.string(),
  tags: z.string(),
  socials: z.object({
    site: z.string().nullable(),
    linked_in: z.string().nullable(),
    x: z.string().nullable(),
    discord: z.string().nullable(),
  }),
  treasury: z.object({
    address: z.string(),
    ens_name: z.string(),
  }),
  signers: z.object({
    required: z.number(),
    total: z.number(),
    signers: z.array(z.string()),
  }),
  managed_accounts: z.record(
    z.object({
      comment: z.string(),
      ens: z.string().nullable(),
      chain: z.string(),
    })
  ),
  treasuryValue: z.number(),
  assetsUnderManagement: z.number().nullable(),
  lastUpdated: z.union([z.date(), z.string(), z.null()]),
  treasuryTokens: z.array(
    z.object({
      metadata: z.object({
        name: z.string(),
        symbol: z.string(),
        decimals: z.number(),
      }),
      contractAddress: z.string().nullable(),
      rawBalance: z.string(),
      decodedBalance: z.number(),
      price: z.number(),
      totalValue: z.number(),
    })
  ),
  historicalReturns: z.record(
    z.object({
      pastValue: z.union([z.number(), z.string()]),
      dollarReturn: z.string(),
      percentReturn: z.string(),
    })
  ),
});

export type TreasuryResponseZod = z.infer<typeof TreasuryResponseSchema>;
