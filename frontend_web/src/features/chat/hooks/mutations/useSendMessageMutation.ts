import { useMutation } from "@tanstack/react-query";

import { sendMessage } from "@/features/chat/api/chat.api";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useSendMessageMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },

    //TODO 변경할때마다 쿼리값 수정 필요
  });
}
