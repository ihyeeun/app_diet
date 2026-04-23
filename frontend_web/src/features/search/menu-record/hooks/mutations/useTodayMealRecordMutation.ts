import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { postTodayMealRecordRegister } from "@/features/search/menu-record/api/todayMealRecord";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useTodayMealRecordRegisterMutation(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTodayMealRecordRegister,
    onSuccess: (_, variables) => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
      queryClient.invalidateQueries({ queryKey: queryKeys.dayMeals.byDate(variables.date) });
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
