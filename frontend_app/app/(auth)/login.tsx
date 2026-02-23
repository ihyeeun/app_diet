import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useKakaoAuthFlow } from "@/features/auth/hooks/useKakaoAuthFlow";
import { KakaoLoginButton } from "@/features/auth/components/KakaoLoginButton";
import { AppleLoginButton } from "@/features/auth/components/AppleLoginButton";

export default function LoginPage() {
  const { authError, isExchangingCode, session, startKakaoLogin } = useKakaoAuthFlow();

  const startAppleLogin = React.useCallback(() => {
    Alert.alert("안내", "애플 로그인 연동은 준비 중입니다.");
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.socialButtonGroup}>
        <KakaoLoginButton onPress={startKakaoLogin} />
        <AppleLoginButton onPress={startAppleLogin} />
      </View>

      {!!isExchangingCode && <Text style={styles.infoText}>code를 토큰으로 교환 중입니다...</Text>}
      {!!authError && <Text style={styles.errorText}>error: {authError}</Text>}
      {!!session?.accessToken && (
        <Text style={styles.successText}>로그인 완료 (access token 수신)</Text>
      )}
      {!!session?.refreshToken && (
        <Text style={styles.infoText}>refresh token도 수신되었습니다.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  socialButtonGroup: {
    gap: 12,
    alignItems: "center",
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
