import { apiClient } from "@/src/shared/api/apiClient";
import type { BridgeRequestPayload } from "./bridge.types";

export async function requestFromWeb(payload: BridgeRequestPayload) {
  const { endpoint, method, body, params } = payload;

  const response = await apiClient.request({
    url: endpoint,
    method,
    params,
    data: body,
  });

  return response.data;
}
