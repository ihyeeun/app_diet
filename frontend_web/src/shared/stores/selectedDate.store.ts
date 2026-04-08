import { create } from "zustand";

import { formatDateKey, getTodayFormatDateKey, isValidDateKey } from "@/shared/utils/dateFormat";

type SelectedDateState = {
  selectedDateKey: string;
  actions: {
    setSelectedDate: (date: Date) => void;
    setSelectedDateKey: (dateKey: string) => void;
    resetSelectedDate: () => void;
  };
};

const getTodayDateKey = () => getTodayFormatDateKey();

const useSelectedDateStore = create<SelectedDateState>((set) => ({
  selectedDateKey: getTodayDateKey(),
  actions: {
    setSelectedDate: (date) => set({ selectedDateKey: formatDateKey(date) }),
    setSelectedDateKey: (dateKey) =>
      set({ selectedDateKey: isValidDateKey(dateKey) ? dateKey : getTodayDateKey() }),
    resetSelectedDate: () => set({ selectedDateKey: getTodayDateKey() }),
  },
}));

export const useSelectedDateKey = () => useSelectedDateStore((state) => state.selectedDateKey);
export const useSetSelectedDate = () =>
  useSelectedDateStore((state) => state.actions.setSelectedDate);
export const useSetSelectedDateKey = () =>
  useSelectedDateStore((state) => state.actions.setSelectedDateKey);
export const useResetSelectedDate = () =>
  useSelectedDateStore((state) => state.actions.resetSelectedDate);
