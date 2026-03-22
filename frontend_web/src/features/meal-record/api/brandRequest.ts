import { MEAL_RECORD_END_POINT } from "@/features/meal-record/api/endpoints";
import { appApiData } from "@/shared/api/appApi";
import { isNativeApp } from "@/shared/api/bridge/nativeBridge";

const WEB_MOCK_REQUEST_DELAY_MS = 350;

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

  if (!isNativeApp()) {
    await new Promise((resolve) => {
      window.setTimeout(resolve, WEB_MOCK_REQUEST_DELAY_MS);
    });

    return requestPayload;
  }

  return appApiData<BrandRequestResponse>({
    endpoint: MEAL_RECORD_END_POINT.REQUEST_BRAND,
    method: "POST",
    body: requestPayload,
  });
}
