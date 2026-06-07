import type { QueryClient } from "@tanstack/react-query";

import { getChatHistory } from "@/features/chat/api/chat.api";
import { queryKeys } from "@/features/chat/hooks/queries/queryKey";
import type {
  ChatHistoryItemResponseDto,
  ChatHistoryResponseDto,
} from "@/shared/api/types/api.dto";

export function appendMissingChatHistoryItemsToCache(
  queryClient: QueryClient,
  incomingItems: ChatHistoryItemResponseDto[],
) {
  if (incomingItems.length === 0) {
    return;
  }

  queryClient.setQueryData<ChatHistoryResponseDto>(queryKeys.chatHistory, (previous) => {
    if (!previous) {
      return {
        chat_list: [...incomingItems],
      };
    }

    const previousItemIds = new Set(previous.chat_list.map((item) => item.id));
    const appendedChatList = incomingItems.filter((item) => !previousItemIds.has(item.id));

    if (appendedChatList.length === 0) {
      return previous;
    }

    return {
      ...previous,
      chat_list: [...previous.chat_list, ...appendedChatList],
    };
  });
}

export function mergeChatHistoryResponseIntoCache(
  queryClient: QueryClient,
  chatHistory: ChatHistoryResponseDto,
) {
  appendMissingChatHistoryItemsToCache(queryClient, chatHistory.chat_list);
}

export async function refetchAndMergeChatHistoryIntoCache(queryClient: QueryClient) {
  try {
    const chatHistory = await getChatHistory();
    mergeChatHistoryResponseIntoCache(queryClient, chatHistory);
  } catch (error) {
    console.error("[ChatHistory] failed to refetch and merge chat history", error);
  }
}
