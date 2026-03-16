import { handleWebMessage } from "@/src/shared/api/bridge/handleWebMessage";
import { router } from "expo-router";
import { useCallback, useRef } from "react";
import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewNavigation } from "react-native-webview";

const defaultWebUrl = Platform.select({
  ios: "http://localhost:5173",
  android: "http://10.0.2.2:5173",
  default: "http://localhost:5173",
}) ?? "http://localhost:5173";

const webAppUrl = process.env.EXPO_PUBLIC_WEB_APP_URL ?? defaultWebUrl;

type AppWebViewScreenProps = {
  path?: string;
  currentTab?: AppTabName;
};

type AppTabName = "home" | "recommend" | "compare" | "profile";

function buildWebAppUrl(path?: string) {
  if (!path) return webAppUrl;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    return new URL(normalizedPath, webAppUrl).toString();
  } catch {
    return `${webAppUrl.replace(/\/$/, "")}${normalizedPath}`;
  }
}

function getWebAppOrigin() {
  try {
    return new URL(webAppUrl).origin;
  } catch {
    return null;
  }
}

function resolveTabFromUrl(requestUrl: string, webAppOrigin: string | null): AppTabName | null {
  if (!webAppOrigin) return null;

  try {
    const parsed = new URL(requestUrl);
    if (parsed.origin !== webAppOrigin) return null;

    if (parsed.pathname === "/" || parsed.pathname === "/home") return "home";
    if (parsed.pathname === "/recommend") return "recommend";
    if (parsed.pathname === "/compare") return "compare";
    if (parsed.pathname === "/profile") return "profile";

    return null;
  } catch {
    return null;
  }
}

function getTabRoute(tabName: AppTabName) {
  return `/(tabs)/${tabName}` as const;
}

export default function AppWebViewScreen({ path, currentTab }: AppWebViewScreenProps) {
  const webViewRef = useRef<WebView>(null);
  const targetUrl = buildWebAppUrl(path);
  const webAppOrigin = getWebAppOrigin();

  const onShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation) => {
      if (!currentTab) return true;

      const targetTab = resolveTabFromUrl(request.url, webAppOrigin);
      if (!targetTab || targetTab === currentTab) return true;

      router.replace(getTabRoute(targetTab));
      return false;
    },
    [currentTab, webAppOrigin],
  );

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <WebView
        ref={webViewRef}
        source={{ uri: targetUrl }}
        onMessage={(event) => handleWebMessage(event, webViewRef)}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        style={styles.webview}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
  },
});
