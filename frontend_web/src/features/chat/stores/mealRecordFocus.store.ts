import { create } from "zustand";

import type { MealTime } from "@/shared/api/types/api.dto";

type ChatMealRecordFocusRequest = {
  id: number;
  dateKey: string;
  mealTime: MealTime;
};

type ChatMealRecordFocusStoreState = {
  focusRequest: ChatMealRecordFocusRequest | null;
  requestFocus: (request: Omit<ChatMealRecordFocusRequest, "id">) => void;
  clearFocusRequest: (requestId: number) => void;
};

let nextFocusRequestId = 0;

const useChatMealRecordFocusStore = create<ChatMealRecordFocusStoreState>((set) => ({
  focusRequest: null,
  requestFocus: (request) => {
    nextFocusRequestId += 1;
    set({
      focusRequest: {
        ...request,
        id: nextFocusRequestId,
      },
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
