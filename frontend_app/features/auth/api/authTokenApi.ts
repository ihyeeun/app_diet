// Token 교환 API

import { saveTokens } from "@/features/auth/store/tokenStore";
import { apiClient } from "@/src/shared/api/apiClient";

export async function exchangeKakaoCodeForToken(code: string) {
  // body에 code를 담아서 요청.
  // TODO(Auth) kakao login endpoint 확인 필요
  const response = await apiClient.post("", { code });

  saveTokens({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });
}
