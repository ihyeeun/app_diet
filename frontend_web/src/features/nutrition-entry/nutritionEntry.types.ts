import type { MealMenuItem, MealType } from "@/features/meal-record/types/mealRecord.types";

export type NutritionEntrySource = "meal-record" | "menu-compare" | "general";
export type NutritionServingUnit = "g" | "ml";

export type NutritionInitialFormState = Partial<{
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  totalWeight: number;
  sugar: number;
  sugarAlcohol: number;
  dietaryFiber: number;
  transFat: number;
  saturatedFat: number;
  unsaturatedFat: number;
  cholesterol: number;
  sodium: number;
  caffeine: number;
  potassium: number;
  alcohol: number;
}>;

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
  initialNutrition?: NutritionInitialFormState;
  servingUnit?: NutritionServingUnit;
};
