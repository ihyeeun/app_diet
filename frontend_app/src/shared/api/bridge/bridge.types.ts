export type BridgeHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type BridgeTabName = "home" | "recommend" | "compare" | "profile";

export type BridgeRequestPayload = {
  endpoint: string;
  method: BridgeHttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
};

export type BridgePingPayload = {
  sentAt: number;
};

export type BridgeApiRequestMessage = {
  id: string;
  type: "API_REQUEST";
  payload: BridgeRequestPayload;
};

export type BridgeTabSyncMessage = {
  id: string;
  type: "TAB_SYNC";
  payload: {
    tab: BridgeTabName;
  };
};

export type WebToAppMessage = BridgeApiRequestMessage | BridgeTabSyncMessage;

export type BridgeErrorPayload = {
  message: string;
  statusCode: number;
  error: string;
};

export type AppToWebMessage<T = unknown> =
  | {
      id: string;
      type: "API_RESPONSE";
      payload: T;
    }
  | {
      id: string;
      type: "API_ERROR";
      payload: BridgeErrorPayload;
    };
