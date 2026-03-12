// axios 인스턴스 생성
import {
  clearTokens,
  loadAccessToken,
  loadRefreshToken,
  saveTokens,
} from "@/features/auth/store/tokenStore";
import { Tokens } from "@/features/auth/types";
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await loadAccessToken();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

async function reissueTokens(): Promise<Tokens> {
  const refreshToken = await loadRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(`${BASE_URL}/${"reissueRefreshTokenRequest"}`, {
    refreshToken,
  });

  if (!response.data.accessToken || !response.data.refreshToken) {
    throw new Error("토큰 발급 실패: 응답에 accessToken 또는 refreshToken이 없습니다.");
  }

  await saveTokens({
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  });

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  };
}

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

let tokenRefreshPromise: Promise<Tokens> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest) throw error;

    const status = error.response?.status;

    if (status !== 401) throw error;

    if (originalRequest.url?.includes(`${"reissueRefreshTokenRequest"}`)) {
      await clearTokens();
      throw new Error("refresh token 재발급 요청 인증 실패", { cause: error });
    }

    if (originalRequest._retry) {
      await clearTokens();
      throw new Error("원래 요청을 새 토큰으로 다시 보냈지만 401 발생", { cause: error });
    }

    originalRequest._retry = true; // 재시도 플래그 설정

    try {
      if (!tokenRefreshPromise) {
        tokenRefreshPromise = reissueTokens().finally(() => {
          tokenRefreshPromise = null;
        });
      }

      const newTokens = await tokenRefreshPromise!;

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

      return apiClient.request(originalRequest);
    } catch (refreshErr) {
      // TODO refresh 실패 -> 토큰 제거 + (여기서 라우팅/로그아웃 처리 트리거)
      await clearTokens();
      throw refreshErr;
    }
  },
);
