import type { MealMenuItem, MealRecordLocationState } from "../types/mealRecord.types";

function isMealMenuItem(value: unknown): value is MealMenuItem {
  if (!value || typeof value !== "object") return false;

  const menu = value as MealMenuItem;
  return (
    typeof menu.id === "string" &&
    typeof menu.title === "string" &&
    typeof menu.calories === "number" &&
    typeof menu.unitAmountText === "string" &&
    typeof menu.carbohydrateGram === "number" &&
    typeof menu.proteinGram === "number" &&
    typeof menu.fatGram === "number"
  );
}

export function getPendingMenusFromState(state: unknown): MealMenuItem[] {
  if (!state || typeof state !== "object") return [];

  const pendingMenus = (state as MealRecordLocationState).pendingMenus;
  if (!Array.isArray(pendingMenus)) return [];

  return pendingMenus.filter(isMealMenuItem);
}
