import { appApiData } from "@/shared/api/appApi";
import type {
  DateRequestDto,
  DeleteMealRequestDto,
  MealRecordResponseDto,
  RegisterMealRequestDto,
} from "@/shared/api/types/api.dto";

const END_POINT = {
  DAY_MEALS: "/home/getMealRecord",
  MEAL_REGISTER: "/home/registerMeal",
  MEAL_DELETE: "/home/deleteMeal",
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

export async function deleteTodayMealRecord(body: DeleteMealRequestDto) {
  await appApiData({
    endpoint: END_POINT.MEAL_DELETE,
    method: "POST",
    body,
  });
}
