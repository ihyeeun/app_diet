import { useQueryClient } from "@tanstack/react-query";

import { useChatMealDraftStore } from "@/features/chat/stores/chatMealDraft.store";
import { getDayMeals } from "@/features/home/api/dayMeal";
import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import type { DayMealSummary, MenuWithQuantity } from "@/features/home/utils/dayMealSummary";
import {
  DELETE_MEAL_RECORD_RESULT,
  useTodayMealRecordDeleteWithRollbackMutation,
  useTodayMealRecordRegisterMutation,
} from "@/features/meal-record/hooks/mutations/useTodayMealRecordMutation";
import type { MealTime, RegisterMealRequestDto } from "@/shared/api/types/api.dto";

type MenuQuantity = {
  id: number;
  quantity: number;
};

type RegisterDraftParams = {
  chatId: number;
};

const REGISTER_RESULT = {
  SUCCESS: "success",
  SKIPPED: "skipped",
  FAILED: "failed",
} as const;

export type RegisterDraftResult = (typeof REGISTER_RESULT)[keyof typeof REGISTER_RESULT];

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Invalid menu quantity");
  }

  return Math.round(quantity * 10000) / 10000;
}

function roundQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.round(quantity * 10000) / 10000;
}

function toMenuQuantities(menus: MenuWithQuantity[]): MenuQuantity[] {
  return menus.map((menu) => ({
    id: menu.id,
    quantity: normalizeQuantity(menu.quantity),
  }));
}

function toMenusByTime(summary: DayMealSummary): Record<MealTime, MenuQuantity[]> {
  return {
    0: toMenuQuantities(summary.menusByTime[0]),
    1: toMenuQuantities(summary.menusByTime[1]),
    2: toMenuQuantities(summary.menusByTime[2]),
    3: toMenuQuantities(summary.menusByTime[3]),
    4: toMenuQuantities(summary.menusByTime[4]),
  };
}

function mergeMenus(baseMenus: MenuQuantity[], addMenus: MenuQuantity[]) {
  const quantityByMenuId = new Map<number, number>();

  baseMenus.forEach((menu) => {
    quantityByMenuId.set(menu.id, normalizeQuantity(menu.quantity));
  });

  addMenus.forEach((menu) => {
    const previous = quantityByMenuId.get(menu.id) ?? 0;
    quantityByMenuId.set(menu.id, normalizeQuantity(previous + menu.quantity));
  });

  return [...quantityByMenuId.entries()]
    .map(([id, quantity]) => ({
      id,
      quantity,
    }))
    .filter((menu) => menu.quantity > 0);
}

function subtractMenus(baseMenus: MenuQuantity[], removeMenus: MenuQuantity[]) {
  const quantityByMenuId = new Map<number, number>();

  baseMenus.forEach((menu) => {
    quantityByMenuId.set(menu.id, normalizeQuantity(menu.quantity));
  });

  removeMenus.forEach((menu) => {
    const previous = quantityByMenuId.get(menu.id) ?? 0;
    const nextQuantity = roundQuantity(previous - menu.quantity);

    if (nextQuantity > 0) {
      quantityByMenuId.set(menu.id, nextQuantity);
      return;
    }

    quantityByMenuId.delete(menu.id);
  });

  return [...quantityByMenuId.entries()].map(([id, quantity]) => ({
    id,
    quantity,
  }));
}

function toRegisterRequest(
  date: string,
  mealType: string,
  menus: MenuQuantity[],
): RegisterMealRequestDto {
  return {
    date,
    time: Number(mealType) as MealTime,
    menu_ids: menus.map((menu) => menu.id),
    menu_quantities: menus.map((menu) => normalizeQuantity(menu.quantity)),
  };
}

export function useChatMealRecordActions() {
  const queryClient = useQueryClient();
  const { mutateAsync: registerMealAsync, isPending: isRegisterPending } =
    useTodayMealRecordRegisterMutation();
  const { mutateAsync: deleteWithRollbackAsync, isPending: isDeletePending } =
    useTodayMealRecordDeleteWithRollbackMutation();

  const fetchDayMeals = async (date: string) => {
    return queryClient.fetchQuery({
      queryKey: queryKeys.dayMeals(date),
      queryFn: () => getDayMeals({ date }),
    });
  };

  const registerDraft = async ({ chatId }: RegisterDraftParams): Promise<RegisterDraftResult> => {
    const store = useChatMealDraftStore.getState();
    const draft = store.draftsByChatId[chatId];
    if (!draft || draft.menus.length === 0) {
      return REGISTER_RESULT.SKIPPED;
    }

    try {
      const dayMeals = await fetchDayMeals(draft.dateKey);
      const currentMenusByTime = toMenusByTime(dayMeals);

      const previousCommitted = store.committedByChatId[chatId];
      const previousMenus =
        previousCommitted &&
        previousCommitted.dateKey === draft.dateKey &&
        previousCommitted.mealType === draft.mealType
          ? previousCommitted.menus
          : [];

      const currentMenus = currentMenusByTime[Number(draft.mealType) as MealTime] ?? [];
      const baseMenus = subtractMenus(currentMenus, previousMenus);
      const mergedMenus = mergeMenus(baseMenus, draft.menus);

      if (mergedMenus.length === 0) {
        const deleteResult = await deleteWithRollbackAsync({
          dateKey: draft.dateKey,
          request: toRegisterRequest(draft.dateKey, draft.mealType, mergedMenus),
          currentMenusByTime,
        });

        if (deleteResult !== DELETE_MEAL_RECORD_RESULT.DELETED) {
          return REGISTER_RESULT.FAILED;
        }
      } else {
        await registerMealAsync(toRegisterRequest(draft.dateKey, draft.mealType, mergedMenus));
      }
    } catch {
      return REGISTER_RESULT.FAILED;
    }

    useChatMealDraftStore.getState().setCommitted({
      chatId,
      dateKey: draft.dateKey,
      mealType: draft.mealType,
      menus: draft.menus,
      updatedAt: new Date().toISOString(),
    });

    return REGISTER_RESULT.SUCCESS;
  };

  const cancelCommitted = async (chatId: number): Promise<RegisterDraftResult> => {
    const store = useChatMealDraftStore.getState();
    const committed = store.committedByChatId[chatId];
    if (!committed) {
      return REGISTER_RESULT.SKIPPED;
    }

    try {
      const dayMeals = await fetchDayMeals(committed.dateKey);
      const currentMenusByTime = toMenusByTime(dayMeals);
      const currentMenus = currentMenusByTime[Number(committed.mealType) as MealTime] ?? [];
      const nextMenus = subtractMenus(currentMenus, committed.menus);

      if (nextMenus.length === 0) {
        const deleteResult = await deleteWithRollbackAsync({
          dateKey: committed.dateKey,
          request: toRegisterRequest(committed.dateKey, committed.mealType, nextMenus),
          currentMenusByTime,
        });

        if (deleteResult !== DELETE_MEAL_RECORD_RESULT.DELETED) {
          return REGISTER_RESULT.FAILED;
        }
      } else {
        await registerMealAsync(
          toRegisterRequest(committed.dateKey, committed.mealType, nextMenus),
        );
      }
    } catch {
      return REGISTER_RESULT.FAILED;
    }

    useChatMealDraftStore.getState().clearCommitted(chatId);

    return REGISTER_RESULT.SUCCESS;
  };

  return {
    registerDraft,
    cancelCommitted,
    isPending: isRegisterPending || isDeletePending,
    REGISTER_RESULT,
  };
}
