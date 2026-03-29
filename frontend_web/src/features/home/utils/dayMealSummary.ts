import type { MealRecordResponseDto } from "@/shared/api/types/nutrition.dto";

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

  meals.meal_list.forEach((meal, index) => {
    totalCalories += meal.menu_list[index].calories * meal.menu_quantities[index];
    totalNutrients.carbs += meal.menu_list[index].carbs * meal.menu_quantities[index];
    totalNutrients.protein += meal.menu_list[index].protein * meal.menu_quantities[index];
    totalNutrients.fat += meal.menu_list[index].fat * meal.menu_quantities[index];

    switch (meal.time) {
      case 0: {
        caloriesByTime.breakfast += meal.menu_list[index].calories * meal.menu_quantities[index];
        nutrientsByTime.breakfast.carbs +=
          meal.menu_list[index].carbs * meal.menu_quantities[index];
        nutrientsByTime.breakfast.protein +=
          meal.menu_list[index].protein * meal.menu_quantities[index];
        nutrientsByTime.breakfast.fat += meal.menu_list[index].fat * meal.menu_quantities[index];
        break;
      }
      case 1: {
        caloriesByTime.lunch += meal.menu_list[index].calories * meal.menu_quantities[index];
        nutrientsByTime.lunch.carbs += meal.menu_list[index].carbs * meal.menu_quantities[index];
        nutrientsByTime.lunch.protein +=
          meal.menu_list[index].protein * meal.menu_quantities[index];
        nutrientsByTime.lunch.fat += meal.menu_list[index].fat * meal.menu_quantities[index];
        break;
      }
      case 2: {
        caloriesByTime.dinner += meal.menu_list[index].calories * meal.menu_quantities[index];
        nutrientsByTime.dinner.carbs += meal.menu_list[index].carbs * meal.menu_quantities[index];
        nutrientsByTime.dinner.protein +=
          meal.menu_list[index].protein * meal.menu_quantities[index];
        nutrientsByTime.dinner.fat += meal.menu_list[index].fat * meal.menu_quantities[index];
        break;
      }
      case 3: {
        caloriesByTime.snack += meal.menu_list[index].calories * meal.menu_quantities[index];
        nutrientsByTime.snack.carbs += meal.menu_list[index].carbs * meal.menu_quantities[index];
        nutrientsByTime.snack.protein +=
          meal.menu_list[index].protein * meal.menu_quantities[index];
        nutrientsByTime.snack.fat += meal.menu_list[index].fat * meal.menu_quantities[index];
        break;
      }
      default: {
        break;
      }
    }
  });

  return {
    totalCalories,
    totalNutrients,
    caloriesByTime,
    nutrientsByTime,
  };
}
