import { create } from "zustand";
import type { MealMenuItem, MealType } from "@/shared/api/types/nutrient.dto";

export type MealRecordDraftKey = `${string}:${MealType}`;

export type MealRecordDraftSelection = {
  menuId: number;
  quantity: number;
};

type MealRecordDraft = {
  existingMenuCount: number;
  selections: MealRecordDraftSelection[];
};

type EnsureDraftParams = {
  key: MealRecordDraftKey;
  existingMenuCount: number;
  seedMenus?: MealMenuItem[];
};

type UpsertSelectionParams = {
  key: MealRecordDraftKey;
  menu: MealMenuItem;
};

type MealRecordDraftStoreState = {
  drafts: Record<string, MealRecordDraft>;
  menuSnapshotById: Record<number, MealMenuItem>;
  ensureDraft: (params: EnsureDraftParams) => void;
  upsertMenuSelection: (params: UpsertSelectionParams) => void;
  removeMenuSelection: (key: MealRecordDraftKey, menuId: number) => void;
  clearDraft: (key: MealRecordDraftKey) => void;
  getSelectedMenus: (key: MealRecordDraftKey) => MealMenuItem[];
  getSelectionQuantity: (key: MealRecordDraftKey, menuId: number) => number | null;
};

const DEFAULT_DRAFT: MealRecordDraft = {
  existingMenuCount: 0,
  selections: [],
};

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function resolveMenuQuantity(menu: MealMenuItem) {
  const value = menu.serving_input_value;
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return roundToSingleDecimal(value);
  }

  return 1;
}

function upsertSelection(
  selections: MealRecordDraftSelection[],
  nextSelection: MealRecordDraftSelection,
) {
  const existingIndex = selections.findIndex((item) => item.menuId === nextSelection.menuId);
  if (existingIndex < 0) {
    return [...selections, nextSelection];
  }

  return selections.map((item, index) => (index === existingIndex ? nextSelection : item));
}

function seedDraftWithMenus({
  draft,
  menuSnapshotById,
  seedMenus,
}: {
  draft: MealRecordDraft;
  menuSnapshotById: Record<number, MealMenuItem>;
  seedMenus: MealMenuItem[];
}) {
  let nextSelections = [...draft.selections];
  let nextMenuSnapshotById = menuSnapshotById;

  seedMenus.forEach((menu) => {
    nextSelections = upsertSelection(nextSelections, {
      menuId: menu.id,
      quantity: resolveMenuQuantity(menu),
    });

    nextMenuSnapshotById = {
      ...nextMenuSnapshotById,
      [menu.id]: menu,
    };
  });

  return {
    draft: {
      ...draft,
      selections: nextSelections,
    },
    menuSnapshotById: nextMenuSnapshotById,
  };
}

export function buildMealRecordDraftKey(dateKey: string, mealType: MealType): MealRecordDraftKey {
  return `${dateKey}:${mealType}`;
}

export const useMealRecordDraftStore = create<MealRecordDraftStoreState>((set, get) => ({
  drafts: {},
  menuSnapshotById: {},

  ensureDraft: ({ key, existingMenuCount, seedMenus = [] }) => {
    set((state) => {
      const prevDraft = state.drafts[key];
      const nextDraft: MealRecordDraft = prevDraft
        ? {
            ...prevDraft,
            existingMenuCount: Math.max(prevDraft.existingMenuCount, existingMenuCount),
          }
        : {
            existingMenuCount,
            selections: [],
          };

      if (seedMenus.length === 0 || (prevDraft && prevDraft.selections.length > 0)) {
        return {
          drafts: {
            ...state.drafts,
            [key]: nextDraft,
          },
        };
      }

      const seeded = seedDraftWithMenus({
        draft: nextDraft,
        menuSnapshotById: state.menuSnapshotById,
        seedMenus,
      });

      return {
        drafts: {
          ...state.drafts,
          [key]: seeded.draft,
        },
        menuSnapshotById: seeded.menuSnapshotById,
      };
    });
  },

  upsertMenuSelection: ({ key, menu }) => {
    set((state) => {
      const currentDraft = state.drafts[key] ?? DEFAULT_DRAFT;
      const nextSelection: MealRecordDraftSelection = {
        menuId: menu.id,
        quantity: resolveMenuQuantity(menu),
      };

      return {
        drafts: {
          ...state.drafts,
          [key]: {
            ...currentDraft,
            selections: upsertSelection(currentDraft.selections, nextSelection),
          },
        },
        menuSnapshotById: {
          ...state.menuSnapshotById,
          [menu.id]: menu,
        },
      };
    });
  },

  removeMenuSelection: (key, menuId) => {
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
            selections: draft.selections.filter((item) => item.menuId !== menuId),
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

  getSelectedMenus: (key) => {
    const state = get();
    const draft = state.drafts[key];
    if (!draft) {
      return [];
    }

    return draft.selections.reduce<MealMenuItem[]>((menus, selection) => {
      const snapshot = state.menuSnapshotById[selection.menuId];
      if (!snapshot) {
        return menus;
      }

      menus.push({
        ...snapshot,
        serving_input_value: selection.quantity,
      });

      return menus;
    }, []);
  },

  getSelectionQuantity: (key, menuId) => {
    const state = get();
    const draft = state.drafts[key];
    if (!draft) {
      return null;
    }

    const selection = draft.selections.find((item) => item.menuId === menuId);
    if (!selection) {
      return null;
    }

    return selection.quantity;
  },
}));
