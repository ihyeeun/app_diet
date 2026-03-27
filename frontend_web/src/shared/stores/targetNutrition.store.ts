import { create } from "zustand";
import { combine, devtools, persist, createJSONStorage } from "zustand/middleware";

export type TargetsNutritions = {
  target_calories: number;
  target_ratio: [carbs: number, protein: number, fat: number];
};

type State = {
  targets: TargetsNutritions | null;
  hasTargetsLoaded: boolean;
};

const initialState: State = {
  targets: null,
  hasTargetsLoaded: false,
};

function isSameTargets(a: TargetsNutritions, b: TargetsNutritions) {
  return (
    a.target_calories === b.target_calories &&
    a.target_ratio[0] === b.target_ratio[0] &&
    a.target_ratio[1] === b.target_ratio[1] &&
    a.target_ratio[2] === b.target_ratio[2]
  );
}

const useTargetsStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        actions: {
          setTargets: (next: TargetsNutritions | null) =>
            set(
              (prev) => {
                if (prev.targets && next && isSameTargets(prev.targets, next)) {
                  return prev;
                }
                return { targets: next, hasTargetsLoaded: true };
              },
              false,
              "setTargets",
            ),
          clearTargets: () => set({ targets: null, hasTargetsLoaded: true }, false, "clearTargets"),
          markHydrated: () => set({ hasTargetsLoaded: true }, false, "markHydrated"),
        },
      })),
      {
        name: "targets",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ targets: state.targets }),
        onRehydrateStorage: () => (state) => {
          state?.actions.markHydrated();
        },
      },
    ),
    { name: "TargetsNutritionsStore" },
  ),
);

export const useTargetsState = () => useTargetsStore((s) => s.targets);
export const useTargetsLoadedState = () => useTargetsStore((s) => s.hasTargetsLoaded);
export const useSetTargets = () => useTargetsStore((s) => s.actions.setTargets);
export const useClearTargets = () => useTargetsStore((s) => s.actions.clearTargets);
