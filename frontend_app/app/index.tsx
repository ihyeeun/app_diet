import { initializeKakaoSDK } from "@react-native-kakao/core";
import { login, logout, unlink } from "@react-native-kakao/user";
import { useEffect } from "react";
import { Button, Text, View } from "react-native";

const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;

export default function Index() {
  // 카카오 SDK 초기화
  useEffect(() => {
    // getKeyHashAndroid().then(console.log);
    if (!kakaoNativeAppKey) {
      console.error("Missing EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY");
      return;
    }
    initializeKakaoSDK(kakaoNativeAppKey);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* 로그인 */}
      <Button
        title={"kakao Login"}
        onPress={() => login().then(console.log).catch(console.error)}
      />
      {/* 로그아웃 */}
      <Button
        title={"kakao Logout"}
        onPress={() => logout().then(console.log).catch(console.error)}
      />
      {/* 탈퇴 */}
      <Button
        title={"kakao Unlink"}
        onPress={() => unlink().then(console.log).catch(console.error)}
      />
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
