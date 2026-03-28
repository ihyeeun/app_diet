import { getDayMeals } from "@/features/home/api/dayMeal";
import { isValidDateKey } from "@/shared/utils/dateFormat";
import { useQuery } from "@tanstack/react-query";

export function useDayMealsQuery(date: string) {
  return useQuery({
    queryKey: ["day-meals", date],
    queryFn: () => getDayMeals({ date }),
    enabled: isValidDateKey(date),
    staleTime: Infinity,
  });
}
