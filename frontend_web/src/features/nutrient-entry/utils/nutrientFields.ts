import {
  MENU_NUTRIENT_FIELD_KEYS,
  type MenuNutrientFieldKey,
  type MenuNutrientFields,
} from "@/shared/api/types/api.dto";

export function toFiniteNumberOrUndefined(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
}

export function toNullableFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

export function buildNutrientFormFields(
  source: Partial<Record<MenuNutrientFieldKey, unknown>>,
): Partial<MenuNutrientFields> {
  return Object.fromEntries(
    MENU_NUTRIENT_FIELD_KEYS.map((key) => [key, toFiniteNumberOrUndefined(source[key])]),
  ) as Partial<MenuNutrientFields>;
}

export function buildNullableNutrientFields(
  source: Partial<Record<MenuNutrientFieldKey, unknown>>,
): Record<MenuNutrientFieldKey, number | null> {
  return Object.fromEntries(
    MENU_NUTRIENT_FIELD_KEYS.map((key) => [key, toNullableFiniteNumber(source[key])]),
  ) as Record<MenuNutrientFieldKey, number | null>;
}

export function buildNutrientResetPatch() {
  return Object.fromEntries(
    MENU_NUTRIENT_FIELD_KEYS.map((key) => [key, undefined]),
  ) as Partial<Record<MenuNutrientFieldKey, undefined>>;
}

const NUTRIENT_CHILD_RULES: ReadonlyArray<{
  parent: MenuNutrientFieldKey;
  children: ReadonlyArray<MenuNutrientFieldKey>;
}> = [
  { parent: "carbs", children: ["sugars", "sugar_alchol", "dietary_fiber"] },
  { parent: "fat", children: ["sat_fat", "trans_fat", "un_sat_fat"] },
];
const NUTRIENT_OVERFLOW_EPSILON = 1e-9;

function toFiniteNumberOrZero(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return value;
}

export function hasChildNutrientOverflow(
  source: Partial<Record<MenuNutrientFieldKey, unknown>>,
) {
  return NUTRIENT_CHILD_RULES.some(({ parent, children }) => {
    const parentValue = toFiniteNumberOrUndefined(source[parent]);
    if (parentValue === undefined) {
      return false;
    }

    const childSum = children.reduce((sum, key) => sum + toFiniteNumberOrZero(source[key]), 0);

    return childSum > parentValue + NUTRIENT_OVERFLOW_EPSILON;
  });
}
