import { z } from "zod";

export const DaoResponseZ = z.object({
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
});

export type DaoResponse = z.infer<typeof DaoResponseZ>;

export const TreasuryResponseZ = z.object({
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
    chain_id: z.number()
  }),
  signers: z.object({
    required: z.number(),
    total: z.number(),
    signers: z.array(z.string()),
  }),
  managed_accounts: z.array(
    z.object({
      address: z.string(),
      comment: z.string(),
      ens: z.string().nullable(),
      chain_id: z.number(),
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
  historicalReturns: z.array(
    z.object({
      dateRange: z.string(),
      pastValue: z.union([z.number(), z.string()]),
      dollarReturn: z.string(),
      percentReturn: z.string(),
    })
  ),
});

export type TreasuryResponse = z.infer<typeof TreasuryResponseZ>;

export const TokenResponseZ = z.object({
  name: z.string(),
  logo: z.string(),
  assetsUnderManagement: z.number().nullable(),
  selectedToken: z.object({
    address: z.string().nullable(),
    chain_id: z.number().nullable(),
    logoUrl: z.string().nullable(),
    ticker: z.string().nullable(),
    name: z.string().nullable(),
    parentDao: z.string().nullable(),
    networks: z.array(z.number()).nullable(),
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

export type TokenResponse = z.infer<typeof TokenResponseZ>;


export const HistoricalTreasuryResponseZ = z.object({
  historical_treasury: z.array(
    z.tuple([z.number(), z.number()])
  ),
  historical_assets: z.array(
    z.tuple([z.number(), z.number()])
  ),
  total_assets: z.array(
    z.tuple([z.number(), z.number()])
  ),
});

export type HistoricalTreasuryResponse = z.infer<typeof HistoricalTreasuryResponseZ>;

export const OHLCResponseZ = z.array(
  z.tuple([
    z.number(),
    z.number(),
    z.number(),
    z.number(),
    z.number(),
  ])
);

export const MarketChartResponseZ = z.object({
  prices: z.array(
    z.tuple([
      z.number(),
      z.number(),
    ])
  ),
  market_caps: z.array(
    z.tuple([
      z.number(),
      z.number(),
    ])
  ),
  total_volumes: z.array(
    z.tuple([
      z.number(),
      z.number(),
    ])
  ),
});

export type MarketChartType = z.infer<typeof MarketChartResponseZ>;


export const TokenHoldersResponseZ = z.object({
  holders: z.array(
    z.tuple([z.number(), z.number()]),
  )
});

export type TokenHoldersType = z.infer<typeof TokenHoldersResponseZ>;