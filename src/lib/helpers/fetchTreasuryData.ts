import { TreasuryResponse, TreasuryResponseZ } from "../types/AnalyticTypes";

export const fetchTreasuryData = async (daoName: string): Promise<TreasuryResponse | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/treasury/${daoName}`,
      { next: { revalidate: 900 } }
    );

    if (response.status === 404) {
      console.log("No treasury data found");
      return null;
    }
    if (!response.ok) throw new Error("Failed to fetch treasury data");

    const data = await response.json();
    return TreasuryResponseZ.parse(data);
  } catch (err) {
    console.error(err);
    return null;
  }
};
