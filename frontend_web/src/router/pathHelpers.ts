import { PATH } from "@/router/path";
import type { MealType } from "@/shared/api/types/api.dto";

export type PageKey = "MEAL_SEARCH" | "MEAL_RECORD";

function buildPathQuery(dateKey: string, mealType: MealType, menuId?: number, pageKey?: PageKey) {
  const params = new URLSearchParams({
    date: dateKey,
    mealType,
  });

  if (menuId !== undefined) {
    params.set("menuId", String(menuId));
  }
  if (pageKey !== undefined) {
    params.set("pageKey", pageKey);
  }

  return params.toString();
}

export function getMealRecordPath(dateKey: string, mealType: MealType) {
  return `${PATH.MEAL_RECORD}?${buildPathQuery(dateKey, mealType)}`;
}

export function getMealSearchPath(dateKey: string, mealType: MealType) {
  return `${PATH.MEAL_RECORD_ADD_SEARCH}?${buildPathQuery(dateKey, mealType)}`;
}

export function getMealDetailPath(
  dateKey: string,
  mealType: MealType,
  menuId: number,
  pageKey?: PageKey,
) {
  return `${PATH.MEAL_DETAIL}?${buildPathQuery(dateKey, mealType, menuId, pageKey)}`;
}

export function getPathWithMeal(path: string, dateKey: string, mealType: MealType) {
  return `${path}?${buildPathQuery(dateKey, mealType)}`;
}
