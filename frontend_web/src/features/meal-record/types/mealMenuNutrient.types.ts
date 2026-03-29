export type MealMenuNutrientGroup =
  | "serving"
  | "carbohydrate"
  | "protein"
  | "fat"
  | "sodium"
  | "caffeine"
  | "potassium"
  | "cholesterol"
  | "alcohol";

export type MealMenuNutrientRow = {
  key: string;
  label: string;
  value: number | null;
  unit: "g" | "mg" | "ml";
  group: MealMenuNutrientGroup;
  variant?: "main" | "sub";
};

export type MealMenuNutrientGroupSection = {
  group: MealMenuNutrientGroup;
  rows: MealMenuNutrientRow[];
};

export type MealServingAmount = {
  amount: number;
  unit: "g" | "ml";
};
