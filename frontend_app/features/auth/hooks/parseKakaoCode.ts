type KakaoRedirectResult = { type: "code"; code: string } | { type: "error"; error: string };

export function parseKakaoRedirectUrl(
  url: string,
  redirectUri?: string,
): KakaoRedirectResult | null {
  if (!redirectUri) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const parsedRedirectUri = new URL(redirectUri);

    const isKakaoCallback =
      parsedUrl.origin === parsedRedirectUri.origin &&
      parsedUrl.pathname === parsedRedirectUri.pathname;

    if (!isKakaoCallback) {
      return null;
    }

    const code = parsedUrl.searchParams.get("code");
    if (code) {
      return { type: "code", code };
    }

    const error =
      parsedUrl.searchParams.get("error_description") ??
      parsedUrl.searchParams.get("error") ??
      "인가 코드를 받지 못했습니다.";

    return { type: "error", error };
  } catch {
    return null;
  }
}
