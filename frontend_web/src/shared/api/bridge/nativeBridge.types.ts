import type { ApiResponse } from "@/shared/api/types/api.types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type AppTabName = "home" | "recommend" | "compare" | "profile";

export type ApiRequestPayload = {
  endpoint: string;
  method: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
};

export type WebToAppApiRequestMessage = {
  id: string;
  type: "API_REQUEST";
  payload: ApiRequestPayload;
};

export type WebToAppTabSyncMessage = {
  id: string;
  type: "TAB_SYNC";
  payload: {
    tab: AppTabName;
  };
};

export type WebToAppMessage = WebToAppApiRequestMessage | WebToAppTabSyncMessage;

export type AppToWebMessage<T = unknown> = {
  id: string;
  type: "API_RESPONSE" | "API_ERROR";
  payload:
    | ApiResponse<T>
    | {
        message: string;
        statusCode: number;
        error: string;
      };
};

export type BridgePingResponse = {
  ok: boolean;
  receivedAt: string;
  sentAt: number;
};
