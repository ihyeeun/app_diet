import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { getLoginStartConfigError } from "../config";
import { exchangeKakaoCodeForSession } from "../service";
import type { LoginSession } from "../types";

export function useKakaoAuthFlow() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    authCode?: string;
    authError?: string;
  }>();

  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isExchangingCode, setIsExchangingCode] = useState(false);
  const [session, setSession] = useState<LoginSession | null>(null);

  useEffect(() => {
    if (typeof params.authCode === "string" && params.authCode.length > 0) {
      setPendingCode(params.authCode);
      setAuthError(null);
      router.replace("/login");
      return;
    }

    if (typeof params.authError === "string" && params.authError.length > 0) {
      setAuthError(params.authError);
      setPendingCode(null);
      router.replace("/login");
    }
  }, [params.authCode, params.authError, router]);

  useEffect(() => {
    if (!pendingCode) {
      return;
    }

    let isCancelled = false;

    const exchangeCode = async () => {
      setIsExchangingCode(true);
      setAuthError(null);

      try {
        const loginSession = await exchangeKakaoCodeForSession(pendingCode);
        if (isCancelled) {
          return;
        }
        setSession(loginSession);
      } catch (error) {
        if (isCancelled) {
          return;
        }
        setSession(null);
        setAuthError(
          error instanceof Error
            ? error.message
            : "로그인 처리 중 오류가 발생했습니다."
        );
      } finally {
        if (!isCancelled) {
          setIsExchangingCode(false);
          setPendingCode(null);
        }
      }
    };

    exchangeCode().catch(() => {
      // handled in try/catch
    });

    return () => {
      isCancelled = true;
    };
  }, [pendingCode]);

  const startKakaoLogin = useCallback(() => {
    const configError = getLoginStartConfigError();
    if (configError) {
      setAuthError(configError);
      return;
    }

    setAuthError(null);
    setPendingCode(null);
    router.push("/kakaoLogin");
  }, [router]);

  const clearSession = useCallback(() => {
    setSession(null);
    setPendingCode(null);
    setAuthError(null);
  }, []);

  return {
    authError,
    isExchangingCode,
    session,
    startKakaoLogin,
    clearSession,
  };
}
