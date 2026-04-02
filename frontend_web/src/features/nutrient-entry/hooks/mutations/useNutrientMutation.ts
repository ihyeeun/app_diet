import { useMutation } from "@tanstack/react-query";

import { modifyNutrient, registerMenu } from "@/features/nutrient-entry/api/nutrient";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useRegisterMenuMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: registerMenu,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}

export function useModifyNutrientMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: modifyNutrient,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
