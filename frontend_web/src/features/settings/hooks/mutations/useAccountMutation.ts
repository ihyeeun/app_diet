import { useMutation } from "@tanstack/react-query";

import { logout, withdraw } from "@/features/settings/api/account";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useLogoutMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}

export function useWithdrawMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: withdraw,
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
