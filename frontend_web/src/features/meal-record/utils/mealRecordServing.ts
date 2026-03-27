import type { MealMenuItem, MealServingInputMode } from "@/shared/api/types/nutrition.dto";
import { parseServingAmount } from "./mealMenuNutrition";

export type ParsedMenuServing = {
  baseUnitCount: number;
  unitLabel: string;
  baseWeight: number;
  weightUnit: "g" | "ml";
};

export type ResolvedServingValues = {
  unitCount: number;
  totalWeight: number;
  scaleFactor: number;
};

const UNIT_AMOUNT_PATTERN = /^\s*([\d.]+)\s*([^()]*)\(([^)]+)\)\s*$/;

export const SERVING_INPUT_MIN = 0.1;
export const SERVING_INPUT_MAX = 9999.9;
export const SERVING_INPUT_STEP = 0.5;

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function clampServingInput(value: number) {
  return Math.min(SERVING_INPUT_MAX, Math.max(SERVING_INPUT_MIN, value));
}

function scaleOptionalNutritionValue(
  value: number | null | undefined,
  scaleFactor: number,
): number | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }

  return roundToSingleDecimal(value * scaleFactor);
}

export function normalizeServingInput(value: number) {
  return clampServingInput(roundToSingleDecimal(value));
}

export function formatCompactDecimal(value: number) {
  const rounded = roundToSingleDecimal(value);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function sanitizeServingInput(value: string) {
  const numericOnly = value.replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = numericOnly.split(".");

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("").slice(0, 1)}`;
}

export function parseMenuServing(menu: MealMenuItem): ParsedMenuServing {
  const unitAmountMatch = menu.unit_quantity.match(UNIT_AMOUNT_PATTERN);
  const servingAmount = parseServingAmount(menu.unit_quantity);

  if (unitAmountMatch) {
    const parsedUnitCount = Number(unitAmountMatch[1]);
    const parsedLabel = unitAmountMatch[2].trim();
    const weightToken = unitAmountMatch[3].match(/([\d.]+)\s*(g|ml)/i);

    if (weightToken) {
      const parsedWeight = Number(weightToken[1]);
      const weightUnit = weightToken[2].toLowerCase() === "ml" ? "ml" : "g";

      return {
        baseUnitCount:
          Number.isFinite(parsedUnitCount) && parsedUnitCount > 0
            ? parsedUnitCount
            : SERVING_INPUT_MIN,
        unitLabel: parsedLabel || "회분",
        baseWeight:
          Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : SERVING_INPUT_MIN,
        weightUnit,
      };
    }
  }

  return {
    baseUnitCount: 1,
    unitLabel: "회분",
    baseWeight: servingAmount.amount > 0 ? servingAmount.amount : SERVING_INPUT_MIN,
    weightUnit: servingAmount.unit,
  };
}

export function getServingDefaultValue(serving: ParsedMenuServing, mode: MealServingInputMode) {
  if (mode === "unit") {
    return 1;
  }

  return serving.baseWeight;
}

export function resolveServingValues(
  serving: ParsedMenuServing,
  mode: MealServingInputMode,
  inputValue: number,
): ResolvedServingValues {
  if (mode === "unit") {
    const scaleFactor = inputValue / serving.baseUnitCount;
    return {
      unitCount: roundToSingleDecimal(inputValue),
      totalWeight: roundToSingleDecimal(serving.baseWeight * scaleFactor),
      scaleFactor,
    };
  }

  const scaleFactor = inputValue / serving.baseWeight;
  return {
    unitCount: roundToSingleDecimal(serving.baseUnitCount * scaleFactor),
    totalWeight: roundToSingleDecimal(inputValue),
    scaleFactor,
  };
}

export function buildScaledMenu({
  menu,
  serving,
  resolved,
  mode,
  inputValue,
}: {
  menu: MealMenuItem;
  serving: ParsedMenuServing;
  resolved: ResolvedServingValues;
  mode: MealServingInputMode;
  inputValue: number;
}) {
  const { scaleFactor, unitCount, totalWeight } = resolved;

  return {
    ...menu,
    calories: roundToSingleDecimal(menu.calories * scaleFactor),
    carbs: roundToSingleDecimal((menu.carbs ?? 0) * scaleFactor),
    protein: roundToSingleDecimal((menu.protein ?? 0) * scaleFactor),
    fat: roundToSingleDecimal((menu.fat ?? 0) * scaleFactor),
    weight:
      menu.weight === null || menu.weight === undefined
        ? totalWeight
        : scaleOptionalNutritionValue(menu.weight, scaleFactor),
    sugars: scaleOptionalNutritionValue(menu.sugars, scaleFactor),
    sugar_alchol: scaleOptionalNutritionValue(menu.sugar_alchol, scaleFactor),
    dietary_fiber: scaleOptionalNutritionValue(menu.dietary_fiber, scaleFactor),
    trans_fat: scaleOptionalNutritionValue(menu.trans_fat, scaleFactor),
    sat_fat: scaleOptionalNutritionValue(menu.sat_fat, scaleFactor),
    un_sat_fat: scaleOptionalNutritionValue(menu.un_sat_fat, scaleFactor),
    sodium: scaleOptionalNutritionValue(menu.sodium, scaleFactor),
    caffeine: scaleOptionalNutritionValue(menu.caffeine, scaleFactor),
    potassium: scaleOptionalNutritionValue(menu.potassium, scaleFactor),
    cholesterol: scaleOptionalNutritionValue(menu.cholesterol, scaleFactor),
    alcohol: scaleOptionalNutritionValue(menu.alcohol, scaleFactor),
    unit_quantity: `${formatCompactDecimal(unitCount)}${serving.unitLabel} (${formatCompactDecimal(
      totalWeight,
    )}${serving.weightUnit})`,
    serving_input_mode: mode,
    serving_input_value: roundToSingleDecimal(inputValue),
  } satisfies MealMenuItem;
}
