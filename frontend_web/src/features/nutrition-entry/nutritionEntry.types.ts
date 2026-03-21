import type { MealMenuItem, MealType } from "@/features/meal-record/types/mealRecord.types";

export type NutritionEntrySource = "meal-record" | "menu-compare" | "general";

export type NutritionEntryContextState = {
  source?: NutritionEntrySource;
  dateKey?: string;
  mealType?: MealType;
  existingMenuCount?: number;
  pendingMenus?: MealMenuItem[];
  existingCompareCount?: number;
  pendingCompareMenus?: MealMenuItem[];
};

export type NutritionAddLocationState = NutritionEntryContextState & {
  brandName?: string;
  foodName?: string;
};
