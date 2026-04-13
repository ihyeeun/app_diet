import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  DEFAULT_MEAL_TYPE,
  MEAL_TYPE_SET,
  type MealType,
} from "@/shared/api/types/api.dto";
import { getTodayFormatDateKey } from "@/shared/utils/dateFormat";

export type ChatMealMenuDraft = {
  id: number;
  quantity: number;
};

export type ChatMealDraft = {
  dateKey: string;
  mealType: MealType;
  menus: ChatMealMenuDraft[];
};

export type ChatMealCommitted = ChatMealDraft & {
  updatedAt: string;
};

type EnsureDraftParams = {
  chatId: number;
  dateKey: string;
  mealType: MealType;
};

type SetDraftMealTypeParams = {
  chatId: number;
  mealType: MealType;
};

type UpsertDraftMenuParams = {
  chatId: number;
  id: number;
  quantity: number;
};

type RemoveDraftMenuParams = {
  chatId: number;
  id: number;
};

type SetDraftMenusParams = {
  chatId: number;
  menus: ChatMealMenuDraft[];
};

type SetCommittedParams = {
  chatId: number;
  dateKey: string;
  mealType: MealType;
  menus: ChatMealMenuDraft[];
  updatedAt?: string;
};

type ChatMealDraftStoreState = {
  draftsByChatId: Record<number, ChatMealDraft>;
  committedByChatId: Record<number, ChatMealCommitted>;

  ensureDraft: (params: EnsureDraftParams) => void;
  setDraftMealType: (params: SetDraftMealTypeParams) => void;
  toggleDraftMenu: (chatId: number, menuId: number) => void;
  upsertDraftMenu: (params: UpsertDraftMenuParams) => void;
  removeDraftMenu: (params: RemoveDraftMenuParams) => void;
  setDraftMenus: (params: SetDraftMenusParams) => void;
  clearDraft: (chatId: number) => void;
  clearAllDrafts: () => void;

  setCommitted: (params: SetCommittedParams) => void;
  clearCommitted: (chatId: number) => void;
};

function isPositiveInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function normalizeMealType(value: unknown): MealType {
  if (typeof value === "string" && MEAL_TYPE_SET.has(value as MealType)) {
    return value as MealType;
  }

  return DEFAULT_MEAL_TYPE;
}

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return 1;
  }

  return Math.round(quantity * 10000) / 10000;
}

function normalizeMenus(menus: ChatMealMenuDraft[]) {
  const quantityById = new Map<number, number>();

  menus.forEach((menu) => {
    if (!isPositiveInt(menu.id)) {
      return;
    }

    const safeQuantity = normalizeQuantity(menu.quantity);
    quantityById.set(menu.id, safeQuantity);
  });

  return [...quantityById.entries()].map(([id, quantity]) => ({
    id,
    quantity,
  }));
}

function getOrCreateDraft(draftsByChatId: Record<number, ChatMealDraft>, chatId: number): ChatMealDraft {
  return (
    draftsByChatId[chatId] ?? {
      dateKey: getTodayFormatDateKey(),
      mealType: DEFAULT_MEAL_TYPE,
      menus: [],
    }
  );
}

