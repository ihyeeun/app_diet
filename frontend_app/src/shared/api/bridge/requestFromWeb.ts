import { apiClient } from "@/src/shared/api/apiClient";
import { isAxiosError } from "axios";
import type { BridgeRequestPayload } from "./bridge.types";

export async function requestFromWeb(payload: BridgeRequestPayload) {
  const { endpoint, method, body, params } = payload;

  try {
    const response = await apiClient.request({
      url: endpoint,
      method,
      params,
      data: body,
    });

    return response.data;
  } catch (error) {
    throw error;
    //TODO 여기에 서버 에러 메세지를 반환하도록 하고 싶긴 한데..!
  }
}
