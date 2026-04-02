import type { ApiResponse } from "@/shared/api/types/apiResponse.types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type AppTabName = "home" | "recommend" | "profile";

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

export type CameraCaptureRequestPayload = {
  quality?: number;
};

export type WebToAppCameraCaptureMessage = {
  id: string;
  type: "CAMERA_CAPTURE_REQUEST";
  payload?: CameraCaptureRequestPayload;
};

export type GalleryPickRequestPayload = {
  quality?: number;
};

export type WebToAppGalleryPickMessage = {
  id: string;
  type: "GALLERY_PICK_REQUEST";
  payload?: GalleryPickRequestPayload;
};

export type ImageUploadRequestPayload = {
  endpoint: string;
  fileUri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fieldName?: string;
  method?: "POST" | "PUT";
  body?: Record<string, string | number | boolean | undefined>;
  params?: Record<string, string | number | boolean | undefined>;
};

export type WebToAppImageUploadMessage = {
  id: string;
  type: "IMAGE_UPLOAD_REQUEST";
  payload: ImageUploadRequestPayload;
};

export type WebToAppMessage =
  | WebToAppApiRequestMessage
  | WebToAppTabSyncMessage
  | WebToAppCameraCaptureMessage
  | WebToAppGalleryPickMessage
  | WebToAppImageUploadMessage;

export type CameraCaptureResponsePayload = {
  uri: string;
  width: number;
  height: number;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  base64: string | null;
};

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
