import AppWebViewScreen, { type AppTabName } from "@/src/screens/AppWebviewScreen";
import { router, Slot, useSegments } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeIcon from "../../assets/images/Icon/home-outline.svg";
import HomeFillIcon from "../../assets/images/Icon/home-fill.svg";
import ChatIcon from "../../assets/images/Icon/chat-outline.svg";
import ChatFillIcon from "../../assets/images/Icon/chat-fill.svg";
import DiaryIcon from "../../assets/images/Icon/diary-outline.svg";
import DiaryFillIcon from "../../assets/images/Icon/diary-fill.svg";
import UserIcon from "../../assets/images/Icon/user-outline.svg";
import UserFillIcon from "../../assets/images/Icon/user-fill.svg";

const TAB_PATH_MAP: Record<AppTabName, string> = {
  home: "/home",
  chat: "/chat",
  diary: "/diary",
  profile: "/profile",
};

const TAB_ITEMS: {
  tab: AppTabName;
  label: string;
  Icon: typeof HomeIcon;
  FocusedIcon: typeof HomeFillIcon;
}[] = [
  { tab: "home", label: "홈", Icon: HomeIcon, FocusedIcon: HomeFillIcon },
  { tab: "chat", label: "AI 코치", Icon: ChatIcon, FocusedIcon: ChatFillIcon },
  { tab: "diary", label: "다이어리", Icon: DiaryIcon, FocusedIcon: DiaryFillIcon },
  { tab: "profile", label: "프로필", Icon: UserIcon, FocusedIcon: UserFillIcon },
];

let lastResolvedTab: AppTabName = "home";

function resolveCurrentTab(segments: string[]): AppTabName | null {
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const routeName = segments[index];

    if (routeName === "home") return "home";
    if (routeName === "chat") return "chat";
    if (routeName === "diary") return "diary";
    if (routeName === "profile") return "profile";
  }

  return null;
}

function getTabRoute(tab: AppTabName) {
  return `/(tabs)/${tab}` as const;
}

export default function TabsLayout() {
  const segments = useSegments();
  const resolvedTab = resolveCurrentTab(segments as string[]);
  if (resolvedTab) {
    lastResolvedTab = resolvedTab;
  }
  const currentTab = resolvedTab ?? lastResolvedTab;
  const tabPath = TAB_PATH_MAP[currentTab];
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = Math.max(insets.bottom, 8);
  const shouldHideTabBar = isTabBarHidden || currentTab === "chat";

  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        <AppWebViewScreen
          path={tabPath}
          currentTab={currentTab}
          onTabBarVisibilityChange={setIsTabBarHidden}
        />
      </View>

      <View style={styles.hiddenSlot} pointerEvents="none">
        <Slot />
      </View>

      {!shouldHideTabBar ? (
        <View style={[styles.tabBar, { paddingBottom: tabBarBottomPadding }]}>
          {TAB_ITEMS.map(({ tab, label, Icon, FocusedIcon }) => {
            const isFocused = currentTab === tab;
            const RenderIcon = isFocused ? FocusedIcon : Icon;

            return (
              <Pressable
                key={tab}
                style={styles.tabButton}
                onPress={() => {
                  if (isFocused) return;
                  router.replace(getTabRoute(tab));
                }}
              >
                <RenderIcon width={24} height={24} />
                <Text
                  style={[
                    styles.tabLabel,
                    isFocused ? styles.tabLabelFocused : styles.tabLabelBlurred,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webViewContainer: {
    flex: 1,
  },
  hiddenSlot: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e4e4e4",
    flexDirection: "row",
    paddingTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  },
  tabLabelFocused: {
    color: "#ff7700",
  },
  tabLabelBlurred: {
    color: "#bfbfbf",
  },
});
