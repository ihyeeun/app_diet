import type {
  MealMenuNutrientGroupSection,
  MealMenuNutrientRow,
  MealServingAmount,
} from "@/features/meal-record/types/mealMenuNutrient.types";
import type { MealMenuItem } from "@/shared/api/types/api.dto";

import { MEAL_MENU_NUTRIENT_GROUP_ORDER, SERVING_AMOUNT_REGEX } from "../constants/menu.constants";

export function parseServingAmount(unit_quantity: string): MealServingAmount {
  const matched = unit_quantity.match(SERVING_AMOUNT_REGEX);
  if (!matched) {
    return {
      amount: 0,
      unit: "g",
    };
  }

  const parsedAmount = Number(matched[1]);
  return {
    amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
    unit: matched[2]?.toLowerCase() === "ml" ? "ml" : "g",
  };
}

export function formatNutrientValue(value: number) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

export function toNullableNutrientNumber(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

export function getMealMenuTotalWeight(
  menu: MealMenuItem,
  servingAmount: MealServingAmount = parseServingAmount(menu.unit_quantity),
) {
  const parsedWeightFromUnitText = servingAmount.amount > 0 ? servingAmount.amount : null;
  return toNullableNutrientNumber(menu.weight) ?? parsedWeightFromUnitText;
}

export function buildMealMenuDetailRows(
  menu: MealMenuItem,
  servingAmount: MealServingAmount = parseServingAmount(menu.unit_quantity),
): MealMenuNutrientRow[] {
  const rows: MealMenuNutrientRow[] = [
    {
      key: "totalWeight",
      label: "총량",
      value: getMealMenuTotalWeight(menu, servingAmount),
      unit: servingAmount.unit,
      group: "serving",
      variant: "main",
    },
    {
      key: "carbohydrate",
      label: "탄수화물",
      value: toNullableNutrientNumber(menu.carbs),
      unit: "g",
      group: "carbohydrate",
      variant: "main",
    },
    {
      key: "sugar",
      label: "당",
      value: toNullableNutrientNumber(menu.sugars),
      unit: "g",
      group: "carbohydrate",
      variant: "sub",
    },
    {
      key: "sugarAlcohol",
      label: "당알코올(대체당)",
      value: toNullableNutrientNumber(menu.sugar_alchol),
      unit: "g",
      group: "carbohydrate",
      variant: "sub",
    },
    {
      key: "dietaryFiber",
      label: "식이섬유",
      value: toNullableNutrientNumber(menu.dietary_fiber),
      unit: "g",
      group: "carbohydrate",
      variant: "sub",
    },
    {
      key: "protein",
      label: "단백질",
      value: toNullableNutrientNumber(menu.protein),
      unit: "g",
      group: "protein",
      variant: "main",
    },
    {
      key: "fat",
      label: "지방",
      value: toNullableNutrientNumber(menu.fat),
      unit: "g",
      group: "fat",
      variant: "main",
    },
    {
      key: "saturatedFat",
      label: "포화지방",
      value: toNullableNutrientNumber(menu.sat_fat),
      unit: "g",
      group: "fat",
      variant: "sub",
    },
    {
      key: "transFat",
      label: "트랜스지방",
      value: toNullableNutrientNumber(menu.trans_fat),
      unit: "g",
      group: "fat",
      variant: "sub",
    },
    {
      key: "unsaturatedFat",
      label: "불포화지방",
      value: toNullableNutrientNumber(menu.un_sat_fat),
      unit: "g",
      group: "fat",
      variant: "sub",
    },
    {
      key: "sodium",
      label: "나트륨",
      value: toNullableNutrientNumber(menu.sodium),
      unit: "mg",
      group: "sodium",
      variant: "main",
    },
    {
      key: "caffeine",
      label: "카페인",
      value: toNullableNutrientNumber(menu.caffeine),
      unit: "mg",
      group: "caffeine",
      variant: "main",
    },
    {
      key: "potassium",
      label: "칼륨",
      value: toNullableNutrientNumber(menu.potassium),
      unit: "mg",
      group: "potassium",
      variant: "main",
    },
    {
      key: "cholesterol",
      label: "콜레스테롤",
      value: toNullableNutrientNumber(menu.cholesterol),
      unit: "mg",
      group: "cholesterol",
      variant: "main",
    },
    {
      key: "alcohol",
      label: "알코올",
      value: toNullableNutrientNumber(menu.alcohol),
      unit: "g",
      group: "alcohol",
      variant: "main",
    },
  ];

  return rows;
}

export function buildMealMenuDetailGroups(
  rows: MealMenuNutrientRow[],
): MealMenuNutrientGroupSection[] {
  return MEAL_MENU_NUTRIENT_GROUP_ORDER.map((group) => ({
    group,
    rows: rows.filter((row) => row.group === group && row.value !== null),
  })).filter((section) => section.rows.length > 0);
}
