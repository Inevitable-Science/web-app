
export interface TokenResponse {
  name: string;
  isIptToken: boolean;
  logo: string;
  tags: string;
  ecosystem: string | null;
  ecosystemSite: string | null;
  socials: {
    site: string | null;
    linked_in: string | null;
    x: string | null;
    discord: string | null;
  };
  assetsUnderManagement: number | null;
  selectedToken: {
    address: string | null;
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
  tags: string;
  ecosystem: string | null;
  ecosystemSite: string | null;
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
  ecosystem: string | null;
  ecosystemSite: string | null;
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