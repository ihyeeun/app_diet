import type { RegisterManualMenuPayload } from "@/features/nutrient-entry/api/manualMenu";
import type { NutrientDetailForm } from "@/features/nutrient-entry/types/nutrientDetail.form";
import {
  formatCompactDecimal,
  toNullableNumber,
  toNumber,
} from "@/features/nutrient-entry/utils/nutrientDetail.form";
import {
  type MealMenuItem,
  MENU_DATA_SOURCE,
  MENU_UNIT,
  type NutrientServingUnit,
} from "@/shared/api/types/api.dto";

function buildSafeWeightText(weight: number, unit: NutrientServingUnit) {
  if (weight > 0) {
    return `${formatCompactDecimal(weight)}${unit}`;
  }

  return `0.0${unit}`;
}

export function buildManualMenuPayload({
  foodName,
  brandName,
  form,
  totalWeightUnit,
}: {
  foodName: string;
  brandName: string;
  form: NutrientDetailForm;
  totalWeightUnit: NutrientServingUnit;
}): RegisterManualMenuPayload {
  return {
    name: foodName,
    brand: brandName,
    unit: totalWeightUnit === "ml" ? MENU_UNIT.MILLILITER : MENU_UNIT.GRAM,
    weight: toNumber(form.weight),
    calories: toNumber(form.calories),
    carbs: toNumber(form.carbs),
    protein: toNumber(form.protein),
    fat: toNumber(form.fat),
    sugars: toNullableNumber(form.sugars),
    sugar_alchol: toNullableNumber(form.sugar_alchol),
    dietary_fiber: toNullableNumber(form.dietary_fiber),
    trans_fat: toNullableNumber(form.trans_fat),
    sat_fat: toNullableNumber(form.sat_fat),
    un_sat_fat: toNullableNumber(form.un_sat_fat),
    sodium: toNullableNumber(form.sodium),
    caffeine: toNullableNumber(form.caffeine),
    potassium: toNullableNumber(form.potassium),
    cholesterol: toNullableNumber(form.cholesterol),
    alcohol: toNullableNumber(form.alcohol),
  };
}

export function buildManualMenuItem({
  menuId,
  foodName,
  brandName,
  form,
  totalWeightUnit,
}: {
  menuId: number;
  foodName: string;
  brandName: string;
  form: NutrientDetailForm;
  totalWeightUnit: NutrientServingUnit;
}): MealMenuItem {
  const totalWeight = toNumber(form.weight);

  return {
    id: menuId,
    name: foodName,
    calories: toNumber(form.calories),
    data_source: MENU_DATA_SOURCE.PERSONAL,
    category: "manual",
    unit: totalWeightUnit === "ml" ? MENU_UNIT.MILLILITER : MENU_UNIT.GRAM,
    unit_quantity: `1회 제공량 (${buildSafeWeightText(totalWeight, totalWeightUnit)})`,
    carbs: toNumber(form.carbs),
    protein: toNumber(form.protein),
    fat: toNumber(form.fat),
    weight: totalWeight > 0 ? totalWeight : null,
    sugars: toNullableNumber(form.sugars),
    sugar_alchol: toNullableNumber(form.sugar_alchol),
    dietary_fiber: toNullableNumber(form.dietary_fiber),
    trans_fat: toNullableNumber(form.trans_fat),
    sat_fat: toNullableNumber(form.sat_fat),
    un_sat_fat: toNullableNumber(form.un_sat_fat),
    sodium: toNullableNumber(form.sodium),
    caffeine: toNullableNumber(form.caffeine),
    potassium: toNullableNumber(form.potassium),
    cholesterol: toNullableNumber(form.cholesterol),
    alcohol: toNullableNumber(form.alcohol),
    brand: brandName || undefined,
  };
}
