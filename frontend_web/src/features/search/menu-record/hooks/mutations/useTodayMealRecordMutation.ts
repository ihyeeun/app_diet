import { useMutation } from "@tanstack/react-query";

import { postTodayMealRecordRegister } from "@/features/search/menu-record/api/todayMealRecord";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useTodayMealRecordRegisterMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: postTodayMealRecordRegister,
    onSuccess: () => {
      callbacks?.onSuccess?.();
      // TODO 여기에 반영해야할 거 같은데
      // queryClient.invalidateQueries({ queryKey: queryKeys.dayMeals(dateKey) });
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
