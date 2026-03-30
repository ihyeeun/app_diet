import { handleWebMessage } from "@/src/shared/api/bridge/handleWebMessage";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { BackHandler, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent, WebViewNavigation } from "react-native-webview";

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

function resolveWebPath(requestUrl: string, webAppOrigin: string | null) {
  if (!webAppOrigin) return null;

  try {
    const parsed = new URL(requestUrl);
    if (parsed.origin !== webAppOrigin) return null;

    return parsed.pathname;
  } catch {
    return null;
  }
}

function resolveTabFromPath(pathname: string): AppTabName | null {
  if (pathname === "/" || pathname === "/home") return "home";
  if (pathname === "/recommend") return "recommend";
  if (pathname === "/compare") return "compare";
  if (pathname === "/profile") return "profile";

  return null;
}

function resolveTabFromUrl(requestUrl: string, webAppOrigin: string | null): AppTabName | null {
  const pathname = resolveWebPath(requestUrl, webAppOrigin);
  if (!pathname) return null;

  return resolveTabFromPath(pathname);
}

function shouldHideTabBar(requestUrl: string, webAppOrigin: string | null) {
  const pathname = resolveWebPath(requestUrl, webAppOrigin);
  if (!pathname) return false;

  return resolveTabFromPath(pathname) === null;
}

function getTabRoute(tabName: AppTabName) {
  return `/(tabs)/${tabName}` as const;
}

const pathChangeBridgeScript = `
  (function () {
    if (window.__RN_PATH_BRIDGE__) return;
    window.__RN_PATH_BRIDGE__ = true;

    const emitPath = function () {
      if (!window.ReactNativeWebView) return;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: "WEB_PATH_CHANGE",
          payload: { href: window.location.href }
        })
      );
    };

    const wrapHistoryMethod = function (methodName) {
      const original = history[methodName];
      history[methodName] = function () {
        const result = original.apply(this, arguments);
        emitPath();
        return result;
      };
    };

    wrapHistoryMethod("pushState");
    wrapHistoryMethod("replaceState");

    window.addEventListener("popstate", emitPath);
    emitPath();
  })();
  true;
`;

export default function AppWebViewScreen({ path, currentTab }: AppWebViewScreenProps) {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const navigation = useNavigation();
  const targetUrl = buildWebAppUrl(path);
  const webAppOrigin = getWebAppOrigin();
  const isTabWebView = Boolean(currentTab);
  const injectedPathScript = isTabWebView ? pathChangeBridgeScript : undefined;

  const syncTabBarVisibility = useCallback(
    (hide: boolean) => {
      if (!isTabWebView) return;

      navigation.setOptions({
        tabBarStyle: hide ? { display: "none" } : undefined,
      });
    },
    [isTabWebView, navigation],
  );

  const syncTabBarFromUrl = useCallback(
    (url: string) => {
      if (!isTabWebView) return;

      syncTabBarVisibility(shouldHideTabBar(url, webAppOrigin));
    },
    [isTabWebView, syncTabBarVisibility, webAppOrigin],
  );

  useEffect(() => {
    if (!isTabWebView) return;

    syncTabBarVisibility(false);

    return () => {
      syncTabBarVisibility(false);
    };
  }, [isTabWebView, syncTabBarVisibility]);

  const onShouldStartLoadWithRequest = useCallback(
    (request: WebViewNavigation) => {
      syncTabBarFromUrl(request.url);

      if (!currentTab) return true;

      const targetTab = resolveTabFromUrl(request.url, webAppOrigin);
      if (!targetTab || targetTab === currentTab) return true;

      router.replace(getTabRoute(targetTab));
      return false;
    },
    [currentTab, syncTabBarFromUrl, webAppOrigin],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const rawData = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          payload?: { href?: string };
        };

        if (rawData.type === "WEB_PATH_CHANGE" && typeof rawData.payload?.href === "string") {
          syncTabBarFromUrl(rawData.payload.href);
          return;
        }
      } catch {
        // no-op
      }

      handleWebMessage(event, webViewRef);
    },
    [syncTabBarFromUrl],
  );

  const onNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      canGoBackRef.current = navState.canGoBack;
      syncTabBarFromUrl(navState.url);
    },
    [syncTabBarFromUrl],
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const backSubscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!canGoBackRef.current) return false;

      webViewRef.current?.goBack();
      return true;
    });

    return () => {
      backSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <WebView
        ref={webViewRef}
        source={{ uri: targetUrl }}
        injectedJavaScriptBeforeContentLoaded={injectedPathScript}
        onMessage={onMessage}
        onNavigationStateChange={onNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        allowsBackForwardNavigationGestures
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        style={styles.webview}
        webviewDebuggingEnabled={true}
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
