import { appApiData } from "@/shared/api/appApi";
import type { DateRequestDto, MealRecordResponseDto } from "@/shared/api/types/nutrition.dto";

const END_POINT = {
  DAY_MEALS: "/home/meal/record",
};

export async function getDayMeals(date: DateRequestDto) {
  const response = await appApiData<MealRecordResponseDto>({
    endpoint: END_POINT.DAY_MEALS,
    method: "POST",
    body: date,
  });

  return response;
}

{
  /*

  필요한거 

  1. 섭취한 총 칼로리 값
  2. 시간대 별 칼로리 값 (current)
  3. 시간대별 탄단지 총 값

  */
}
