import type { MacroRatios } from "@/shared/utils/nutritionScore";

export const MEAL_TYPE_OPTIONS = [
  { key: "breakfast", label: "아침" },
  { key: "lunch", label: "점심" },
  { key: "dinner", label: "저녁" },
  { key: "snack", label: "간식" },
] as const;

export type MealType = (typeof MEAL_TYPE_OPTIONS)[number]["key"];
export type MealServingInputMode = "unit" | "weight";

export type MealMenuItem = {
  id: string;
  title: string;
  calories: number;
  unitAmountText: string;
  carbohydrateGram: number;
  proteinGram: number;
  fatGram: number;
  totalWeightGram?: number | null;
  sugarGram?: number | null;
  sugarAlcoholGram?: number | null;
  dietaryFiberGram?: number | null;
  transFatGram?: number | null;
  saturatedFatGram?: number | null;
  unsaturatedFatGram?: number | null;
  sodiumMg?: number | null;
  caffeineMg?: number | null;
  potassiumMg?: number | null;
  cholesterolMg?: number | null;
  alcoholGram?: number | null;
  servingInputMode?: MealServingInputMode;
  servingInputValue?: number;
  brandChipLabel?: string;
  personalChipLabel?: string;
};

export type MealPhotoGroup = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  items: MealMenuItem[];
};

export type MealRecordState = {
  targetCalories: number;
  targetMacroRatios: MacroRatios;
  menuItems: MealMenuItem[];
  photoGroups: MealPhotoGroup[];
  addQueue: MealMenuItem[];
};

export type MealRecordByType = Record<MealType, MealRecordState>;

export type MealRecordLocationState = {
  pendingMenus?: MealMenuItem[];
};

export const DEFAULT_TARGET_MACRO_RATIOS: MacroRatios = {
  carbohydrate: 50,
  protein: 30,
  fat: 20,
};

export const DEFAULT_MEAL_TYPE: MealType = "lunch";
export const MEAL_TYPE_SET: ReadonlySet<MealType> = new Set(
  MEAL_TYPE_OPTIONS.map((option) => option.key),
);
