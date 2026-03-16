import { postRegisterUserInfo } from "@/features/onboarding/api/registerUserInfo";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";
import { useMutation } from "@tanstack/react-query";

export function useRegisterUserInfoMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: postRegisterUserInfo,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
