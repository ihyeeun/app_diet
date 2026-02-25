// Token 교환 API

import { apiClient } from "@/src/shared/api/apiClient";

export async function exchangeKakaoCodeForToken(code: string) {
  // body에 code를 담아서 요청.
  // TODO(Auth) kakao login endpoint 확인 필요
  const response = await apiClient.post("", { code });
  return response.data;
}

// TODO(Auth) refresh token 발급하는 것도 추가
