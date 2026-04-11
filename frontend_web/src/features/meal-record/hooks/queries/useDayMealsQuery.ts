import { useQuery } from "@tanstack/react-query";

import { getDayMeals } from "@/features/meal-record/api/DayMeal";
import { isValidDateKey } from "@/shared/utils/dateFormat";

export function useDayMealsQuery(date: string) {
  return useQuery({
    queryKey: ["lagacy", date],
    queryFn: () => getDayMeals({ date }),
    enabled: isValidDateKey(date),
  });
}
