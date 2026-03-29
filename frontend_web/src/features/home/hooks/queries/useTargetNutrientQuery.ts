import { useQuery } from "@tanstack/react-query";

import { getTargetNutrientFromServer } from "@/features/home/api/targetNutrient";

export function useTargetNutrientQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["targets", "fallback"],
    queryFn: getTargetNutrientFromServer,
    enabled,
  });
}
