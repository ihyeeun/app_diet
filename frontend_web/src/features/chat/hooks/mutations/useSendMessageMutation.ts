import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendMessage } from "@/features/chat/api/chat.api";
import { appendMissingChatHistoryItemsToCache } from "@/features/chat/hooks/queries/chatHistoryCache";
import { isChatHistoryItemResponse } from "@/features/chat/utils/chatHistoryItem";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useSendMessageMutation(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (response) => {
      if (isChatHistoryItemResponse(response)) {
        appendMissingChatHistoryItemsToCache(queryClient, [response]);
      }

      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
