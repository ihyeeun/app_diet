import type { MealMenuItem, MealRecordLocationState } from "@/shared/api/types/api.dto";

function isMealMenuItem(value: unknown): value is MealMenuItem {
  if (!value || typeof value !== "object") return false;

  const menu = value as MealMenuItem;
  return (
    typeof menu.id === "number" &&
    typeof menu.name === "string" &&
    typeof menu.calories === "number" &&
    typeof menu.unit_quantity === "string" &&
    (menu.carbs === undefined || typeof menu.carbs === "number") &&
    (menu.protein === undefined || typeof menu.protein === "number") &&
    (menu.fat === undefined || typeof menu.fat === "number")
  );
}

export function getPendingMenusFromState(state: unknown): MealMenuItem[] {
  if (!state || typeof state !== "object") return [];

  const pendingMenus = (state as MealRecordLocationState).pendingMenus;
  if (!Array.isArray(pendingMenus)) return [];

  return pendingMenus.filter(isMealMenuItem);
}
