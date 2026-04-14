import { useMutation } from "@tanstack/react-query";

import {
  uploadCapturedImageToServer,
  uploadNutritionLabelImage,
} from "@/features/camera/api/uploadCapturedImage";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useFoodImageMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: uploadCapturedImageToServer,
    onSuccess: () => {
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
    },
    onError: (error) => {
      if (callbacks?.onError) {
        callbacks.onError(error);
      }
    },
  });
}

export function useNutritionLabelMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: uploadNutritionLabelImage,
    onSuccess: () => {
      if (callbacks?.onSuccess) {
        callbacks.onSuccess();
      }
    },
    onError: (error) => {
      if (callbacks?.onError) {
        callbacks.onError(error);
      }
    },
  });
}
