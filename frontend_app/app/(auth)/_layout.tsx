import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="admin-login" options={{ title: "Admin Login" }} />
      <Stack.Screen name="kakaoLogin" options={{ title: "Kakao Login", headerShown: false }} />
      <Stack.Screen name="appleLogin" options={{ title: "Apple Login", headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ title: "", headerShown: false }} />
    </Stack>
  );
}
