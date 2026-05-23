import {
  type ApiFailResponse,
  type ApiResponse,
  isApiSuccess,
} from "@/shared/api/types/apiResponse.types";
import { type AuthTokens, getAccessToken, setAuthTokens } from "@/shared/auth/authSession";

const END_POINT = {
  KAKAO_WEB_LOGIN: "/userAuth/kakao/web",
  KAKAO_WEB_CALLBACK: "/userAuth/kakao/web/callback",
  HAS_USER_INFO: "/userAuth/hasUserInfo",
};

export class KakaoWebAuthApiError extends Error {
  statusCode: number;
  error: string;

  constructor(payload: ApiFailResponse) {
    super(payload.message);
    this.name = "KakaoWebAuthApiError";
    this.statusCode = payload.statusCode;
    this.error = payload.error;
  }
}

export function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  if (import.meta.env.DEV) {
    return "http://localhost:8080";
  }

  throw new Error("VITE_API_BASE_URL이 설정되지 않았습니다.");
}

function appendParams(url: URL, params?: Record<string, string>) {
  if (!params) return;

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error("서버 응답 형식이 올바르지 않습니다.");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("서버 응답을 읽지 못했습니다.");
  }
}

async function kakaoWebAuthData<T>({
  endpoint,
  accessToken,
  params,
}: {
  endpoint: string;
  accessToken?: string | null;
  params?: Record<string, string>;
}) {
  const url = new URL(`${getApiBaseUrl()}${endpoint}`);
  appendParams(url, params);

  const headers = new Headers({
    Accept: "application/json",
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
  });
  const payload = await parseJsonResponse<ApiResponse<T>>(response);

  if (!isApiSuccess(payload)) {
    throw new KakaoWebAuthApiError(payload);
  }

  return payload.data;
}

function normalizeHasUserInfo(value: unknown) {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  if (typeof value === "object" && value !== null) {
    const payload = value as {
      hasUserInfo?: unknown;
      isRegistered?: unknown;
      registered?: unknown;
    };

    if (typeof payload.hasUserInfo === "boolean") return payload.hasUserInfo;
    if (typeof payload.isRegistered === "boolean") return payload.isRegistered;
    if (typeof payload.registered === "boolean") return payload.registered;
  }

  throw new Error("유저 정보 등록 여부 응답 형식이 올바르지 않습니다.");
}

export function redirectToKakaoWebLogin() {
  window.location.assign(`${getApiBaseUrl()}${END_POINT.KAKAO_WEB_LOGIN}`);
}

export async function exchangeKakaoWebCodeForToken(code: string) {
  const tokens = await kakaoWebAuthData<AuthTokens>({
    endpoint: END_POINT.KAKAO_WEB_CALLBACK,
    params: { code },
  });

  setAuthTokens(tokens);
}

export async function postHasUserInfo() {
  const hasUserInfo = await kakaoWebAuthData<unknown>({
    endpoint: END_POINT.HAS_USER_INFO,
    accessToken: getAccessToken(),
  });

  return normalizeHasUserInfo(hasUserInfo);
}
