import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KakaoLoginButton } from "@/features/auth/components/KakaoLoginButton";
import { AppleLoginButton } from "@/features/auth/components/AppleLoginButton";
import { router } from "expo-router";

export default function LoginPage() {
  const startAppleLogin = React.useCallback(() => {
    Alert.alert("안내", "애플 로그인 연동은 준비 중입니다.");
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.socialButtonGroup}>
        <KakaoLoginButton onPress={() => router.push("/kakaoLogin")} />
        <AppleLoginButton onPress={startAppleLogin} />
      </View>
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
