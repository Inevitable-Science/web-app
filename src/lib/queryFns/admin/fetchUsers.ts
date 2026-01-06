import { AllUsersResponseZ, User } from "../../types/AdminArticleTypes";

export const fetchAllUsers = async (user: User, authToken: string) => {
  if (!user?.isTopLevelAdmin || !authToken) {
    throw new Error("Unauthorized: Admin access or token missing");
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_ARTICLE_API_ENDPOINT}/user/all`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return AllUsersResponseZ.parse(data.users); // Zod validation + parsing
};
