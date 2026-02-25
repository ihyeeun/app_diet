import { exchangeKakaoCodeForToken } from "@/features/auth/api/authTokenApi";
import { parseKakaoRedirectUrl } from "@/features/auth/hooks/parseKakaoCode";
import { router } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";

const restApiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;

export default function KakaoLogin() {
  const onShouldStartLoadWithRequest = useCallback((request: WebViewNavigation) => {
    const redirectResult = parseKakaoRedirectUrl(request.url, redirectUri);
    if (!redirectResult) return true;
    if (redirectResult.type === "code") {
      console.log("Kakao authorization code:", redirectResult.code);
      // TODO(Auth) : 추후 활성화 exchangeKakaoCodeForToken(redirectResult.code);
      router.replace({
        pathname: "/(tabs)/home",
      });
    } else {
      console.error("Kakao login error:", redirectResult.error);
    }
    // WebView가 해당 URL을 로드하지 않도록 false 반환
    return false;
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{
          uri: `https://kauth.kakao.com/oauth/authorize?client_id=${restApiKey}&redirect_uri=${redirectUri}&response_type=code`,
        }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    </View>
  );
}
