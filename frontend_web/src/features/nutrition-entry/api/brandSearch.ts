import { NUTRITION_ENTRY_END_POINT } from "@/features/nutrition-entry/api/endpoints";
import { appApiData } from "@/shared/api/appApi";
import type { SearchBrandResponseDto } from "@/shared/api/types/nutrition.dto";

export type BrandSearchResult = {
  id: string;
  name: string;
};

function mapBrandList(brandList: string[]): BrandSearchResult[] {
  return brandList
    .map((brandName, index) => {
      const normalizedName = brandName.trim();
      if (!normalizedName) {
        return null;
      }

      return {
        id: `${normalizedName}-${index}`,
        name: normalizedName,
      };
    })
    .filter((brand): brand is BrandSearchResult => brand !== null);
}

export async function fetchBrandSearchResults(keyword: string) {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return [];

  const payload = await appApiData<SearchBrandResponseDto>({
    endpoint: NUTRITION_ENTRY_END_POINT.SEARCH_BRANDS,
    method: "GET",
    params: {
      input: normalizedKeyword,
    },
  });

  return mapBrandList(payload.brand_list);
}
