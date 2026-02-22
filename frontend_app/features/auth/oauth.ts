import { kakaoRedirectUri, kakaoRestApiKey } from "./config";
import type { KakaoRedirectResult } from "./types";

export function createKakaoAuthorizeUrl(): string | null {
  if (!kakaoRestApiKey || !kakaoRedirectUri) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: kakaoRestApiKey,
    redirect_uri: kakaoRedirectUri,
    response_type: "code",
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}

export function parseKakaoRedirectUrl(url: string): KakaoRedirectResult | null {
  if (!kakaoRedirectUri || !url.startsWith(kakaoRedirectUri)) {
    return null;
  }

  const parsedUrl = new URL(url);
  const code = parsedUrl.searchParams.get("code");

  if (code) {
    return { type: "code", code };
  }

  const error =
    parsedUrl.searchParams.get("error_description") ??
    parsedUrl.searchParams.get("error") ??
    "인가 코드를 받지 못했습니다.";

  return { type: "error", error };
}
