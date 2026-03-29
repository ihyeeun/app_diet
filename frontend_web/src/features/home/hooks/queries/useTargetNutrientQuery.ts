import { getTargetNutrientFromServer } from "@/features/home/api/targetNutrient";
import { useQuery } from "@tanstack/react-query";

export function useTargetNutrientQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["targets", "fallback"],
    queryFn: getTargetNutrientFromServer,
    enabled,
  });
}
