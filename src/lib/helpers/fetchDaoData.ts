import { DaoResponse, DaoResponseZ } from "../types/AnalyticTypes";

export const fetchDaoData = async (daoName: string): Promise<DaoResponse | null> => {
  try {
    const daoResponse = await fetch(
      `${process.env.NEXT_PUBLIC_STATS_API_ENDPOINT}/dao/${daoName}`,
      { next: { revalidate: 900 } }
    );

    if (!daoResponse.ok) throw new Error("Couldn't fetch DAO data");

    const daoData = await daoResponse.json();
    return DaoResponseZ.parse(daoData);
  } catch (err) {
    console.error(err);
    return null;
  }
};
