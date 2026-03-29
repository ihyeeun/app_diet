import {
  MEAL_TIME,
  type MealMenuItem,
  type MealType,
  type RegisterMealRequestDto,
} from "@/shared/api/types/nutrient.dto";

const MEAL_TYPE_TO_TIME: Record<MealType, RegisterMealRequestDto["time"]> = {
  breakfast: MEAL_TIME.BREAKFAST,
  lunch: MEAL_TIME.LUNCH,
  dinner: MEAL_TIME.DINNER,
  snack: MEAL_TIME.SNACK,
};

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function resolveMenuQuantity(menu: MealMenuItem) {
  const value = menu.serving_input_value;
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return roundToSingleDecimal(value);
  }

  return 1;
}

export function buildRegisterMealRequest({
  dateKey,
  mealType,
  image,
  menus,
}: {
  dateKey: string;
  mealType: MealType;
  image?: string;
  menus: MealMenuItem[];
}): RegisterMealRequestDto {
  return {
    date: dateKey,
    time: MEAL_TYPE_TO_TIME[mealType],
    image,
    menu_ids: menus.map((menu) => menu.id),
    menu_quantities: menus.map(resolveMenuQuantity),
  };
}
