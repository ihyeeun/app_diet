import { StyleSheet, Text, View } from "react-native";

export default function CompareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>비교</Text>
      <Text style={styles.description}>비교 화면입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
  },
});
