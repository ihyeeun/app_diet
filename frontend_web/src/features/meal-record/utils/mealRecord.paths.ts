import { PATH } from "@/router/path";
import type { MealType } from "@/shared/api/types/api.dto";

function buildMealRecordQuery(dateKey: string, mealType: MealType, menuId?: number) {
  const params = new URLSearchParams({
    date: dateKey,
    mealType,
  });

  if (menuId !== undefined) {
    params.set("menuId", String(menuId));
  }

  return params.toString();
}

export function getMealRecordPath(dateKey: string, mealType: MealType) {
  return `${PATH.MEAL_RECORD}?${buildMealRecordQuery(dateKey, mealType)}`;
}

export function getMealRecordAddPath(dateKey: string, mealType: MealType) {
  return `${PATH.MEAL_RECORD_ADD}?${buildMealRecordQuery(dateKey, mealType)}`;
}

export function getMealRecordAddSearchPath(dateKey: string, mealType: MealType) {
  return `${PATH.MEAL_RECORD_ADD_SEARCH}?${buildMealRecordQuery(dateKey, mealType)}`;
}

export function getMealRecordAddSearchDetailPath(
  dateKey: string,
  mealType: MealType,
  menuId: number,
) {
  return `${PATH.MEAL_RECORD_ADD_SEARCH_DETAIL}?${buildMealRecordQuery(dateKey, mealType, menuId)}`;
}
