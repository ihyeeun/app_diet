import { useMutation } from "@tanstack/react-query";

import { uploadCapturedImageToServer } from "@/features/camera/api/uploadCapturedImage";
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
