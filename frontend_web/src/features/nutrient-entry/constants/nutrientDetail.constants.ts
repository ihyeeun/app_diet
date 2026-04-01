import type {
  MacroFieldKey,
  NutrientDetailForm,
  NutrientDetailFormFieldKey,
  ParentNutrientField,
  RequiredNutrientField,
} from "@/features/nutrient-entry/types/nutrientDetail.form";
import type { NutrientServingUnit } from "@/shared/api/types/api.dto";

export type DetailFieldConfig = {
  key: NutrientDetailFormFieldKey;
  label: string;
  unit: "g" | "mg" | "ml" | "kcal";
  variant: "main" | "sub";
  group:
    | "serving"
    | "carbohydrate"
    | "protein"
    | "fat"
    | "sodium"
    | "caffeine"
    | "potassium"
    | "cholesterol"
    | "alcohol";
};

export const MACRO_FIELD_CONFIG: Array<{ key: MacroFieldKey; label: string }> = [
  { key: "carbs", label: "탄수화물" },
  { key: "protein", label: "단백질" },
  { key: "fat", label: "지방" },
];

export const DETAIL_FIELD_CONFIG: DetailFieldConfig[] = [
  {
    key: "calories",
    label: "총 용량",
    unit: "kcal",
    variant: "main",
    group: "serving",
  },
  { key: "carbs", label: "탄수화물", unit: "g", variant: "main", group: "carbohydrate" },
  { key: "sugars", label: "당", unit: "g", variant: "sub", group: "carbohydrate" },
  {
    key: "sugar_alchol",
    label: "당알코올(대체당)",
    unit: "g",
    variant: "sub",
    group: "carbohydrate",
  },
  {
    key: "dietary_fiber",
    label: "식이섬유",
    unit: "g",
    variant: "sub",
    group: "carbohydrate",
  },
  { key: "protein", label: "단백질", unit: "g", variant: "main", group: "protein" },
  { key: "fat", label: "지방", unit: "g", variant: "main", group: "fat" },
  { key: "sat_fat", label: "포화지방", unit: "g", variant: "sub", group: "fat" },
  { key: "trans_fat", label: "트랜스지방", unit: "g", variant: "sub", group: "fat" },
  { key: "un_sat_fat", label: "불포화지방", unit: "g", variant: "sub", group: "fat" },
  { key: "sodium", label: "나트륨", unit: "mg", variant: "main", group: "sodium" },
  { key: "caffeine", label: "카페인", unit: "mg", variant: "main", group: "caffeine" },
  { key: "potassium", label: "칼륨", unit: "mg", variant: "main", group: "potassium" },
  { key: "cholesterol", label: "콜레스테롤", unit: "mg", variant: "main", group: "cholesterol" },
  { key: "alcohol", label: "알코올", unit: "g", variant: "main", group: "alcohol" },
];

export const REQUIRED_FIELDS: RequiredNutrientField[] = ["calories", "carbs", "protein", "fat", "weight"];

export const INITIAL_FORM: NutrientDetailForm = {
  calories: "",
  carbs: "",
  protein: "",
  fat: "",
  weight: "",
  sugars: "",
  sugar_alchol: "",
  dietary_fiber: "",
  trans_fat: "",
  sat_fat: "",
  un_sat_fat: "",
  cholesterol: "",
  sodium: "",
  caffeine: "",
  potassium: "",
  alcohol: "",
};

export const NUTRIENT_FORM_KEYS = Object.keys(INITIAL_FORM) as NutrientDetailFormFieldKey[];

export const MIN_NUTRIENT_VALUE = 0;
export const MAX_NUTRIENT_VALUE = 9999.9;
export const SINGLE_DECIMAL_STEP = 0.1;
export const MAX_COMPARE_MENUS = 20;
export const DEFAULT_SERVING_UNIT: NutrientServingUnit = "g";

export const NUTRIENT_CHILD_RULES: Array<{
  parent: ParentNutrientField;
  children: NutrientDetailFormFieldKey[];
}> = [
  {
    parent: "carbs",
    children: ["sugars", "sugar_alchol", "dietary_fiber"],
  },
  {
    parent: "fat",
    children: ["sat_fat", "trans_fat", "un_sat_fat"],
  },
];

export const MENU_UNIT_TEXT_REGEX = /([0-9]+(?:\.[0-9]+)?)\s*(g|ml)/i;
