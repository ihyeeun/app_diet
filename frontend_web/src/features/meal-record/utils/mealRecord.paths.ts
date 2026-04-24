import { PATH } from "@/router/path";
import type { PageKey } from "@/router/pathHelpers";
import type { MealType } from "@/shared/api/types/api.dto";

// TODO 추후 이 파일 삭제 @/router/pathHelpers로 사용 예정
function buildMealRecordQuery(
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
  return `${PATH.MEAL_RECORD}?${buildMealRecordQuery(dateKey, mealType)}`;
}

export function getMealRecordAddSearchPath(dateKey: string, mealType: MealType, keyword?: string) {
  return `${PATH.MEAL_RECORD_ADD_SEARCH}?${buildMealRecordQuery(
    dateKey,
    mealType,
    undefined,
    undefined,
    keyword,
  )}`;
}
