import { appApiData } from "@/shared/api/appApi";
import type {
  DateRequestDto,
  MealRecordResponseDto,
  RegisterMealRequestDto,
} from "@/shared/api/types/api.dto";

const END_POINT = {
  DAY_MEALS: "/home/getMealRecord",
  MEAL_REGISTER: "/home/registerMeal",
};

export async function getDayMeals(date: DateRequestDto) {
  const response = await appApiData<MealRecordResponseDto>({
    endpoint: END_POINT.DAY_MEALS,
    method: "POST",
    body: date,
  });

  return response;
}

export async function postTodayMealRecordRegister(body: RegisterMealRequestDto) {
  const response = await appApiData({
    endpoint: END_POINT.MEAL_REGISTER,
    method: "POST",
    body,
  });

  return response;
}
