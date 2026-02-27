import { loadAccessToken } from "@/features/auth/store/tokenStore";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const [hasAuthToken, setHasAuthToken] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await loadAccessToken();

        if (cancelled) return;

        if (token) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/(auth)/login");
        }
      } finally {
        if (!cancelled) setHasAuthToken(true);
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
    </Stack>
  );
}
