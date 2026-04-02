import { Tabs } from "expo-router";
import HomeIcon from "../../assets/images/Icon/Home.svg";
import HomeFillIcon from "../../assets/images/Icon/HomeFill.svg";
import StarIcon from "../../assets/images/Icon/Star.svg";
import StarFillIcon from "../../assets/images/Icon/StarFill.svg";
import UserIcon from "../../assets/images/Icon/User.svg";
import UserFillIcon from "../../assets/images/Icon/UserFill.svg";

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
          tabBarIcon: ({ focused, size }) =>
            focused ? (
              <HomeFillIcon width={size} height={size} />
            ) : (
              <HomeIcon width={size} height={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="recommend"
        options={{
          title: "추천",
          tabBarIcon: ({ focused, size }) =>
            focused ? (
              <StarFillIcon width={size} height={size} />
            ) : (
              <StarIcon width={size} height={size} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ focused, size }) =>
            focused ? (
              <UserFillIcon width={size} height={size} />
            ) : (
              <UserIcon width={size} height={size} />
            ),
        }}
      />
    </Tabs>
  );
}
