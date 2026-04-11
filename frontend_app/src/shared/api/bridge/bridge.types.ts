export type BridgeHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type BridgeTabName = "home" | "chat" | "diary" | "profile";

export type BridgeRequestPayload = {
  endpoint: string;
  method: BridgeHttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
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

export type BridgeNavigationBackMessage = {
  id: string;
  type: "NAVIGATION_BACK";
};

export type BridgeCameraCaptureRequestPayload = {
  quality?: number;
  mode?: "NUTRITION_LABEL" | "MENU_BOARD" | "FOOD" | "GENERAL";
};

export type BridgeCameraCaptureRequestMessage = {
  id: string;
  type: "CAMERA_CAPTURE_REQUEST";
  payload?: BridgeCameraCaptureRequestPayload;
};

export type BridgeGalleryPickRequestPayload = {
  quality?: number;
};

export type BridgeGalleryPickRequestMessage = {
  id: string;
  type: "GALLERY_PICK_REQUEST";
  payload?: BridgeGalleryPickRequestPayload;
};

export type BridgeImageUploadRequestPayload = {
  endpoint: string;
  fileUri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fieldName?: string;
  method?: "POST" | "PUT";
  body?: Record<string, string | number | boolean | undefined>;
  params?: Record<string, string | number | boolean | undefined>;
};

export type BridgeImageUploadRequestMessage = {
  id: string;
  type: "IMAGE_UPLOAD_REQUEST";
  payload: BridgeImageUploadRequestPayload;
};

export type WebToAppMessage =
  | BridgeApiRequestMessage
  | BridgeTabSyncMessage
  | BridgeNavigationBackMessage
  | BridgeCameraCaptureRequestMessage
  | BridgeGalleryPickRequestMessage
  | BridgeImageUploadRequestMessage;

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
