import { appApiData } from "@/shared/api/appApi";
import type { SearchResponseDto } from "@/shared/api/types/nutrition.dto";

const END_POINT = {
  SEARCH_MENUS: "/home/search",
};

export async function postMealSearch(input: string) {
  const response = await appApiData<SearchResponseDto>({
    endpoint: END_POINT.SEARCH_MENUS,
    method: "POST",
    body: { input },
  });

  return response;
}
