import { getTargetNutritionFromServer } from "@/features/home/api/targetNutrition";
import { useQuery } from "@tanstack/react-query";

export function useTargetNutritionQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["targets", "fallback"],
    queryFn: getTargetNutritionFromServer,
    enabled,
  });
}
