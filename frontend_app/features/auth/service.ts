import { getKakaoCallbackApiUrl } from "./config";
import type { LoginSession } from "./types";

// 이 부분이 code를 서버에 보내서 토큰을 받아오는 로직인거같은데 백엔드 API 명세가 아직 없어서 일단 임시로 작성한 코드입니다. 백엔드 API 명세가 나오면 그에 맞게 수정이 필요할 것 같습니다.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function extractTokens(payload: unknown): LoginSession | null {
  if (!isRecord(payload)) {
    return null;
  }

  const nestedData = isRecord(payload.data) ? payload.data : null;
  const accessToken =
    toStringOrUndefined(payload.accessToken) ??
    toStringOrUndefined(payload.access_token) ??
    (nestedData
      ? (toStringOrUndefined(nestedData.accessToken) ??
        toStringOrUndefined(nestedData.access_token))
      : undefined);

  if (!accessToken) {
    return null;
  }

  const refreshToken =
    toStringOrUndefined(payload.refreshToken) ??
    toStringOrUndefined(payload.refresh_token) ??
    (nestedData
      ? (toStringOrUndefined(nestedData.refreshToken) ??
        toStringOrUndefined(nestedData.refresh_token))
      : undefined);

  return { accessToken, refreshToken };
}

async function readResponsePayload(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

export async function exchangeKakaoCodeForSession(code: string): Promise<LoginSession> {
  const callbackApiUrl = getKakaoCallbackApiUrl();

  if (!callbackApiUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL 값을 확인해주세요.");
  }

  const response = await fetch(`${callbackApiUrl}?code=${encodeURIComponent(code)}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await readResponsePayload(response);
  const tokens = extractTokens(payload);

  if (!response.ok) {
    const errorMessage =
      isRecord(payload) && typeof payload.message === "string"
        ? payload.message
        : "백엔드 인증 API 호출에 실패했습니다.";
    throw new Error(errorMessage);
  }

  if (!tokens) {
    throw new Error("응답에서 accessToken(access_token)을 찾지 못했습니다.");
  }

  return tokens;
}
