import { fetchOrganisation } from "@/lib/api/admin/fetchOrganisation";
import { FetchOrganisationResponse } from "@/lib/types/AdminArticleTypes";
import { useAuthToken } from "@/store/AdminAuthStore";
import { useQuery } from "@tanstack/react-query";

export const useFetchOrganisation = (organisationId: string) => {
  const { authToken } = useAuthToken();
  const enabled = !!organisationId && !!authToken;

  return useQuery<FetchOrganisationResponse>({
    queryKey: ["organisation", organisationId],
    queryFn: () => fetchOrganisation(organisationId!, authToken!),
    enabled,
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
