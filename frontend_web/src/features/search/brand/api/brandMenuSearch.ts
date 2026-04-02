import { fetchMealMenuSearchResults } from "@/features/meal-record/api/menuSearch";
import type { MealMenuItem } from "@/shared/api/types/api.dto";
import { MENU_DATA_SOURCE } from "@/shared/api/types/api.dto";

export type BrandMenuCategory = "all" | "burger" | "drink" | "personal";

export const BRAND_MENU_CATEGORY_OPTIONS: Array<{ value: BrandMenuCategory; label: string }> = [
  { value: "all", label: "전체" },
  { value: "burger", label: "버거류" },
  { value: "drink", label: "음료" },
  { value: "personal", label: "개인용" },
];

const BURGER_PATTERN = /(버거|햄버거|와퍼|맥머핀|샌드위치)/;
const DRINK_PATTERN = /(아메리카노|라떼|커피|에이드|주스|음료|티|차|콜라|사이다|스무디|쉐이크)/;

function normalizeText(value: string | undefined) {
  return (value ?? "").trim();
}

function normalizeForSearch(value: string | undefined) {
  return normalizeText(value).toLowerCase();
}

function uniqueById(menus: MealMenuItem[]) {
  const unique = new Map<number, MealMenuItem>();

  menus.forEach((menu) => {
    unique.set(menu.id, menu);
  });

  return Array.from(unique.values());
}

function inferMenuCategory(menu: MealMenuItem): BrandMenuCategory {
  if (menu.data_source === MENU_DATA_SOURCE.PERSONAL) {
    return "personal";
  }

  const title = normalizeForSearch(menu.name);

  if (DRINK_PATTERN.test(title)) return "drink";
  if (BURGER_PATTERN.test(title)) return "burger";

  return "all";
}

function filterByCategory(menus: MealMenuItem[], category: BrandMenuCategory) {
  if (category === "all") {
    return menus;
  }

  return menus.filter((menu) => inferMenuCategory(menu) === category);
}

function filterByKeyword(menus: MealMenuItem[], keyword: string) {
  const normalizedKeyword = normalizeForSearch(keyword);
  if (!normalizedKeyword) {
    return menus;
  }

  return menus.filter((menu) => {
    const title = normalizeForSearch(menu.name);
    const brand = normalizeForSearch(menu.brand);
    const isPersonal = menu.data_source === MENU_DATA_SOURCE.PERSONAL;

    return (
      title.includes(normalizedKeyword) ||
      brand.includes(normalizedKeyword) ||
      (isPersonal && "개인용".includes(normalizedKeyword))
    );
  });
}

export async function fetchBrandMenuSearchResults({
  brandName,
  keyword,
  category,
}: {
  brandName: string;
  keyword: string;
  category: BrandMenuCategory;
}) {
  const normalizedBrandName = normalizeText(brandName);
  if (!normalizedBrandName) {
    return [];
  }

  const normalizedKeyword = normalizeText(keyword);
  const lookupKeyword = normalizedKeyword || normalizedBrandName;
  const menus = await fetchMealMenuSearchResults(lookupKeyword);

  const brandMenus = menus.filter((menu) => normalizeText(menu.brand) === normalizedBrandName);

  return uniqueById(filterByCategory(filterByKeyword(brandMenus, normalizedKeyword), category));
}

export async function fetchSimilarMenuSuggestions({
  brandName,
  keyword,
}: {
  brandName: string;
  keyword: string;
}) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) {
    return [];
  }

  const normalizedBrandName = normalizeText(brandName);
  const menus = await fetchMealMenuSearchResults(normalizedKeyword);

  const filtered = menus.filter((menu) => normalizeText(menu.brand) !== normalizedBrandName);

  return uniqueById(filtered).slice(0, 3);
}
