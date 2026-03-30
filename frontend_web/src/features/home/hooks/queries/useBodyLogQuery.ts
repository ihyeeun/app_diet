import { useQuery } from "@tanstack/react-query";

import { getBodyStats } from "@/features/home/api/health";
import { queryKeys } from "@/features/home/hooks/queries/queryKey";

export function useGetBodyLog(date: string) {
  return useQuery({
    queryKey: queryKeys.bodyStats(date),
    queryFn: () => getBodyStats({ date }),
    staleTime: Infinity,
  });
}
