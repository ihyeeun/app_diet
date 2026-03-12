import React from "react";
import { Image, Pressable, StyleSheet } from "react-native";

type KakaoLoginButtonProps = {
  onPress: () => void;
};

const kakaoLoginButtonImage = require("../../../assets/images/kakao_login_large_wide.png");

export function KakaoLoginButton({ onPress }: KakaoLoginButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="카카오 로그인"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image source={kakaoLoginButtonImage} resizeMode="contain" style={styles.image} />
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
  image: {
    width: 300,
    height: 45,
  },
});
