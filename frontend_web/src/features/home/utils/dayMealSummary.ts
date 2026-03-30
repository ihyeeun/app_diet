import type {
  MealRecordResponseDto,
  MealResponseDto,
  MenuSimpleResponseDto,
} from "@/shared/api/types/api.dto";

type MealTimeKey = 0 | 1 | 2 | 3 | 4;

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
    lateNight: number;
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
    lateNight: {
      carbs: number;
      protein: number;
      fat: number;
    };
  };
  menusByTime: {
    0: MenuSimpleResponseDto[];
    1: MenuSimpleResponseDto[];
    2: MenuSimpleResponseDto[];
    3: MenuSimpleResponseDto[];
    4: MenuSimpleResponseDto[];
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
    lateNight: 0,
  };
  const nutrientsByTime = {
    breakfast: { carbs: 0, protein: 0, fat: 0 },
    lunch: { carbs: 0, protein: 0, fat: 0 },
    dinner: { carbs: 0, protein: 0, fat: 0 },
    snack: { carbs: 0, protein: 0, fat: 0 },
    lateNight: { carbs: 0, protein: 0, fat: 0 },
  };
  const menusByTime: Record<MealTimeKey, MenuSimpleResponseDto[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
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

      const menuItem: MenuSimpleResponseDto & { quantity: number } = {
        id: menu.id,
        data_source: menu.data_source,
        name: menu.name,
        brand: menu?.brand,
        category: menu.category,
        unit: menu.unit,
        weight: menu.weight,
        unit_quantity: menu.unit_quantity,
        calories,
        carbs,
        protein,
        fat,
        quantity,
      };

      menusByTime[meal.time].push(menuItem);

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
        case 4: {
          caloriesByTime.lateNight += calories;
          nutrientsByTime.lateNight.carbs += carbs;
          nutrientsByTime.lateNight.protein += protein;
          nutrientsByTime.lateNight.fat += fat;
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
    menusByTime,
  };
}
