import { getDayMeals } from "@/features/meal-record/api/DayMeal";
import { useQuery } from "@tanstack/react-query";

function isValidDateKey(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function useDayMealsQuery(date: string) {
  return useQuery({
    queryKey: ["day-meals", date],
    queryFn: () => getDayMeals({ date }),
    enabled: isValidDateKey(date),
  });
}
