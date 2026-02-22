import { getLoginWebViewConfigError } from "@/features/auth/config";
import { createKakaoAuthorizeUrl, parseKakaoRedirectUrl } from "@/features/auth/oauth";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { Button, View, Text } from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";

export default function KakaoLogin() {
  const configError = useMemo(() => getLoginWebViewConfigError(), []);
  const kakaoAuthUrl = useMemo(() => createKakaoAuthorizeUrl(), []);

  const onShouldStartLoadWithRequest = useCallback((request: WebViewNavigation) => {
    // WebView가 로드하려는 URL이 카카오 로그인 리다이렉트 URI로 시작하는지 확인
    const redirectResult = parseKakaoRedirectUrl(request.url);
    // 리다이렉트 URI로 시작하지 않는다면 로그인 과정과 무관한 URL이므로 WebView가 계속 로드하도록 허용
    if (!redirectResult) {
      return true;
    }
    // 리다이렉트 URI로 시작하는 경우, URL에서 인가 코드 또는 에러 메시지를 추출하여 로그인 플로우 훅에 전달
    if (redirectResult.type === "code") {
      console.log("Kakao authorization code:", redirectResult.code);
      router.replace({
        pathname: "/",
        params: { authCode: redirectResult.code },
      });
    } else {
      router.replace({
        pathname: "/",
        params: { authError: redirectResult.error },
      });
    }
    // WebView가 해당 URL을 로드하지 않도록 false 반환
    return false;
  }, []);

  if (!kakaoAuthUrl || configError) {
    return (
      <View>
        <Text>{configError ?? "로그인 URL 생성에 실패했습니다."}</Text>
        <Button title="뒤로 가기" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View>
      <WebView
        source={{ uri: kakaoAuthUrl }}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
      />
    </View>
  );
}
