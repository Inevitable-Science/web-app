import { DaoResponse, DaoResponseZ } from "../types/AnalyticTypes";

export const fetchDaoData = async (
  daoName: string
): Promise<DaoResponse | null> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CORE_API_URL}/analytics/dao/${daoName}`,
      { next: { revalidate: 900 } }
    );

    if (response.status === 404) {
      console.warn("No DAO data found");
      return null;
    }
    if (!response.ok) throw new Error("Failed to fetch DAO data");

    const daoData = await response.json();
    return DaoResponseZ.parse(daoData);
  } catch (err) {
    console.error(err);
    return null;
  }
};
