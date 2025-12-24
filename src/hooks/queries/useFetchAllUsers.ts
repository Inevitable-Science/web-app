import { fetchAllusers } from "@/lib/api/users";
import { AllUsersResponse } from "@/lib/types/AdminArticleTypes"
import { useAuthToken, useUser } from "@/store/AdminAuthStore";
import { useQuery } from "@tanstack/react-query"


export const useFetchAllUsers = () => {
  const { user } = useUser();
  const { authToken } = useAuthToken();

  const enabled = !!user && !!authToken;

  return useQuery<AllUsersResponse>({
    queryKey: ["allUsers"],
    queryFn: () => fetchAllusers(user?.user!, authToken!),
    enabled,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}