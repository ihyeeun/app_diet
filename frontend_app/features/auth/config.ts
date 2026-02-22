export const kakaoRestApiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
export const kakaoRedirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;
export const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

function toConfigErrorMessage(keys: string[]) {
  return `${keys.join(" / ")} 값을 확인해주세요.`;
}

export function getLoginStartConfigError(): string | null {
  const missingKeys: string[] = [];

  if (!kakaoRestApiKey) {
    missingKeys.push("EXPO_PUBLIC_KAKAO_REST_API_KEY");
  }
  if (!kakaoRedirectUri) {
    missingKeys.push("EXPO_PUBLIC_KAKAO_REDIRECT_URI");
  }
  if (!apiBaseUrl) {
    missingKeys.push("EXPO_PUBLIC_API_BASE_URL");
  }

  if (missingKeys.length === 0) {
    return null;
  }
  return toConfigErrorMessage(missingKeys);
}

export function getLoginWebViewConfigError(): string | null {
  const missingKeys: string[] = [];

  if (!kakaoRestApiKey) {
    missingKeys.push("EXPO_PUBLIC_KAKAO_REST_API_KEY");
  }
  if (!kakaoRedirectUri) {
    missingKeys.push("EXPO_PUBLIC_KAKAO_REDIRECT_URI");
  }

  if (missingKeys.length === 0) {
    return null;
  }
  return toConfigErrorMessage(missingKeys);
}

export function getKakaoCallbackApiUrl(): string | null {
  if (!apiBaseUrl) {
    return null;
  }
  const trimmedBaseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
  return `${trimmedBaseUrl}/auth/kakao/callback`;
}
