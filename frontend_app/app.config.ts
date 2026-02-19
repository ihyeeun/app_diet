import type { ExpoConfig } from "expo/config";

const kakaoNativeAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;

if (!kakaoNativeAppKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY. Set it in frontend_app/.env."
  );
}

const config: ExpoConfig = {
  name: "frontend_app",
  slug: "frontend_app",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "frontendapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.example",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.example",
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          extraMavenRepos: [
            "https://devrepo.kakao.com/nexus/content/groups/public/",
          ],
        },
      },
    ],
    [
      "@react-native-kakao/core",
      {
        nativeAppKey: kakaoNativeAppKey,
        android: {
          authCodeHandlerActivity: true,
          followChannelHandlerActivity: true,
          forwardKakaoLinkIntentFilterToMainActivity: true,
        },
        ios: {
          handleKakaoOpenUrl: true,
          naviApplicationQuerySchemes: true,
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
