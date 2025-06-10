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
    console.log(`Image received: ${image}`);
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

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.centerImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subtitle}>Where does this item belong?</Text>

        <View style={styles.optionsContainer}>
          {trashTypes.map((trash, index) => (
            <Pressable
              key={index}
              style={[styles.optionButton, gameFinished && { opacity: 0.6 }]}
              onPress={() => handlePress(trash.label)}
              disabled={gameFinished}>
              <View style={styles.iconContainer}>
                <Text style={styles.trashIcon}>{trash.icon}</Text>
              </View>
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
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    width: width * 0.9,
    maxHeight: height * 0.85,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2E7D32",
    textAlign: "center",
  },
  imageContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  centerImage: {
    width: 100,
    height: 100,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 8,
  },
  optionButton: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    minWidth: 70,
    borderWidth: 2,
    borderColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: "#fff",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  trashIcon: {
    fontSize: 24,
  },
  trashLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
    textAlign: "center",
  },
  animationContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: "center",
    width: width * 0.8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
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
