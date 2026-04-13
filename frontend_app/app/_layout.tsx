import { loadAccessToken } from "@/features/auth/store/tokenStore";
import { subscribeAuthExpired } from "@/src/shared/auth/authSessionEvents";
import { router, Stack, useSegments } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = subscribeAuthExpired(() => {
      router.replace("/(auth)/login");
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const currentRoute = segments.join("/");
      const shouldBootstrapRoute = currentRoute === "" || currentRoute === "index";
      if (!shouldBootstrapRoute) return;

      const token = await loadAccessToken();

      if (cancelled) return;

      if (token) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [segments]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="camera-capture" options={{ headerShown: false }} />
    </Stack>
  );
}
