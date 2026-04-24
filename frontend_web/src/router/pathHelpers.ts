import { PATH } from "@/router/path";
import type { MealType } from "@/shared/api/types/api.dto";

export type PageKey = "MEAL_SEARCH" | "MEAL_RECORD";

function buildPathQuery(
  dateKey: string,
  mealType: MealType,
  menuId?: number,
  pageKey?: PageKey,
  keyword?: string,
) {
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
  if (typeof keyword === "string" && keyword.trim().length > 0) {
    params.set("keyword", keyword.trim());
  }

  return params.toString();
}

export function getMealRecordPath(dateKey: string, mealType: MealType) {
  return `${PATH.MEAL_RECORD}?${buildPathQuery(dateKey, mealType)}`;
}

export function getMealSearchPath(dateKey: string, mealType: MealType, keyword?: string) {
  return `${PATH.MEAL_RECORD_ADD_SEARCH}?${buildPathQuery(
    dateKey,
    mealType,
    undefined,
    undefined,
    keyword,
  )}`;
}

export function getMealDetailPath(
  dateKey: string,
  mealType: MealType,
  menuId: number,
  pageKey?: PageKey,
  keyword?: string,
) {
  return `${PATH.MEAL_DETAIL}?${buildPathQuery(dateKey, mealType, menuId, pageKey, keyword)}`;
}

export function getPathWithMeal(
  path: string,
  dateKey: string,
  mealType: MealType,
  keyword?: string,
) {
  return `${path}?${buildPathQuery(dateKey, mealType, undefined, undefined, keyword)}`;
}
