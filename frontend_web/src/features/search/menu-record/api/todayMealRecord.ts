import { appApiData } from "@/shared/api/appApi";
import type { RegisterMealRequestDto } from "@/shared/api/types/nutrient.dto";

const END_POINT = {
  MEAL_REGISTER: "/home/meal/register",
};

export async function postTodayMealRecordRegister(body: RegisterMealRequestDto) {
  const response = await appApiData({
    endpoint: END_POINT.MEAL_REGISTER,
    method: "POST",
    body,
  });

  return response;
}
