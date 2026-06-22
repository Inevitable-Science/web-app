import { TokenPriceResponseZ } from "../types/AnalyticTypes";

export const fetchTokenPrices = async (tokens: string[]) => {
  const tokensParam = tokens.join(":");

  const apiUrl = `${process.env.NEXT_PUBLIC_CORE_API_URL}/analytics/tokenPrices/${tokensParam}`;
  const response = await fetch(apiUrl);

  if (!response.ok) throw new Error("Failed to fetch tokenPrice");
  const data = await response.json();

  return TokenPriceResponseZ.parse(data);
};
