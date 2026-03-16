import React from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";

type AppleLoginButtonProps = {
  onPress: () => void;
};

const AppleLogoImage = require("../../../assets/images/appleLogo.png");

export function AppleLoginButton({ onPress }: AppleLoginButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="애플 로그인"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <Image source={AppleLogoImage} resizeMode="contain" />
        <Text style={styles.label}>Apple 로그인</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    width: 300,
    height: 45,
    borderRadius: 6,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logo: {
    width: 20,
    height: 20,
  },
  label: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
});
