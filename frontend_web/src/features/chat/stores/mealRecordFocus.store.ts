import { create } from "zustand";

import type { MealTime } from "@/shared/api/types/api.dto";

type ChatMealRecordFocusRequest = {
  id: number;
  dateKey: string;
  mealTime: MealTime;
};

type ChatMealRecordFocusStoreState = {
  focusRequest: ChatMealRecordFocusRequest | null;
  nextFocusRequestId: number;
  requestFocus: (request: Omit<ChatMealRecordFocusRequest, "id">) => void;
  clearFocusRequest: (requestId: number) => void;
};

const useChatMealRecordFocusStore = create<ChatMealRecordFocusStoreState>((set) => ({
  focusRequest: null,
  nextFocusRequestId: 0,
  requestFocus: (request) => {
    set((state) => {
      const nextFocusRequestId = state.nextFocusRequestId + 1;

      return {
        nextFocusRequestId,
        focusRequest: {
          ...request,
          id: nextFocusRequestId,
        },
      };
    });
  },
  clearFocusRequest: (requestId) => {
    set((state) => ({
      focusRequest: state.focusRequest?.id === requestId ? null : state.focusRequest,
    }));
  },
}));

export const useChatMealRecordFocusRequest = () =>
  useChatMealRecordFocusStore((state) => state.focusRequest);

export const useRequestChatMealRecordFocus = () =>
  useChatMealRecordFocusStore((state) => state.requestFocus);

export const useClearChatMealRecordFocusRequest = () =>
  useChatMealRecordFocusStore((state) => state.clearFocusRequest);
