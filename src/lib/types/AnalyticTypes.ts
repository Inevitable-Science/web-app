import { z } from "zod";

export const DaoResponseZ = z.object({
  name: z.string(),
  logo: z.string(),
  backdrop: z.string(),
  dateCreated: z.string(),
  payments: z.number(),
  ethRaised: z.string(),
  tags: z.string(),
  socials: z.object({
    site: z.string().nullable(),
    linkedIn: z.string().nullable(),
    x: z.string().nullable(),
    discord: z.string().nullable(),
  }),
  description: z.string(),
  treasuryHoldings: z.number().nullable(),
  assetsUnderManagement: z.number().nullable(),
  nativeToken: z.object({
    name: z.string().nullable(),
    address: z.string().nullable(),
    mcTicker: z.string().nullable(),
    totalSupply: z.number().nullable(),
    totalHolders: z.number().nullable(),
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
    linkedIn: z.string().nullable(),
    x: z.string().nullable(),
    discord: z.string().nullable(),
  }),
  treasury: z.object({
    address: z.string(),
    ensName: z.string(),
    chainId: z.number(),
  }),
  signers: z.object({
    required: z.number(),
    total: z.number(),
    signers: z.array(z.string()),
  }),
  managedAccounts: z.array(
    z.object({
      address: z.string(),
      comment: z.string(),
      ens: z.string().nullable(),
      chainId: z.number(),
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
  token: z.object({
    address: z.string().nullable(),
    chainId: z.number().nullable(),
    logoUrl: z.string().nullable(),
    ticker: z.string().nullable(),
    name: z.string().nullable(),
    parentDao: z.string().nullable(),
    networks: z.array(z.number()).nullable(),
    totalSupply: z.number().nullable(),
    marketCap: z.number().nullable(),
    averageBal: z.number().nullable(),
    medianBal: z.number().nullable(),
    totalHolders: z.number().nullable(),
  }),
  topHolders: z
    .array(
      z.object({
        address: z.string().nullable(),
        tokenAmount: z.number().nullable(),
        accountType: z.string().nullable(),
      })
    )
    .nullable(),
  tokenDistribution: z
    .array(
      z.object({
        range: z.string().nullable(),
        accounts: z.string().nullable(),
        amountTokensHeld: z.number().nullable(),
        percentTokensHeld: z.number().nullable(),
      })
    )
    .nullable(),
});

export type TokenResponse = z.infer<typeof TokenResponseZ>;

export const HistoricalTreasuryResponseZ = z.object({
  historicalTreasury: z.array(z.tuple([z.number(), z.number()])),
  historicalAssets: z.array(z.tuple([z.number(), z.number()])),
  totalAssets: z.array(z.tuple([z.number(), z.number()])),
});

export type HistoricalTreasuryResponse = z.infer<
  typeof HistoricalTreasuryResponseZ
>;

export const OHLCResponseZ = z.array(
  z.tuple([z.number(), z.number(), z.number(), z.number(), z.number()])
);

export const MarketChartResponseZ = z.object({
  prices: z.array(z.tuple([z.number(), z.number()])),
  market_caps: z.array(z.tuple([z.number(), z.number()])),
  total_volumes: z.array(z.tuple([z.number(), z.number()])),
});

export type MarketChartResponse = z.infer<typeof MarketChartResponseZ>;

export const TokenHoldersResponseZ = z.object({
  holders: z.array(z.tuple([z.number(), z.number()])),
});

export type TokenHoldersType = z.infer<typeof TokenHoldersResponseZ>;

export const LegacyActivityResponseZ = z.object({
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
  data: z.array(
    z.object({
      date: z.string(),
      ethPaid: z.string(),
      usdValue: z.string(),
      payerAddress: z.string(),
      beneficiary: z.string(),
      transactionHash: z.string(),
    })
  ),
});

export type ActivityResponse = z.infer<typeof LegacyActivityResponseZ>;

export const TokenPriceResponseZ = z.array(
  z.object({
    token: z.string(),
    price: z.number()
  })
);

export type TokenPriceResponse = z.infer<typeof TokenPriceResponseZ>;
