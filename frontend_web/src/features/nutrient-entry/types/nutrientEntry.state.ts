import type { MealMenuItem, MenuId, NutrientAddLocationState } from "@/shared/api/types/api.dto";

export type NutrientModeType = "register" | "modify" | "create" | "edit" | "update";

export type NutrientDetailLocationState = NutrientAddLocationState & {
  modeType?: NutrientModeType;
  menuId?: MenuId;
  menu?: MealMenuItem;
  quantity?: number;
};

export type NutrientModifyLocationState = NutrientDetailLocationState & {
  returnPath?: string;
};
