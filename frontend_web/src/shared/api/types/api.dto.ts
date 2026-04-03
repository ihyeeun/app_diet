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
  carbs: number;
  protein: number;
  fat: number;
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

export const MENU_NUTRIENT_FIELD_KEYS = [
  "carbs",
  "sugars",
  "sugar_alchol",
  "dietary_fiber",
  "protein",
  "fat",
  "sat_fat",
  "trans_fat",
  "un_sat_fat",
  "sodium",
  "caffeine",
  "potassium",
  "cholesterol",
  "alcohol",
] as const satisfies ReadonlyArray<keyof MenuNutrientFields>;

export type MenuNutrientFieldKey = (typeof MENU_NUTRIENT_FIELD_KEYS)[number];

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

export interface WeightStepsResponseDto {
  weight: number;
  steps: number;
}

export const MEAL_TYPE_OPTIONS = [
  { key: "0", label: "아침" },
  { key: "1", label: "점심" },
  { key: "2", label: "저녁" },
  { key: "3", label: "간식" },
  { key: "4", label: "야식" },
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

export const DEFAULT_MEAL_TYPE: MealType = "1";
export const MEAL_TYPE_SET: ReadonlySet<MealType> = new Set(
  MEAL_TYPE_OPTIONS.map((option) => option.key),
);

export type NutrientServingUnit = "g" | "ml";

export type CapturedImage = {
  uri: string;
  width: number;
  height: number;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
};
