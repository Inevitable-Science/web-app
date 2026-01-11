import { TokenHoldersResponseZ } from "../types/AnalyticTypes";

export const fetchHistoricalHolders = async (tokenName: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/token/chart/holders/${tokenName}`;

  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("Couldn't fetch historical token holders");

  const data = await response.json();
  return TokenHoldersResponseZ.parse(data);
};
