import { z } from "zod";

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

export type DaoResponse = z.infer<typeof DaoResponseSchema>;

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

export type TreasuryResponse = z.infer<typeof TreasuryResponseSchema>;

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

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export const MarketChartResponseSchema = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
  market_caps: z.array(z.tuple([z.number(), z.number()])),
});

export type MarketChartResponse = z.infer<typeof MarketChartResponseSchema>;
