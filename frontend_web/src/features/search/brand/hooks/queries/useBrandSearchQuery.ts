import { useQuery } from "@tanstack/react-query";

import { getBrandSearch } from "@/features/search/brand/api/brandSearch";

type UseGetBrandSearchQueryOptions = {
  enabled?: boolean;
};

export function useGetBrandSearchQuery(
  brandName: string,
  options?: UseGetBrandSearchQueryOptions,
) {
  const normalizedBrandName = brandName.trim();

  return useQuery({
    queryKey: ["brand-search", normalizedBrandName],
    queryFn: () => getBrandSearch(normalizedBrandName),
    enabled: (options?.enabled ?? true) && normalizedBrandName.length > 0,
  });
}
