import type {
  MealRecordResponseDto,
  MealResponseDto,
  MenuSimpleResponseDto,
} from "@/shared/api/types/api.dto";

type MealTimeKey = 0 | 1 | 2 | 3 | 4;

export type MenuWithQuantity = MenuSimpleResponseDto & { quantity: number };

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
    0: MenuWithQuantity[];
    1: MenuWithQuantity[];
    2: MenuWithQuantity[];
    3: MenuWithQuantity[];
    4: MenuWithQuantity[];
  };
  imagesByTime: {
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
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
  const menusByTime: Record<MealTimeKey, MenuWithQuantity[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  };
  const imagesByTime: Record<MealTimeKey, string> = {
    0: "",
    1: "",
    2: "",
    3: "",
    4: "",
  };

  const resolveConsumedWeight = (meal: MealResponseDto, menu: MenuSimpleResponseDto, menuIndex: number) => {
    const consumedWeight = meal.menu_quantities[menuIndex];
    if (typeof consumedWeight === "number" && Number.isFinite(consumedWeight) && consumedWeight > 0) {
      return consumedWeight;
    }

    // Fallback to one base serving weight when the payload is missing.
    if (typeof menu.weight === "number" && Number.isFinite(menu.weight) && menu.weight > 0) {
      return menu.weight;
    }

    return 1;
  };

  meals.meal_list.forEach((meal) => {
    if (typeof meal.image === "string" && meal.image.trim().length > 0) {
      // 같은 time에 여러 건이면 마지막 이미지로 덮어씀
      imagesByTime[meal.time] = meal.image;
    }

    meal.menu_list.forEach((menu, menuIndex) => {
      const consumedWeight = resolveConsumedWeight(meal, menu, menuIndex);
      const baseWeight =
        typeof menu.weight === "number" && Number.isFinite(menu.weight) && menu.weight > 0
          ? menu.weight
          : 1;
      const scaleFactor = consumedWeight / baseWeight;
      const calories = menu.calories * scaleFactor;
      const carbs = menu.carbs * scaleFactor;
      const protein = menu.protein * scaleFactor;
      const fat = menu.fat * scaleFactor;

      const menuItem: MenuWithQuantity = {
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
        quantity: consumedWeight,
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
    imagesByTime,
  };
}
