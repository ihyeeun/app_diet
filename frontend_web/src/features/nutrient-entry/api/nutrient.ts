import type { RegisterManualMenuPayload } from "@/features/nutrient-entry/api/manualMenu";
import { appApiData } from "@/shared/api/appApi";

const END_POINT = {
  NUTRIENT_REGISTER: "/home/registerMenu",
  NUTRIENT_MODIFY: "/home/modifyMenu",
};

export async function registerMenu(form: RegisterManualMenuPayload) {
  const response = await appApiData<{ id: number }>({
    endpoint: END_POINT.NUTRIENT_REGISTER,
    method: "POST",
    body: form,
  });

  return response.id;
}

export async function modifyNutrient(body: RegisterManualMenuPayload & { id: number }) {
  const response = await appApiData({
    endpoint: END_POINT.NUTRIENT_MODIFY,
    method: "POST",
    body,
  });

  return response;
}
