import React from "react";
import { Alert, StyleSheet, Text, View, Pressable } from "react-native";
import { KakaoLoginButton } from "@/features/auth/components/KakaoLoginButton";
import { AppleLoginButton } from "@/features/auth/components/AppleLoginButton";
import { router } from "expo-router";

export default function LoginPage() {
  const startAppleLogin = React.useCallback(() => {
    Alert.alert("안내", "애플 로그인 연동은 준비 중입니다.");
  }, []);

  const openTermsPage = React.useCallback(() => {
    router.push("/(auth)/terms");
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.socialButtonGroup}>
          <KakaoLoginButton onPress={() => router.push("/kakaoLogin")} />
          <AppleLoginButton onPress={startAppleLogin} />
        </View>

        <Text style={styles.agreementText}>
          가입하면 Melo의{"\n"}
          <Text
            style={styles.linkText}
            onPress={openTermsPage}
            accessible={true}
            accessibilityRole="link"
            accessibilityLabel="이용약관 및 개인정보 처리방침"
          >
            이용약관 및 개인정보 처리방침
          </Text>
          에 동의하게 됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 56,
    backgroundColor: "#ffffff",
  },
  content: {
    width: "100%",
    alignItems: "center",
    gap: 20,
  },
  socialButtonGroup: {
    gap: 12,
    alignItems: "center",
    width: "100%",
  },
  agreementText: {
    color: "#666666",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#4a4a4a",
  },
});
