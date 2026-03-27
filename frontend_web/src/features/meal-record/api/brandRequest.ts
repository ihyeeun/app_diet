import { MEAL_RECORD_END_POINT } from "@/features/meal-record/api/endpoints";
import { appApiData } from "@/shared/api/appApi";

type BrandRequestPayload = {
  brandName: string;
};

type BrandRequestResponse = {
  brandName: string;
};

export async function postMealRecordBrandRequest(brandName: string) {
  const normalizedBrandName = brandName.trim();
  if (!normalizedBrandName) {
    throw new Error("브랜드명은 필수입니다.");
  }

  const requestPayload: BrandRequestPayload = {
    brandName: normalizedBrandName,
  };

  return appApiData<BrandRequestResponse>({
    endpoint: MEAL_RECORD_END_POINT.REQUEST_BRAND,
    method: "POST",
    body: requestPayload,
  });
}
