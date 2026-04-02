import { handleWebMessage } from "@/src/shared/api/bridge/handleWebMessage";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { BackHandler, Platform, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView, WebViewMessageEvent, WebViewNavigation } from "react-native-webview";

const defaultWebUrl =
  Platform.select({
    ios: "http://localhost:5173",
    android: "http://10.0.2.2:5173",
    default: "http://localhost:5173",
  }) ?? "http://localhost:5173";

const webAppUrl = process.env.EXPO_PUBLIC_WEB_APP_URL ?? defaultWebUrl;
const LOCAL_DEV_HOSTNAMES = new Set(["localhost", "127.0.0.1", "10.0.2.2"]);

type AppWebViewScreenProps = {
  path?: string;
  currentTab?: AppTabName;
};

type AppTabName = "home" | "recommend" | "profile";

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

function resolveUrlPort(url: URL) {
  if (url.port) return url.port;
  return url.protocol === "https:" ? "443" : "80";
}

function isEquivalentLocalOrigin(requestOrigin: string, webAppOrigin: string) {
  if (requestOrigin === webAppOrigin) return true;

  try {
    const requestUrl = new URL(requestOrigin);
    const webUrl = new URL(webAppOrigin);

    const isBothLocalDevHost =
      LOCAL_DEV_HOSTNAMES.has(requestUrl.hostname) && LOCAL_DEV_HOSTNAMES.has(webUrl.hostname);
    if (!isBothLocalDevHost) return false;

    return (
      requestUrl.protocol === webUrl.protocol &&
      resolveUrlPort(requestUrl) === resolveUrlPort(webUrl)
    );
  } catch {
    return false;
  }
}

function resolveWebPath(requestUrl: string, webAppOrigin: string | null) {
  if (!webAppOrigin) return null;

  try {
    const parsed = new URL(requestUrl);
    if (!isEquivalentLocalOrigin(parsed.origin, webAppOrigin)) return null;

    return parsed.pathname;
  } catch {
    return null;
  }
}

function resolveTabFromPath(pathname: string): AppTabName | null {
  if (pathname === "/" || pathname === "/home") return "home";
  if (pathname === "/recommend") return "recommend";
  // if (pathname === "/compare") return "compare";
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
`;

function normalizeInset(inset: number) {
  return Math.max(0, Math.round(inset * 100) / 100);
}

function createSafeAreaSyncScript(topInset: number, bottomInset: number) {
  const normalizedTopInset = normalizeInset(topInset);
  const normalizedBottomInset = normalizeInset(bottomInset);

  return `
    (function () {
      var root = document.documentElement;
      if (!root) return;
      root.style.setProperty("--native-safe-area-top", "${normalizedTopInset}px");
      root.style.setProperty("--native-safe-area-bottom", "${normalizedBottomInset}px");
    })();
  `;
}

export default function AppWebViewScreen({ path, currentTab }: AppWebViewScreenProps) {
  const webViewRef = useRef<WebView>(null);
  const canGoBackRef = useRef(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const targetUrl = buildWebAppUrl(path);
  const webAppOrigin = getWebAppOrigin();
  const isTabWebView = Boolean(currentTab);
  const safeAreaSyncScript = useMemo(
    () => createSafeAreaSyncScript(insets.top, insets.bottom),
    [insets.bottom, insets.top],
  );
  const injectedScriptBeforeContentLoaded = useMemo(
    () => `${safeAreaSyncScript}${isTabWebView ? pathChangeBridgeScript : ""}true;`,
    [isTabWebView, safeAreaSyncScript],
  );

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

  const syncTabStateFromUrl = useCallback(
    (url: string) => {
      if (!isTabWebView) return false;

      syncTabBarFromUrl(url);

      if (!currentTab) return false;

      const targetTab = resolveTabFromUrl(url, webAppOrigin);
      if (!targetTab || targetTab === currentTab) return false;

      router.replace(getTabRoute(targetTab));
      return true;
    },
    [currentTab, isTabWebView, syncTabBarFromUrl, webAppOrigin],
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
      if (syncTabStateFromUrl(request.url)) return false;
      return true;
    },
    [syncTabStateFromUrl],
  );

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const rawData = JSON.parse(event.nativeEvent.data) as {
          type?: string;
          payload?: { href?: string };
        };

        if (rawData.type === "WEB_PATH_CHANGE" && typeof rawData.payload?.href === "string") {
          syncTabStateFromUrl(rawData.payload.href);
          return;
        }
      } catch {
        // no-op
      }

      handleWebMessage(event, webViewRef);
    },
    [syncTabStateFromUrl],
  );

  const onNavigationStateChange = useCallback((navState: WebViewNavigation) => {
    canGoBackRef.current = navState.canGoBack;
  }, []);

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

  useEffect(() => {
    webViewRef.current?.injectJavaScript(`${safeAreaSyncScript}true;`);
  }, [safeAreaSyncScript]);

  const onLoadEnd = useCallback(() => {
    webViewRef.current?.injectJavaScript(`${safeAreaSyncScript}true;`);
  }, [safeAreaSyncScript]);

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <WebView
        ref={webViewRef}
        source={{ uri: targetUrl }}
        injectedJavaScriptBeforeContentLoaded={injectedScriptBeforeContentLoaded}
        onMessage={onMessage}
        onLoadEnd={onLoadEnd}
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
