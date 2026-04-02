import { loadAccessToken } from "@/features/auth/store/tokenStore";
import { subscribeAuthExpired } from "@/src/shared/auth/authSessionEvents";
import { router, Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    const unsubscribe = subscribeAuthExpired(() => {
      router.replace("/(auth)/login");
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
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
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="camera-capture" options={{ headerShown: false }} />
    </Stack>
  );
}
