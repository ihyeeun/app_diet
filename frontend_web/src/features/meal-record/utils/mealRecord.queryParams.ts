import { DEFAULT_MEAL_TYPE, MEAL_TYPE_SET, type MealType } from "@/shared/api/types/nutrient.dto";
import { getTodayFormatDateKey } from "@/shared/utils/dateFormat";

export function getSafeDateKey(value: string | null) {
  if (!value) return getTodayFormatDateKey();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return getTodayFormatDateKey();
}

export function getMealType(value: string | null): MealType {
  if (value && MEAL_TYPE_SET.has(value as MealType)) {
    return value as MealType;
  }

  return DEFAULT_MEAL_TYPE;
}
