import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/features/profile/api/profile";
import { queryKeys } from "@/features/profile/hooks/queries/queryKey";

type UseGetProfileQueryOptions = {
  enabled?: boolean;
};

export function useGetProfileQuery(options?: UseGetProfileQueryOptions) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    staleTime: Infinity,
    enabled: options?.enabled,
  });
}
