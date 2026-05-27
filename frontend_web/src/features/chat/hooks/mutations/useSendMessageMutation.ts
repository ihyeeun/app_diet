import { useMutation, useQueryClient } from "@tanstack/react-query";

import { sendMessage } from "@/features/chat/api/chat.api";
import { queryKeys } from "@/features/chat/hooks/queries/queryKey";
import type {
  ChatHistoryItemResponseDto,
  ChatHistoryResponseDto,
} from "@/shared/api/types/api.dto";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useSendMessageMutation(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (response) => {
      if (isChatHistoryItemResponse(response)) {
        queryClient.setQueryData<ChatHistoryResponseDto>(queryKeys.chatHistory, (previous) => {
          if (!previous) {
            return {
              chat_list: [response],
            };
          }

          const nextChatList = previous.chat_list.some((item) => item.id === response.id)
            ? previous.chat_list.map((item) => (item.id === response.id ? response : item))
            : [...previous.chat_list, response];

          return {
            ...previous,
            chat_list: nextChatList,
          };
        });
      }

      void queryClient.invalidateQueries({
        queryKey: queryKeys.chatHistory,
        refetchType: "active",
      });

      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}

function isChatHistoryItemResponse(value: unknown): value is ChatHistoryItemResponseDto {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ChatHistoryItemResponseDto>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.input_text === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.response_payload === "object" &&
    candidate.response_payload !== null
  );
}
