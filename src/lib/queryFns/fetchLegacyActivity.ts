import { LegacyActivityResponseZ } from "../types/AnalyticTypes";

export const fetchLegacyActivity = async (daoName: string, page: number) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_CORE_API_URL}/analytics/dao/legacy/activity/${daoName}/${page}/75`
  );

  if (!response.ok) throw new Error("Failed to fetch legacy activity");

  const data = await response.json();
  return LegacyActivityResponseZ.parse(data);
};
