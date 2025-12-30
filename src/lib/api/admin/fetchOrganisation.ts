import { FetchOrganisationResponseZ } from "../../types/AdminArticleTypes";

export const fetchOrganisation = async (
  organisationId: string,
  authToken: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/organisation/${organisationId}`,
    {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch organisation`);
  }

  const data = await response.json();
  return FetchOrganisationResponseZ.parse(data);
};