export const useChatMealDraftStore = create<ChatMealDraftStoreState>()(
  devtools(
    (set) => ({
      draftsByChatId: {},
      committedByChatId: {},

      ensureDraft: ({ chatId, dateKey, mealType }) => {
        set((state) => {
          if (!isPositiveInt(chatId)) {
            return state;
          }

          if (state.draftsByChatId[chatId]) {
            return state;
          }

          return {
            draftsByChatId: {
              ...state.draftsByChatId,
              [chatId]: {
                dateKey,
                mealType: normalizeMealType(mealType),
                menus: [],
              },
            },
          };
        });
      },

      setDraftMealType: ({ chatId, mealType }) => {
        set((state) => {
          if (!isPositiveInt(chatId)) {
            return state;
          }

          const prevDraft = getOrCreateDraft(state.draftsByChatId, chatId);

          return {
            draftsByChatId: {
              ...state.draftsByChatId,
              [chatId]: {
                ...prevDraft,
                mealType: normalizeMealType(mealType),
              },
            },
          };
        });
      },

      toggleDraftMenu: (chatId, menuId) => {
        set((state) => {
          if (!isPositiveInt(chatId) || !isPositiveInt(menuId)) {
            return state;
          }

          const prevDraft = getOrCreateDraft(state.draftsByChatId, chatId);
          const index = prevDraft.menus.findIndex((menu) => menu.id === menuId);

          const nextMenus =
            index >= 0
              ? prevDraft.menus.filter((menu) => menu.id !== menuId)
              : [...prevDraft.menus, { id: menuId, quantity: 1 }];

          return {
            draftsByChatId: {
              ...state.draftsByChatId,
              [chatId]: {
                ...prevDraft,
                menus: nextMenus,
              },
            },
          };
        });
      },

      upsertDraftMenu: ({ chatId, id, quantity }) => {
        set((state) => {
          if (!isPositiveInt(chatId) || !isPositiveInt(id)) {
            return state;
          }

          const prevDraft = getOrCreateDraft(state.draftsByChatId, chatId);
          const safeQuantity = normalizeQuantity(quantity);

          const existingIndex = prevDraft.menus.findIndex((menu) => menu.id === id);
          const nextMenus =
            existingIndex < 0
              ? [...prevDraft.menus, { id, quantity: safeQuantity }]
              : prevDraft.menus.map((menu, index) =>
                  index === existingIndex ? { ...menu, quantity: safeQuantity } : menu,
                );

          return {
            draftsByChatId: {
              ...state.draftsByChatId,
              [chatId]: {
                ...prevDraft,
                menus: nextMenus,
              },
            },
          };
        });
      },

      removeDraftMenu: ({ chatId, id }) => {
        set((state) => {
          if (!isPositiveInt(chatId) || !isPositiveInt(id)) {
            return state;
          }

          const prevDraft = state.draftsByChatId[chatId];
          if (!prevDraft) {
            return state;
          }

          return {
            draftsByChatId: {
              ...state.draftsByChatId,
              [chatId]: {
                ...prevDraft,
                menus: prevDraft.menus.filter((menu) => menu.id !== id),
              },
            },
          };
        });
      },

      setDraftMenus: ({ chatId, menus }) => {
        set((state) => {
          if (!isPositiveInt(chatId)) {
            return state;
          }

          const prevDraft = getOrCreateDraft(state.draftsByChatId, chatId);

          return {
            draftsByChatId: {
              ...state.draftsByChatId,
              [chatId]: {
                ...prevDraft,
                menus: normalizeMenus(menus),
              },
            },
          };
        });
      },

      clearDraft: (chatId) => {
        set((state) => {
          if (!isPositiveInt(chatId)) {
            return state;
          }

          const nextDrafts = { ...state.draftsByChatId };
          delete nextDrafts[chatId];

          return {
            draftsByChatId: nextDrafts,
          };
        });
      },

      clearAllDrafts: () => {
        set(() => ({
          draftsByChatId: {},
        }));
      },

      setCommitted: ({ chatId, dateKey, mealType, menus, updatedAt }) => {
        set((state) => {
          if (!isPositiveInt(chatId)) {
            return state;
          }

          return {
            committedByChatId: {
              ...state.committedByChatId,
              [chatId]: {
                dateKey,
                mealType: normalizeMealType(mealType),
                menus: normalizeMenus(menus),
                updatedAt: updatedAt ?? new Date().toISOString(),
              },
            },
          };
        });
      },

      clearCommitted: (chatId) => {
        set((state) => {
          if (!isPositiveInt(chatId)) {
            return state;
          }

          const nextCommitted = { ...state.committedByChatId };
          delete nextCommitted[chatId];

          return {
            committedByChatId: nextCommitted,
          };
        });
      },
    }),
    {
      name: "ChatMealDraftStore",
    },
  ),
);
