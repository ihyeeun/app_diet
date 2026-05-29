import { useMutation } from "@tanstack/react-query";

import { postAuthorizeSubCode } from "@/features/onboarding/api/authorizeSubCode";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useAuthorizeSubCodeMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: postAuthorizeSubCode,
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
