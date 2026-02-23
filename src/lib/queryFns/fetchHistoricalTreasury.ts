import { HistoricalTreasuryResponseZ } from "../types/AnalyticTypes";

export const fetchHistoricalTreasury = async (daoName: string) => {
  const apiUrl = `${process.env.NEXT_PUBLIC_CORE_API_URL}/analytics/chart/treasury/${daoName}`;

  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error("Failed to fetch historical treasury");

  const data = await response.json();
  return HistoricalTreasuryResponseZ.parse(data);
};
