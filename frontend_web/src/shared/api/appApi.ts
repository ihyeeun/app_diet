import { isNativeApp, requestToApp } from "@/shared/api/bridge/nativeBridge";
import {
  type ApiFailResponse,
  type ApiResponse,
  isApiSuccess,
} from "@/shared/api/types/apiResponse.types";

export type RequestOptions = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
};

export async function appApi<T>(options: RequestOptions): Promise<ApiResponse<T>> {
  if (!isNativeApp()) {
    throw new Error("앱 WebView 환경에서만 API 요청이 가능합니다.");
  }

  const response = await requestToApp<ApiResponse<T>>(options);
  return response;
}

export class AppApiError extends Error {
  statusCode: number;
  error: string;

  constructor(payload: ApiFailResponse) {
    super(payload.message);
    this.name = "AppApiError";
    this.statusCode = payload.statusCode;
    this.error = payload.error;
  }
}

export async function appApiData<T>(options: RequestOptions): Promise<T> {
  const response = await appApi<T>(options);

  if (!isApiSuccess(response)) {
    throw new AppApiError(response);
  }

  return response.data;
}
