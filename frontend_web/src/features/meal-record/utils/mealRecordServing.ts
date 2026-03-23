import type { MealMenuItem, MealServingInputMode } from "../types/mealRecord.types";
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
  const unitAmountMatch = menu.unitAmountText.match(UNIT_AMOUNT_PATTERN);
  const servingAmount = parseServingAmount(menu.unitAmountText);

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
    carbohydrateGram: roundToSingleDecimal(menu.carbohydrateGram * scaleFactor),
    proteinGram: roundToSingleDecimal(menu.proteinGram * scaleFactor),
    fatGram: roundToSingleDecimal(menu.fatGram * scaleFactor),
    totalWeightGram:
      menu.totalWeightGram === null || menu.totalWeightGram === undefined
        ? totalWeight
        : scaleOptionalNutritionValue(menu.totalWeightGram, scaleFactor),
    sugarGram: scaleOptionalNutritionValue(menu.sugarGram, scaleFactor),
    sugarAlcoholGram: scaleOptionalNutritionValue(menu.sugarAlcoholGram, scaleFactor),
    dietaryFiberGram: scaleOptionalNutritionValue(menu.dietaryFiberGram, scaleFactor),
    transFatGram: scaleOptionalNutritionValue(menu.transFatGram, scaleFactor),
    saturatedFatGram: scaleOptionalNutritionValue(menu.saturatedFatGram, scaleFactor),
    unsaturatedFatGram: scaleOptionalNutritionValue(menu.unsaturatedFatGram, scaleFactor),
    sodiumMg: scaleOptionalNutritionValue(menu.sodiumMg, scaleFactor),
    caffeineMg: scaleOptionalNutritionValue(menu.caffeineMg, scaleFactor),
    potassiumMg: scaleOptionalNutritionValue(menu.potassiumMg, scaleFactor),
    cholesterolMg: scaleOptionalNutritionValue(menu.cholesterolMg, scaleFactor),
    alcoholGram: scaleOptionalNutritionValue(menu.alcoholGram, scaleFactor),
    unitAmountText: `${formatCompactDecimal(unitCount)}${serving.unitLabel} (${formatCompactDecimal(
      totalWeight,
    )}${serving.weightUnit})`,
    servingInputMode: mode,
    servingInputValue: roundToSingleDecimal(inputValue),
  } satisfies MealMenuItem;
}
