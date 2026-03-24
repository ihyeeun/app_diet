import { MEAL_RECORD_END_POINT } from "@/features/meal-record/api/endpoints";
import type { MealMenuDataType, MealMenuItem } from "@/features/meal-record/types/mealRecord.types";
import { SEARCH_MENU_ITEMS } from "@/features/meal-record/utils/mealRecord.mockData";
import { appApiData } from "@/shared/api/appApi";
import { isNativeApp } from "@/shared/api/bridge/nativeBridge";

const WEB_MOCK_SEARCH_DELAY_MS = 250;

type MealMenuSearchApiItem = {
  id?: number | string;
  menuId?: number | string;
  foodId?: number | string;
  title?: string;
  name?: string;
  menuName?: string;
  foodName?: string;
  calories?: number | string;
  calorie?: number | string;
  kcal?: number | string;
  unitAmountText?: string;
  servingAmountText?: string;
  servingSizeText?: string;
  unit?: string;
  dataSource?: string;
  source?: string;
  isPersonal?: boolean;
  brandName?: string;
  brand?: string;
  personalChipLabel?: string;
  carbohydrateGram?: number | string;
  carbohydrate?: number | string;
  carbohydrateG?: number | string;
  carbs?: number | string;
  proteinGram?: number | string;
  protein?: number | string;
  proteinG?: number | string;
  fatGram?: number | string;
  fat?: number | string;
  fatG?: number | string;
  totalWeightGram?: number | string;
  totalWeight?: number | string;
  weightGram?: number | string;
  sugarGram?: number | string;
  sugar?: number | string;
  sugarAlcoholGram?: number | string;
  sugarAlcohol?: number | string;
  dietaryFiberGram?: number | string;
  dietaryFiber?: number | string;
  transFatGram?: number | string;
  transFat?: number | string;
  saturatedFatGram?: number | string;
  saturatedFat?: number | string;
  unsaturatedFatGram?: number | string;
  unsaturatedFat?: number | string;
  sodiumMg?: number | string;
  sodium?: number | string;
  caffeineMg?: number | string;
  caffeine?: number | string;
  potassiumMg?: number | string;
  potassium?: number | string;
  cholesterolMg?: number | string;
  cholesterol?: number | string;
  alcoholGram?: number | string;
  alcohol?: number | string;
};

type MealMenuSearchApiResponse =
  | MealMenuSearchApiItem[]
  | {
      menus?: MealMenuSearchApiItem[];
      items?: MealMenuSearchApiItem[];
      results?: MealMenuSearchApiItem[];
    };

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function parseNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function pickMealDataSource(item: MealMenuSearchApiItem): MealMenuDataType {
  if (item.isPersonal === true) {
    return "personal";
  }

  const normalizedSource = normalizeString(item.dataSource ?? item.source).toLowerCase();
  if (normalizedSource === "personal") {
    return "personal";
  }

  return "public";
}

function normalizeApiItems(payload: MealMenuSearchApiResponse): MealMenuSearchApiItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.menus)) return payload.menus;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function normalizeMenuItem(item: MealMenuSearchApiItem, index: number): MealMenuItem | null {
  const title = normalizeString(item.title ?? item.menuName ?? item.name ?? item.foodName);
  if (!title) return null;

  const idSource = item.menuId ?? item.id ?? item.foodId ?? `${title}-${index}`;
  const calories = parseNumber(item.calories ?? item.calorie ?? item.kcal) ?? 0;
  const carbohydrateGram =
    parseNumber(item.carbohydrateGram ?? item.carbohydrate ?? item.carbohydrateG ?? item.carbs) ??
    0;
  const proteinGram = parseNumber(item.proteinGram ?? item.protein ?? item.proteinG) ?? 0;
  const fatGram = parseNumber(item.fatGram ?? item.fat ?? item.fatG) ?? 0;
  const unitAmountText = normalizeString(
    item.unitAmountText ?? item.servingAmountText ?? item.servingSizeText ?? item.unit,
  );
  const dataSource = pickMealDataSource(item);
  const brand = normalizeString(item.brand ?? item.brandName) || undefined;
  const personalChipLabel = normalizeString(item.personalChipLabel) || undefined;

  return {
    id: String(idSource),
    title,
    calories,
    dataSource,
    unitAmountText: unitAmountText || "1회 제공량 (0g)",
    carbohydrateGram,
    proteinGram,
    fatGram,
    totalWeightGram: parseNumber(item.totalWeightGram ?? item.totalWeight ?? item.weightGram),
    sugarGram: parseNumber(item.sugarGram ?? item.sugar),
    sugarAlcoholGram: parseNumber(item.sugarAlcoholGram ?? item.sugarAlcohol),
    dietaryFiberGram: parseNumber(item.dietaryFiberGram ?? item.dietaryFiber),
    transFatGram: parseNumber(item.transFatGram ?? item.transFat),
    saturatedFatGram: parseNumber(item.saturatedFatGram ?? item.saturatedFat),
    unsaturatedFatGram: parseNumber(item.unsaturatedFatGram ?? item.unsaturatedFat),
    sodiumMg: parseNumber(item.sodiumMg ?? item.sodium),
    caffeineMg: parseNumber(item.caffeineMg ?? item.caffeine),
    potassiumMg: parseNumber(item.potassiumMg ?? item.potassium),
    cholesterolMg: parseNumber(item.cholesterolMg ?? item.cholesterol),
    alcoholGram: parseNumber(item.alcoholGram ?? item.alcohol),
    brand,
    personalChipLabel,
  };
}

function getMockMenuSearchResults(keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return [];

  return SEARCH_MENU_ITEMS.filter((menu) => {
    const title = menu.title.toLowerCase();
    const brand = menu.brand?.toLowerCase() ?? "";
    const personal = menu.personalChipLabel?.toLowerCase() ?? "";

    return (
      title.includes(normalizedKeyword) ||
      brand.includes(normalizedKeyword) ||
      personal.includes(normalizedKeyword)
    );
  });
}

export async function fetchMealMenuSearchResults(keyword: string) {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return [];

  if (!isNativeApp()) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, WEB_MOCK_SEARCH_DELAY_MS);
    });
    return getMockMenuSearchResults(normalizedKeyword);
  }

  const payload = await appApiData<MealMenuSearchApiResponse>({
    endpoint: MEAL_RECORD_END_POINT.SEARCH_MENUS,
    method: "GET",
    params: {
      keyword: normalizedKeyword,
    },
  });

  return normalizeApiItems(payload)
    .map(normalizeMenuItem)
    .filter((menu): menu is MealMenuItem => menu !== null);
}
