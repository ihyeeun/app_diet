import { DEFAULT_MEAL_TYPE, MEAL_TYPE_SET, type MealType } from "@/shared/api/types/api.dto";
import { getTodayFormatDateKey } from "@/shared/utils/dateFormat";

export function getSafeDateKey(value: string | null) {
  if (!value) return getTodayFormatDateKey();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return getTodayFormatDateKey();
}

export function getMealType(value: number | null): MealType {
  if (value !== null && MEAL_TYPE_SET.has(value as MealType)) {
    return value as MealType;
  }

  return DEFAULT_MEAL_TYPE;
}
