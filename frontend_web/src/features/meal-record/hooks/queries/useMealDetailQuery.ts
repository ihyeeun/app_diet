import { getMealDetail } from "@/features/meal-record/api/mealDetail";
import { useQuery } from "@tanstack/react-query";

export function useMealDetatilQuery(menuId: number | null) {
  const isValidMenuId = Number.isInteger(menuId) && (menuId as number) > 0;

  return useQuery({
    queryKey: ["meal-detail", menuId],
    queryFn: () => getMealDetail(menuId as number),
    enabled: isValidMenuId,
  });
}
