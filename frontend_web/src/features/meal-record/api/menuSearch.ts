import { MEAL_RECORD_END_POINT } from "@/features/meal-record/api/endpoints";
import { appApiData } from "@/shared/api/appApi";
import {
  type MealMenuItem,
  MENU_UNIT,
  type MenuSimpleResponseDto,
  type SearchRequestDto,
  type SearchResponseDto,
} from "@/shared/api/types/api.dto";

function normalizeString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getUnitLabel(unit: MenuSimpleResponseDto["unit"]) {
  return unit === MENU_UNIT.MILLILITER ? "ml" : "g";
}

function toMealMenuItem(item: MenuSimpleResponseDto): MealMenuItem {
  const unitLabel = getUnitLabel(item.unit);
  const fallbackUnitQuantity = `${item.weight}${unitLabel}`;
  const unitQuantity = normalizeString(item.unit_quantity);
  const unit_quantity = unitQuantity || `1회 제공량 (${fallbackUnitQuantity})`;
  const brand = normalizeString(item.brand);

  return {
    ...item,
    name: item.name,
    unit_quantity,
    brand,
  };
}

export async function fetchMealMenuSearchResults(keyword: string) {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return [];

  const requestBody: SearchRequestDto = {
    input: normalizedKeyword,
  };

  const payload = await appApiData<SearchResponseDto>({
    endpoint: MEAL_RECORD_END_POINT.SEARCH_MENUS,
    method: "POST",
    body: requestBody,
  });

  if (!payload.has_result) {
    return [];
  }

  return payload.menu_list.map(toMealMenuItem);
}
