import { useQuery } from "@tanstack/react-query";

import { getChatHistory } from "@/features/chat/api/chat.api";
import { queryKeys } from "@/features/chat/hooks/queries/queryKey";

export function useGetChatHistoryQuery() {
  return useQuery({
    queryKey: queryKeys.chatHistory,
    queryFn: getChatHistory,
    staleTime: Infinity,
  });
}
