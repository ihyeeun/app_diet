import { Tabs } from "expo-router";
import { House, Star, GitCompareArrows, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ff7700",
        tabBarInactiveTintColor: "#bfbfbf",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <House color={color} size={size} fill={color} strokeWidth={1} />
          ),
        }}
      />
      <Tabs.Screen
        name="recommend"
        options={{
          title: "추천",
          tabBarIcon: ({ color, size }) => (
            <Star color={color} size={size} fill={color} strokeWidth={1} />
          ),
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "비교",
          tabBarIcon: ({ color, size }) => (
            <GitCompareArrows color={color} size={size} fill={color} strokeWidth={1} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} fill={color} strokeWidth={1} />
          ),
        }}
      />
    </Tabs>
  );
}
