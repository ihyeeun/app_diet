import { DEFAULT_MEAL_TYPE, MEAL_TYPE_SET, type MealType } from "@/shared/api/types/api.dto";

type ServingWeightUnit = "g" | "ml";

export type RecommendationServingContext = {
  baseWeight: number;
  baseUnitCount: number;
  unitLabel: string;
  weightUnit: ServingWeightUnit;
};

const WEIGHT_TOKEN_PATTERN = /([\d.]+)\s*(g|ml)\b/i;
const PARENTHESIS_PATTERN = /\(([^)]+)\)/;
const LEADING_NUMBER_PATTERN = /^\s*([\d.]+)\s*(.*)$/;

function toPositiveNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function parseBaseUnitLabelAndCount(amount: string) {
  const beforeParenthesis = amount.split("(")[0]?.trim() ?? "";
  const matched = beforeParenthesis.match(LEADING_NUMBER_PATTERN);
  if (!matched) {
    return {
      baseUnitCount: 1,
      unitLabel: beforeParenthesis || "인분",
    };
  }

  const parsedCount = toPositiveNumber(Number(matched[1])) ?? 1;
  const unitLabel = matched[2]?.trim() || "인분";
  return {
    baseUnitCount: parsedCount,
    unitLabel,
  };
}

export function parseRecommendationServingContext(amount: string): RecommendationServingContext {
  const { baseUnitCount, unitLabel } = parseBaseUnitLabelAndCount(amount);
  const parenthesisContent = amount.match(PARENTHESIS_PATTERN)?.[1] ?? "";
  const weightToken =
    parenthesisContent.match(WEIGHT_TOKEN_PATTERN) ?? amount.match(WEIGHT_TOKEN_PATTERN);
  if (!weightToken) {
    return {
      baseWeight: 1,
      baseUnitCount,
      unitLabel,
      weightUnit: "g",
    };
  }

  const parsedWeight = toPositiveNumber(Number(weightToken[1]));
  return {
    baseWeight: parsedWeight ?? 1,
    baseUnitCount,
    unitLabel,
    weightUnit: weightToken[2].toLowerCase() === "ml" ? "ml" : "g",
  };
}

export function getMealTypeFromChatMealTime(value: number): MealType {
  const asMealType = String(value);
  if (MEAL_TYPE_SET.has(asMealType as MealType)) {
    return asMealType as MealType;
  }

  return DEFAULT_MEAL_TYPE;
}

export function getMealTypeFromCurrentTime(date: Date): MealType {
  const hour = date.getHours();

  if (hour >= 5 && hour <= 10) {
    return "0";
  }

  if (hour >= 11 && hour <= 14) {
    return "1";
  }

  if (hour >= 15 && hour <= 16) {
    return "3";
  }

  if (hour >= 17 && hour <= 20) {
    return "2";
  }

  return "4";
}

export function formatQuantityText(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);
}
