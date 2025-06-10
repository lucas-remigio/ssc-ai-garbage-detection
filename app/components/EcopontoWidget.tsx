import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";

interface EcopontoWidgetProps {
  result: string;
  image: string; // URL or local path
  onClose?: () => void;
}

const { width, height } = Dimensions.get("window");

const trashTypes = [
  { icon: "🔵", label: "Blue" },
  { icon: "🟡", label: "Yellow" },
  { icon: "🟢", label: "Green" },
  { icon: "🗑️", label: "Trash" },
  { icon: "🔋", label: "Pilhão" },
];

export default function EcopontoWidget({
  result,
  image,
  onClose,
}: EcopontoWidgetProps) {
  const [showAnimation, setShowAnimation] = useState<"success" | "fail" | null>(
    null
  );
  const [gameFinished, setGameFinished] = useState(false);

  const handlePress = (label: string) => {
    if (gameFinished) return;

    if (label === result) {
      console.log(`Correct!`);
      setShowAnimation("success");
    } else {
      console.log(`Wrong!`);
      setShowAnimation("fail");
    }

    setGameFinished(true);

    // Auto-close after animation completes
    setTimeout(() => {
      setShowAnimation(null);
      onClose?.();
    }, 3000);
  };

  if (showAnimation) {
    return (
      <View style={styles.overlay}>
        <View style={styles.animationContainer}>
          <LottieView
            source={
              showAnimation === "success"
                ? require("../assets/animations/success.json")
                : require("../assets/animations/fail.json")
            }
            autoPlay
            loop={false}
            style={styles.animation}
          />
          <Text
            style={[
              styles.animationText,
              { color: showAnimation === "success" ? "#4CAF50" : "#F44336" },
            ]}>
            {showAnimation === "success" ? "Correct!" : "Try Again!"}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose the Right Ecoponto!</Text>

        <Image
          source={{ uri: image }}
          style={styles.centerImage}
          resizeMode="contain"
        />

        <View style={styles.trashRow}>
          {trashTypes.map((trash, index) => (
            <Pressable
              key={index}
              style={styles.trashItem}
              onPress={() => handlePress(trash.label)}>
              <Text style={styles.trashIcon}>{trash.icon}</Text>
              <Text style={styles.trashLabel}>{trash.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    width: width * 0.8,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2E7D32",
    textAlign: "center",
  },
  centerImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  trashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  trashItem: {
    alignItems: "center",
    flex: 1,
  },
  trashIcon: {
    fontSize: 28,
  },
  trashLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  animationContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: "center",
    width: width * 0.8,
  },
  animation: {
    width: 200,
    height: 200,
  },
  animationText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
});
