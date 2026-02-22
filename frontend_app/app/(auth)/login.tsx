import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { useKakaoAuthFlow } from "@/features/auth/hooks/useKakaoAuthFlow";
import { KakaoLoginButton } from "@/features/auth/components/KakaoLoginButton";

export default function LoginPage() {
  const { authError, isExchangingCode, session, startKakaoLogin, clearSession } =
    useKakaoAuthFlow();

  return (
    <View style={styles.container}>
      <KakaoLoginButton onPress={startKakaoLogin} />

      {!!isExchangingCode && <Text style={styles.infoText}>code를 토큰으로 교환 중입니다...</Text>}
      {!!authError && <Text style={styles.errorText}>error: {authError}</Text>}
      {!!session?.accessToken && (
        <Text style={styles.successText}>로그인 완료 (access token 수신)</Text>
      )}
      {!!session?.refreshToken && (
        <Text style={styles.infoText}>refresh token도 수신되었습니다.</Text>
      )}

      <Button title={"로그인 세션 초기화"} onPress={clearSession} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  successText: {
    color: "#1e7e34",
    fontSize: 12,
  },
  infoText: {
    color: "#0d6efd",
    fontSize: 12,
  },
  errorText: {
    color: "#b02a37",
    fontSize: 12,
  },
});
