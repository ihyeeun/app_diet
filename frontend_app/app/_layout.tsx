import { loadAccessToken } from "@/features/auth/store/tokenStore";
import { subscribeAuthExpired } from "@/src/shared/auth/authSessionEvents";
import { router, Stack, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";

export default function RootLayout() {
  const segments = useSegments();
  const segmentRef = useRef<string[]>([]);
  const didBootstrapRef = useRef(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    segmentRef.current = segments as string[];
  }, [segments]);

  useEffect(() => {
    const unsubscribe = subscribeAuthExpired(() => {
      const isAuthRoute = segmentRef.current[0] === "(auth)";
      if (isAuthRoute) return;
      router.replace("/(auth)/login");
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const currentRoute = segments.join("/");
      const shouldBootstrapRoute = currentRoute === "" || currentRoute === "index";
      if (!shouldBootstrapRoute) {
        if (!cancelled) setIsBootstrapping(false);
        return;
      }

      if (didBootstrapRef.current) {
        if (!cancelled) setIsBootstrapping(false);
        return;
      }
      didBootstrapRef.current = true;

      const token = await loadAccessToken();

      if (cancelled) return;

      if (token) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
      setIsBootstrapping(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [segments]);

  if (isBootstrapping) return null;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="camera-capture" options={{ headerShown: false }} />
    </Stack>
  );
}
