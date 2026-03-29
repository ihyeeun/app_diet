import { useMutation } from "@tanstack/react-query";

import { postTodayMealRecordRegister } from "@/features/search/menu-record/api/todayMealRecord";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useTodayMealRecordRegisterMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: postTodayMealRecordRegister,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
