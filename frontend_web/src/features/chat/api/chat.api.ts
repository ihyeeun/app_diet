import { appApiData } from "@/shared/api/appApi";
import type { ChatHistoryResponseDto } from "@/shared/api/types/api.dto";

export async function getChatHistory() {
  const response = await appApiData<ChatHistoryResponseDto>({
    endpoint: "/chat/history",
    method: "GET",
  });

  return response;
}

export async function sendMessage({ input }: { input: string }) {
  const response = await appApiData({
    endpoint: "/chat/recommend",
    method: "POST",
    body: { input },
  });
  return response;
}
