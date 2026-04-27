import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "melo",
  slug: "melo",
  extra: {
    eas: {
      projectId: "507c0e33-8576-4aba-84f4-00d6b74a7338",
    },
  },
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/logo/melo-logo.png",
  scheme: "melo",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.melo.ai.kr.melo.app",
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ff8e00",
      foregroundImage: "./assets/logo/android-icon-foreground.png",
      backgroundImage: "./assets/logo/android-icon-background.png",
      monochromeImage: "./assets/logo/android-icon-foreground.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.melo.frontend",
    permissions: ["CAMERA"],
    blockedPermissions: ["android.permission.RECORD_AUDIO"],
  },
  web: {
    output: "static",
    favicon: "./assets/logo/melo-logo.svg",
  },
  plugins: [
    "expo-router",
    [
      "react-native-vision-camera",
      {
        cameraPermissionText: "음식과 영양성분표를 촬영하기 위해 카메라 접근 권한이 필요합니다.",
        enableMicrophonePermission: false,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission: "갤러리에서 사진을 선택하기 위해 사진 접근 권한이 필요합니다.",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash.png",
        resizeMode: "cover",
        backgroundColor: "#ffffff",
        enableFullScreenImage_legacy: true,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
