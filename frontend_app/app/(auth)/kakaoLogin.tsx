import { parseKakaoRedirectUrl } from "@/features/auth/hooks/parseKakaoCode";
import { router } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";

const restApiKey = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
const redirectUri = process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI;

export default function KakaoLogin() {
  const onShouldStartLoadWithRequest = useCallback((request: WebViewNavigation) => {
    // WebView가 로드하려는 URL이 카카오 로그인 리다이렉트 URI로 시작하는지 확인
    const redirectResult = parseKakaoRedirectUrl(request.url, redirectUri);
    // 리다이렉트 URI로 시작하지 않는다면 로그인 과정과 무관한 URL이므로 WebView가 계속 로드하도록 허용
    if (!redirectResult) {
      return true;
    }
    // 리다이렉트 URI로 시작하는 경우, URL에서 인가 코드 또는 에러 메시지를 추출하여 로그인 플로우 훅에 전달
    if (redirectResult.type === "code") {
      console.log("Kakao authorization code:", redirectResult.code);
      router.replace({
        pathname: "/(tabs)/home",
        params: { authCode: redirectResult.code },
      });
    } else {
      router.replace({
        pathname: "/(auth)/login",
        params: { authError: redirectResult.error },
      });
    }
    // WebView가 해당 URL을 로드하지 않도록 false 반환
    return false;

    //TODO(KAKAO) : 토큰을 받아오기 위해 추후 code를 포함한 api 요청 호출하는 로직이 추가 될 예정.
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
