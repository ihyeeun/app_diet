import { apiClient } from "@/src/shared/api/apiClient";
import type { BridgeRequestPayload } from "./bridge.types";

function assertAllowedBridgeRequest(endpoint: string, method: BridgeRequestPayload["method"]) {
  if (!endpoint.startsWith("/") || endpoint.startsWith("//")) {
    throw new Error("브리지 요청은 앱 내부 상대 경로만 허용합니다.");
  }
}

export async function requestFromWeb(payload: BridgeRequestPayload) {
  const { endpoint, method, body, params } = payload;

  assertAllowedBridgeRequest(endpoint, method);

  const response = await apiClient.request({
    url: endpoint,
    method,
    params,
    data: body,
  });

  return response.data;
}
