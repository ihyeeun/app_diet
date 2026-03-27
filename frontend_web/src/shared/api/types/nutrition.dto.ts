import type { MacroRatios } from "@/shared/utils/nutritionScore";

export const MENU_DATA_SOURCE = {
  PUBLIC: 0,
  PERSONAL: 1,
} as const;

export const MENU_UNIT = {
  GRAM: 0,
  MILLILITER: 1,
} as const;

export const MEAL_TIME = {
  BREAKFAST: 0,
  LUNCH: 1,
  DINNER: 2,
  SNACK: 3,
  LATE_NIGHT_SNACK: 4,
} as const;

export type MenuId = number;
export type MenuDataSource = (typeof MENU_DATA_SOURCE)[keyof typeof MENU_DATA_SOURCE];
export type MenuUnit = (typeof MENU_UNIT)[keyof typeof MENU_UNIT];
export type MealTime = (typeof MEAL_TIME)[keyof typeof MEAL_TIME];
export type ApiDate = string;

export interface MenuIdField {
  id: MenuId;
}

export interface SearchInputField {
  input: string;
}

export interface DateField {
  date: ApiDate;
}

export interface MealTimeField {
  time: MealTime;
}

export interface MenuBaseFields extends MenuIdField {
  data_source: MenuDataSource;
  name: string;
  brand: string;
  category: string;
  unit: MenuUnit;
  weight: number;
  unit_quantity: string;
  calories: number;
}

export interface MenuNutrientFields {
  carbs: number;
  sugars: number;
  sugar_alchol: number;
  dietary_fiber: number;
  protein: number;
  fat: number;
  sat_fat: number;
  trans_fat: number;
  un_sat_fat: number;
  sodium: number;
  caffeine: number;
  potassium: number;
  cholesterol: number;
  alcohol: number;
}

export type MenuSimpleResponseDto = MenuBaseFields;

export interface MenuResponseDto extends MenuBaseFields, MenuNutrientFields {}

export type SearchRequestDto = SearchInputField;

export interface SearchResponseDto {
  has_result: boolean;
  menu_list: MenuSimpleResponseDto[];
  brand_list: string[];
}

export interface SearchBrandResponseDto {
  brand_list: string[];
}

export type MenuIdRequestDto = MenuIdField;

export interface SearchInBrandRequestDto extends SearchInputField {
  brand: string;
}

export interface RegisterMealRequestDto extends DateField, MealTimeField {
  image?: string;
  menu_ids: MenuId[];
  menu_quantities: number[];
}

export interface DeleteMealRequestDto extends DateField, MealTimeField {
  menu_id: MenuId;
}

export interface MealResponseDto extends MealTimeField {
  image: string;
  menu_list: MenuSimpleResponseDto[];
  menu_quantities: number[];
}

export interface MealRecordResponseDto {
  meal_list: MealResponseDto[];
}

export type DateRequestDto = DateField;

export type RegisterMenuRequestDto = Pick<
  MenuBaseFields,
  "name" | "brand" | "unit" | "weight" | "calories"
> &
  MenuNutrientFields;

export interface ModifyMenuRequestDto extends RegisterMenuRequestDto, MenuIdField {}

export const MEAL_TYPE_OPTIONS = [
  { key: "breakfast", label: "아침" },
  { key: "lunch", label: "점심" },
  { key: "dinner", label: "저녁" },
  { key: "snack", label: "간식" },
] as const;

export type MealType = (typeof MEAL_TYPE_OPTIONS)[number]["key"];
export type MealServingInputMode = "unit" | "weight";

type NullableMenuNutrientFields = {
  [K in keyof MenuNutrientFields]?: MenuNutrientFields[K] | null;
};

export type MealMenuItem = Omit<MenuSimpleResponseDto, "brand" | "category" | "unit" | "weight"> &
  Partial<Pick<MenuSimpleResponseDto, "brand" | "category" | "unit">> & {
    weight?: MenuBaseFields["weight"] | null;
  } & NullableMenuNutrientFields & {
    serving_input_mode?: MealServingInputMode;
    serving_input_value?: number;
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
