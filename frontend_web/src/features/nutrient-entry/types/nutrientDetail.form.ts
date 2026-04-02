import type {
  MenuNutrientFieldKey,
  MenuNutrientFields,
  RegisterMenuRequestDto,
} from "@/shared/api/types/api.dto";

export type NutrientDetailPayload = Pick<RegisterMenuRequestDto, "calories" | "weight"> &
  MenuNutrientFields;

export type NutrientDetailFormFieldKey = keyof NutrientDetailPayload;

export type NutrientDetailForm = Record<NutrientDetailFormFieldKey, string>;

export type RequiredNutrientField = "calories" | "carbs" | "protein" | "fat" | "weight";

export type MacroFieldKey = "carbs" | "protein" | "fat";

export type ParentNutrientField = "carbs" | "fat";

// 내가 만든거 영양소 타입
export type NutrientPayload = MenuNutrientFieldKey;
