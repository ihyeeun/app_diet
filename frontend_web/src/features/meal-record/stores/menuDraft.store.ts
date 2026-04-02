import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { MealType } from "@/shared/api/types/api.dto";

export type MenuDraftKey = `${string}:${MealType}`;
export function formatMenuDraftKey(date: string, mealType: MealType): MenuDraftKey {
  return `${date}:${mealType}`;
}

export type MenuDraftType = {
  id: number;
  quantity: number;
};

type MenusDraft = {
  existingMenuCount: number;
  existingMenus: MenuDraftType[];
};

type InitDraftParams = {
  key: MenuDraftKey;
  existingMenuCount: number;
  seedMenus?: MenuDraftType[];
};

type UpsertMenuParams = {
  key: MenuDraftKey;
  id: number;
  quantity: number;
};

type RemoveMenuParams = {
  key: MenuDraftKey;
  id: number;
};

type MenuDraftStoreState = {
  drafts: Record<MenuDraftKey, MenusDraft>;
  initDraft: (params: InitDraftParams) => void;
  upsertMenu: (params: UpsertMenuParams) => void;
  removeMenu: (params: RemoveMenuParams) => void;
  clearDraft: (key: MenuDraftKey) => void;
};

const INIT_DRAFT: MenusDraft = {
  existingMenuCount: 0,
  existingMenus: [],
};

function getDraftOrInit(drafts: Record<MenuDraftKey, MenusDraft>, key: MenuDraftKey): MenusDraft {
  return drafts[key] ?? INIT_DRAFT;
}

export const useMenuDraftStore = create<MenuDraftStoreState>()(
  devtools(
    (set) => ({
      drafts: {},

      initDraft: ({ key, existingMenuCount, seedMenus }) => {
        set((state) => {
          const prev = state.drafts[key];
          const safeCount = Math.max(0, Math.floor(existingMenuCount));

          if (!prev) {
            return {
              drafts: {
                ...state.drafts,
                [key]: {
                  existingMenuCount: safeCount,
                  existingMenus: [...(seedMenus ?? [])],
                },
              },
            };
          }

          return {
            drafts: {
              ...state.drafts,
              [key]: {
                ...prev,
                existingMenuCount: Math.max(prev.existingMenuCount, safeCount),
              },
            },
          };
        });
      },

      upsertMenu: ({ key, id, quantity }) => {
        set((state) => {
          const draft = state.drafts[key] ?? INIT_DRAFT;
          const safeQuantity =
            typeof quantity === "number" && Number.isFinite(quantity) && quantity > 0
              ? Math.round(quantity * 10) / 10
              : 1;

          const existingIndex = draft.existingMenus.findIndex((menu) => menu.id === id);
          const nextMenus =
            existingIndex < 0
              ? [...draft.existingMenus, { id, quantity: safeQuantity }]
              : draft.existingMenus.map((menu, index) =>
                  index === existingIndex ? { ...menu, quantity: safeQuantity } : menu,
                );

          return {
            drafts: {
              ...state.drafts,
              [key]: {
                ...draft,
                existingMenus: nextMenus,
              },
            },
          };
        });
      },

      removeMenu: ({ key, id }) => {
        set((state) => {
          const draft = state.drafts[key];
          if (!draft) {
            return state;
          }

          return {
            drafts: {
              ...state.drafts,
              [key]: {
                ...draft,
                existingMenus: draft.existingMenus.filter((menu) => menu.id !== id),
              },
            },
          };
        });
      },

      clearDraft: (key) => {
        set((state) => {
          const nextDrafts = { ...state.drafts };
          delete nextDrafts[key];

          return {
            drafts: nextDrafts,
          };
        });
      },
    }),
    { name: "MenuDraftStore" },
  ),
);

export const useMenuDraftInit = () => useMenuDraftStore((store) => store.initDraft);
export const useMenuDraftUpsert = () => useMenuDraftStore((store) => store.upsertMenu);
export const useMenuDraftRemove = () => useMenuDraftStore((store) => store.removeMenu);
export const useMenuDraftClear = () => useMenuDraftStore((store) => store.clearDraft);

export function useMenuDraft(date: string, mealType: MealType) {
  const key = formatMenuDraftKey(date, mealType);
  return useMenuDraftStore((store) => getDraftOrInit(store.drafts, key));
}

export function useMenuDraftExistingMenuCount(date: string, mealType: MealType) {
  const key = formatMenuDraftKey(date, mealType);
  return useMenuDraftStore((store) => getDraftOrInit(store.drafts, key).existingMenuCount);
}

export function useMenuDraftMenus(date: string, mealType: MealType) {
  const key = formatMenuDraftKey(date, mealType);
  return useMenuDraftStore((store) => getDraftOrInit(store.drafts, key).existingMenus);
}

export function useMenuDraftSelectedCount(date: string, mealType: MealType) {
  const key = formatMenuDraftKey(date, mealType);
  return useMenuDraftStore((store) => getDraftOrInit(store.drafts, key).existingMenus.length);
}
