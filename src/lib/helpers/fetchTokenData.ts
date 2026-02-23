import { TokenResponse, TokenResponseZ } from "../types/AnalyticTypes";

export const fetchTokenData = async (
  tokenName: string | null
): Promise<TokenResponse | null> => {
  try {
    if (!tokenName) throw new Error("No token name provided"); // throw gracefully

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/analytics/token/${tokenName}`,
      { next: { revalidate: 900 } }
    );

    if (response.status === 404) {
      console.log("No token data found");
      return null;
    }
    if (!response.ok) throw new Error("Failed to fetch token data");

    const data = await response.json();
    return TokenResponseZ.parse(data);
  } catch (err) {
    console.error(err);
    return null;
  }
};
