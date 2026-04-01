import { NUTRIENT_ENTRY_END_POINT } from "@/features/nutrient-entry/api/endpoints";
import { appApiData } from "@/shared/api/appApi";
import type {
  MenuId,
  MenuNutrientFields,
  RegisterMenuRequestDto,
} from "@/shared/api/types/api.dto";

type NullableNutrientPayload = {
  [K in keyof MenuNutrientFields]: number | null;
};

export type RegisterManualMenuPayload = Omit<
  RegisterMenuRequestDto,
  keyof MenuNutrientFields
> &
  NullableNutrientPayload;

export type ModifyManualMenuPayload = RegisterManualMenuPayload & {
  id: MenuId;
};

type UpsertMenuResponse = {
  id?: unknown;
  menuId?: unknown;
  menu_id?: unknown;
};

function toMenuId(value: unknown): MenuId | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}

function resolveMenuId(response: UpsertMenuResponse): MenuId {
  const menuId = toMenuId(response.id) ?? toMenuId(response.menuId) ?? toMenuId(response.menu_id);

  if (menuId === null) {
    throw new Error("메뉴 ID를 확인할 수 없어요");
  }

  return menuId;
}

export async function postManualMenuRegister(body: RegisterManualMenuPayload) {
  const response = await appApiData<UpsertMenuResponse>({
    endpoint: NUTRIENT_ENTRY_END_POINT.MENU_REGISTER,
    method: "POST",
    body,
  });

  return resolveMenuId(response);
}

export async function postManualMenuModify(body: ModifyManualMenuPayload) {
  const response = await appApiData<UpsertMenuResponse>({
    endpoint: NUTRIENT_ENTRY_END_POINT.MENU_MODIFY,
    method: "POST",
    body,
  });

  return resolveMenuId(response);
}
