import { useQuery } from "@tanstack/react-query";

import { getDayMeals } from "@/features/home/api/dayMeal";
import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { isValidDateKey } from "@/shared/utils/dateFormat";

export function useDayMealsQuery(date: string) {
  return useQuery({
    queryKey: queryKeys.dayMeals(date),
    queryFn: () => getDayMeals({ date }),
    enabled: isValidDateKey(date),
    staleTime: Infinity,
  });
}
