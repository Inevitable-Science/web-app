import { HistoricalTreasuryResponseZ } from "../types/AnalyticTypes";

export const fetchHistoricalTreasury = async (daoName: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/treasury/historical/${daoName}`;

  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("Couldn't fetch historical treasury");

  const data = await response.json();
  return HistoricalTreasuryResponseZ.parse(data);
};
