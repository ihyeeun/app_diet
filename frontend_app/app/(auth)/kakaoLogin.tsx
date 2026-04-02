import { exchangeKakaoCodeForToken } from "@/features/auth/api/authTokenApi";
import { postHasUserInfo } from "@/features/auth/api/onboardingStatusApi";
import { parseKakaoRedirectUrl } from "@/features/auth/hooks/parseKakaoCode";
import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { WebViewNavigation } from "react-native-webview";

const restApiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;

export default function KakaoLogin() {
  const isExchangingRef = useRef(false);

  const onShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation) => {
      const redirectResult = parseKakaoRedirectUrl(request.url, redirectUri);
      if (!redirectResult) return true;

      if (redirectResult.type === "code") {
        if (isExchangingRef.current) return false;
        isExchangingRef.current = true;

        (async () => {
          try {
            await exchangeKakaoCodeForToken(redirectResult.code);
            const hasUserInfo = await postHasUserInfo();

            if (!hasUserInfo) {
              router.replace("/(auth)/onboarding");
              return;
            }

            router.replace("/(tabs)/home");
          } catch (error) {
            console.error("카카오 로그인 실패");
            isExchangingRef.current = false;
          }
        })();

        return false;
      }

      console.error("Kakao login error:", redirectResult.error);
      return false;
    },
    [redirectUri],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <WebView
        source={{
          uri: `https://kauth.kakao.com/oauth/authorize?client_id=${restApiKey}&redirect_uri=${redirectUri}&response_type=code`,
        }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
