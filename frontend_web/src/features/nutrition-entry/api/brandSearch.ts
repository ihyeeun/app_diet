import { NUTRITION_ENTRY_END_POINT } from "@/features/nutrition-entry/api/endpoints";
import { appApiData } from "@/shared/api/appApi";
import { isNativeApp } from "@/shared/api/bridge/nativeBridge";

export type BrandSearchResult = {
  id: string;
  name: string;
};

type BrandSearchApiItem = {
  id?: number | string;
  brandId?: number | string;
  name?: string;
  brandName?: string;
};

type BrandSearchApiResponse = {
  brands?: BrandSearchApiItem[];
  items?: BrandSearchApiItem[];
} | BrandSearchApiItem[];

const WEB_MOCK_BRANDS: BrandSearchResult[] = [
  { id: "brand-1", name: "맥도날드" },
  { id: "brand-2", name: "맘스터치" },
  { id: "brand-3", name: "버거킹" },
  { id: "brand-4", name: "롯데리아" },
  { id: "brand-5", name: "스타벅스" },
  { id: "brand-6", name: "이디야" },
  { id: "brand-7", name: "서브웨이" },
];

function normalizeApiItems(payload: BrandSearchApiResponse): BrandSearchApiItem[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.brands)) return payload.brands;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function normalizeBrandResult(item: BrandSearchApiItem, index: number): BrandSearchResult | null {
  const name = (item.brandName ?? item.name ?? "").trim();
  if (!name) return null;

  const idSource = item.brandId ?? item.id ?? `${name}-${index}`;
  return {
    id: String(idSource),
    name,
  };
}

function getMockBrandSearchResults(keyword: string): BrandSearchResult[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return [];

  return WEB_MOCK_BRANDS.filter((brand) => brand.name.toLowerCase().includes(normalizedKeyword));
}

export async function fetchBrandSearchResults(keyword: string) {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) return [];

  if (!isNativeApp()) {
    return getMockBrandSearchResults(normalizedKeyword);
  }

  const payload = await appApiData<BrandSearchApiResponse>({
    endpoint: NUTRITION_ENTRY_END_POINT.SEARCH_BRANDS,
    method: "GET",
    params: {
      keyword: normalizedKeyword,
    },
  });

  return normalizeApiItems(payload)
    .map(normalizeBrandResult)
    .filter((brand): brand is BrandSearchResult => brand !== null);
}
