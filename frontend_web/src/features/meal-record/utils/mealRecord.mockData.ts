import {
  DEFAULT_TARGET_MACRO_RATIOS,
  type MealMenuItem,
  type MealRecordByType,
} from "../types/mealRecord.types";

export const SEARCH_MENU_ITEMS: MealMenuItem[] = [
  {
    id: "search-1",
    title: "상하이버거",
    calories: 501,
    unitAmountText: "1단품 (246g)",
    carbohydrateGram: 46,
    sugarGram: 18,
    sugarAlcoholGram: 27.3,
    proteinGram: 27,
    fatGram: 24,
    cholesterolMg: 17,
    brandChipLabel: "맥도날드",
  },
  {
    id: "search-2",
    title: "빅맥",
    calories: 582,
    unitAmountText: "1단품 (223g)",
    carbohydrateGram: 47,
    proteinGram: 30,
    fatGram: 30,
    brandChipLabel: "맥도날드",
  },
  {
    id: "search-3",
    title: "아메리카노",
    calories: 12,
    unitAmountText: "1잔 (355ml)",
    carbohydrateGram: 2,
    proteinGram: 1,
    fatGram: 0,
    personalChipLabel: "카페",
  },
  {
    id: "search-4",
    title: "곤약김밥",
    calories: 262.5,
    unitAmountText: "1줄 (220g)",
    carbohydrateGram: 38,
    proteinGram: 12,
    fatGram: 8,
    brandChipLabel: "헬스고메",
  },
  {
    id: "search-5",
    title: "토마토 파스타",
    calories: 355,
    unitAmountText: "1접시 (210g)",
    carbohydrateGram: 56,
    proteinGram: 14,
    fatGram: 9,
  },
  {
    id: "search-6",
    title: "치킨 샐러드",
    calories: 202,
    unitAmountText: "1볼 (180g)",
    carbohydrateGram: 16,
    proteinGram: 22,
    fatGram: 7,
  },
];

export function getInitialMealRecords(): MealRecordByType {
  return {
    breakfast: {
      targetCalories: 2100,
      targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
      menuItems: [],
      photoGroups: [],
      addQueue: [],
    },
    lunch: {
      targetCalories: 2100,
      targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
      menuItems: [],
      photoGroups: [
        {
          id: "lu-photo-1",
          imageSrc: "/icons/Food.svg",
          imageAlt: "점심으로 찍은 음식 사진",
          items: [
            {
              id: "lu-3",
              title: "토마토 파스타",
              calories: 355,
              unitAmountText: "1접시 (210g)",
              carbohydrateGram: 56,
              proteinGram: 14,
              fatGram: 9,
            },
            {
              id: "lu-4",
              title: "치킨 샐러드",
              calories: 202,
              unitAmountText: "1볼 (180g)",
              carbohydrateGram: 16,
              proteinGram: 22,
              fatGram: 7,
            },
          ],
        },
      ],
      addQueue: [],
    },
    dinner: {
      targetCalories: 2100,
      targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
      menuItems: [],
      photoGroups: [],
      addQueue: [],
    },
    snack: {
      targetCalories: 2100,
      targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
      menuItems: [],
      photoGroups: [],
      addQueue: [],
    },
  };
}
