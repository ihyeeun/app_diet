import { useMutation } from "@tanstack/react-query";

import { registerInquiry } from "@/features/settings/api/inquiry";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useRegisterInquiryMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: registerInquiry,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
