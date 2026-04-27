import axios from "axios";
import { saveTokens } from "@/features/auth/store/tokenStore";
import { apiClient } from "@/src/shared/api/apiClient";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export type AdminSignInRequest = {
  adminId: string;
  email: string;
};

export type AdminSignInUser = {
  id: number;
  nickname: string;
  email: string;
  platform: string;
  role: string;
};

export type AdminSignInResult = {
  accessToken: string;
  refreshToken: string;
  user?: AdminSignInUser;
};

type AdminSignInApiResponse = {
  data?: AdminSignInResult;
} & Partial<AdminSignInResult>;

export async function exchangeKakaoCodeForToken(code: string) {
  const res = await axios.post(`${BASE_URL}/userAuth/kakao/callback`, null, {
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

export async function signInAdmin(payload: AdminSignInRequest): Promise<AdminSignInResult> {
  const response = await axios.post<AdminSignInApiResponse>(`${BASE_URL}/adminAuth/signin`, payload, {
    headers: {
      Accept: "application/json",
    },
  });

  const tokenData = response.data.data ?? response.data;

  if (!tokenData.accessToken || !tokenData.refreshToken) {
    throw new Error("관리자 로그인 실패: 응답에 accessToken 또는 refreshToken이 없습니다.");
  }

  return {
    accessToken: tokenData.accessToken,
    refreshToken: tokenData.refreshToken,
    user: tokenData.user,
  };
}

export async function signOut(refreshToken: string) {
  const response = await apiClient.post("/commonAuth/signout", {
    refreshToken,
  });

  return response.data;
}
