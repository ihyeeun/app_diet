import { appApiData } from "@/shared/api/appApi";
import type { MenuResponseDto } from "@/shared/api/types/nutrition.dto";

const END_POINT = {
  MEAL_DETAIL: "/home/menuDetail",
};

export async function getMealDetail(menuId: number) {
  const response = await appApiData<MenuResponseDto>({
    endpoint: END_POINT.MEAL_DETAIL,
    method: "POST",
    body: { id: menuId },
  });

  return response;
}
