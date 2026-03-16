import axios from "axios";
import { saveTokens } from "@/features/auth/store/tokenStore";
import { apiClient } from "@/src/shared/api/apiClient";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function exchangeKakaoCodeForToken(code: string) {
  const res = await axios.post("https://melo.ai.kr/userAuth/kakao/callback", null, {
    params: { code },
    headers: {
      Accept: "application/json",
    },
  });

  const tokenData = res.data.data;

  await saveTokens({
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken,
  });

  return;
}

export async function signOut(refreshToken: string) {
  const response = await apiClient.post(`${BASE_URL}/commonAuth/signout`, {
    refreshToken,
  });

  return response.data;
}
