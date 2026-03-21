import {
  DEFAULT_MEAL_TYPE,
  MEAL_TYPE_SET,
  type MealType,
} from "../types/mealRecord.types";

export function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSafeDateKey(value: string | null) {
  if (!value) return getTodayDateKey();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return getTodayDateKey();
}

export function getMealType(value: string | null): MealType {
  if (value && MEAL_TYPE_SET.has(value as MealType)) {
    return value as MealType;
  }

  return DEFAULT_MEAL_TYPE;
}
