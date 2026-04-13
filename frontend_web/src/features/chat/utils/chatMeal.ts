import { DEFAULT_MEAL_TYPE, MEAL_TYPE_SET, type MealType } from "@/shared/api/types/api.dto";

export function getMealTypeFromChatMealTime(value: number): MealType {
  const asMealType = String(value);
  if (MEAL_TYPE_SET.has(asMealType as MealType)) {
    return asMealType as MealType;
  }

  return DEFAULT_MEAL_TYPE;
}

export function formatQuantityText(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);
}
