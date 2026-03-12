import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";

type AppleLoginButtonProps = {
  onPress: () => void;
};

const appleLoginButtonImage = require("../../../assets/images/appleid_button.png");

export function AppleLoginButton({ onPress }: AppleLoginButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image source={appleLoginButtonImage} resizeMode="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
  },
  pressed: {
    opacity: 0.7,
  },
});
