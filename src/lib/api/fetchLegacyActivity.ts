import { LegacyActivityResponseZ } from "../types/AnalyticTypes";


export const fetchLegacyActivity = async (daoName: string, page: number) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/legacy/activity/${daoName}?page=${page}&limit=75`
  );

  if (!response.ok) throw new Error("Couldn't fetch legacy activity");

  const data = await response.json();
  return LegacyActivityResponseZ.parse(data);
}