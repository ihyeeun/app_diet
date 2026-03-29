import type { MealMenuNutrientGroup } from "../types/mealMenuNutrient.types";

export const SERVING_AMOUNT_REGEX = /\(([\d.]+)\s*(g|ml)\)/i;
export const MAX_MEAL_RECORD_MENUS = 100;

export const MEAL_MENU_NUTRIENT_GROUP_ORDER: ReadonlyArray<MealMenuNutrientGroup> = [
  "serving",
  "carbohydrate",
  "protein",
  "fat",
  "sodium",
  "caffeine",
  "potassium",
  "cholesterol",
  "alcohol",
];
