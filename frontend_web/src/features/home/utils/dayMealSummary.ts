import type { MealRecordResponseDto, MealResponseDto } from "@/shared/api/types/api.dto";

export type DayMealSummary = {
  totalCalories: number;
  totalNutrients: {
    carbs: number;
    protein: number;
    fat: number;
  };
  caloriesByTime: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snack: number;
  };
  nutrientsByTime: {
    breakfast: {
      carbs: number;
      protein: number;
      fat: number;
    };
    lunch: {
      carbs: number;
      protein: number;
      fat: number;
    };
    dinner: {
      carbs: number;
      protein: number;
      fat: number;
    };
    snack: {
      carbs: number;
      protein: number;
      fat: number;
    };
  };
};

export function dayMealSummary(meals: MealRecordResponseDto): DayMealSummary {
  let totalCalories = 0;
  const totalNutrients = {
    carbs: 0,
    protein: 0,
    fat: 0,
  };
  const caloriesByTime = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  };
  const nutrientsByTime = {
    breakfast: { carbs: 0, protein: 0, fat: 0 },
    lunch: { carbs: 0, protein: 0, fat: 0 },
    dinner: { carbs: 0, protein: 0, fat: 0 },
    snack: { carbs: 0, protein: 0, fat: 0 },
  };

  const resolveQuantity = (meal: MealResponseDto, menuIndex: number) => {
    const quantity = meal.menu_quantities[menuIndex];
    return typeof quantity === "number" && Number.isFinite(quantity) ? quantity : 1;
  };

  meals.meal_list.forEach((meal) => {
    meal.menu_list.forEach((menu, menuIndex) => {
      const quantity = resolveQuantity(meal, menuIndex);
      const calories = menu.calories * quantity;
      const carbs = menu.carbs * quantity;
      const protein = menu.protein * quantity;
      const fat = menu.fat * quantity;

      totalCalories += calories;
      totalNutrients.carbs += carbs;
      totalNutrients.protein += protein;
      totalNutrients.fat += fat;

      switch (meal.time) {
        case 0: {
          caloriesByTime.breakfast += calories;
          nutrientsByTime.breakfast.carbs += carbs;
          nutrientsByTime.breakfast.protein += protein;
          nutrientsByTime.breakfast.fat += fat;
          break;
        }
        case 1: {
          caloriesByTime.lunch += calories;
          nutrientsByTime.lunch.carbs += carbs;
          nutrientsByTime.lunch.protein += protein;
          nutrientsByTime.lunch.fat += fat;
          break;
        }
        case 2: {
          caloriesByTime.dinner += calories;
          nutrientsByTime.dinner.carbs += carbs;
          nutrientsByTime.dinner.protein += protein;
          nutrientsByTime.dinner.fat += fat;
          break;
        }
        case 3: {
          caloriesByTime.snack += calories;
          nutrientsByTime.snack.carbs += carbs;
          nutrientsByTime.snack.protein += protein;
          nutrientsByTime.snack.fat += fat;
          break;
        }
        default: {
          break;
        }
      }
    });
  });

  return {
    totalCalories,
    totalNutrients,
    caloriesByTime,
    nutrientsByTime,
  };
}
