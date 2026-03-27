import { postMealSearch } from "@/features/search/menu-record/api/postMealSearch";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";
import { useMutation } from "@tanstack/react-query";

export function useMealSearchMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: postMealSearch,
    onSuccess: (data) => {
      return data;
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
