import type { QueryClient } from "@tanstack/react-query";

import { getChatHistory } from "@/features/chat/api/chat.api";
import { queryKeys } from "@/features/chat/hooks/queries/queryKey";
import type {
  ChatHistoryItemResponseDto,
  ChatHistoryResponseDto,
} from "@/shared/api/types/api.dto";

type ResolveChatHistoryItemOptions = {
  match?: (chatItem: ChatHistoryItemResponseDto) => boolean;
};

export class ChatHistorySyncError extends Error {
  constructor() {
    super("답변 저장을 확인하지 못했어요. 잠시 후 다시 확인해주세요.");
    this.name = "ChatHistorySyncError";
  }
}

export function appendMissingChatHistoryItemsToCache(
  queryClient: QueryClient,
  incomingItems: ChatHistoryItemResponseDto[],
): ChatHistoryItemResponseDto[] {
  if (incomingItems.length === 0) {
    return [];
  }

  let appendedChatList: ChatHistoryItemResponseDto[] = [];

  queryClient.setQueryData<ChatHistoryResponseDto>(queryKeys.chatHistory, (previous) => {
    if (!previous) {
      appendedChatList = [...incomingItems];

      return {
        chat_list: [...incomingItems],
      };
    }

    const previousItemIds = new Set(previous.chat_list.map((item) => item.id));
    appendedChatList = incomingItems.filter((item) => !previousItemIds.has(item.id));

    if (appendedChatList.length === 0) {
      return previous;
    }

    return {
      ...previous,
      chat_list: [...previous.chat_list, ...appendedChatList],
    };
  });

  return appendedChatList;
}

export function mergeChatHistoryResponseIntoCache(
  queryClient: QueryClient,
  chatHistory: ChatHistoryResponseDto,
) {
  return appendMissingChatHistoryItemsToCache(queryClient, chatHistory.chat_list);
}

export async function refetchAndMergeChatHistoryIntoCache(queryClient: QueryClient) {
  try {
    const chatHistory = await getChatHistory();
    return mergeChatHistoryResponseIntoCache(queryClient, chatHistory);
  } catch (error) {
    throw new Error("결과를 불러오지 못했어요. 다시 시도해주세요.", { cause: error });
  }
}

export async function refetchAndResolveChatHistoryItem(
  queryClient: QueryClient,
  options?: ResolveChatHistoryItemOptions,
) {
  const appendedChatItems = await refetchAndMergeChatHistoryIntoCache(queryClient);
  const matchedChatItems =
    options?.match === undefined ? appendedChatItems : appendedChatItems.filter(options.match);
  const chatItem = matchedChatItems.at(-1);

  if (!chatItem) {
    throw new ChatHistorySyncError();
  }

  return chatItem;
}
