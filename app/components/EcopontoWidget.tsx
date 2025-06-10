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
  const [incorrectSelections, setIncorrectSelections] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handlePress = (label: string) => {
    if (gameFinished) return;

    if (label === result) {
      console.log(`Correct!`);
      setShowAnimation("success");
      setGameFinished(true);

      // Auto-close after animation completes
      setTimeout(() => {
        setShowAnimation(null);
        onClose?.();
      }, 3000);
    } else {
      console.log(`Wrong! Selected: ${label}, Correct: ${result}`);

      // Add to incorrect selections
      setIncorrectSelections((prev) => [...prev, label]);

      // Show feedback message
      setFeedbackMessage(`${label} is incorrect. Try again!`);

      // Clear feedback message after 2 seconds
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 2000);

      // If user has tried 3 wrong answers, show fail animation
      if (incorrectSelections.length >= 2) {
        // 2 because we haven't added current selection yet
        setShowAnimation("fail");
        setGameFinished(true);

        setTimeout(() => {
          setShowAnimation(null);
          onClose?.();
        }, 3000);
      }
    }
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
            {showAnimation === "success"
              ? "Correct!"
              : "Game Over - Try Again!"}
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

        {/* Feedback message */}
        {feedbackMessage && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        )}

        {/* Attempts indicator */}
        {incorrectSelections.length > 0 && (
          <Text style={styles.attemptsText}>
            Attempts: {incorrectSelections.length}/3
          </Text>
        )}

        <View style={styles.optionsContainer}>
          {trashTypes.map((trash, index) => (
            <Pressable
              key={index}
              style={[
                styles.optionButton,
                gameFinished && { opacity: 0.6 },
                incorrectSelections.includes(trash.label) &&
                  styles.incorrectOption,
              ]}
              onPress={() => handlePress(trash.label)}
              disabled={
                gameFinished || incorrectSelections.includes(trash.label)
              }>
              <View style={styles.iconContainer}>
                <Text style={styles.trashIcon}>{trash.icon}</Text>
                {incorrectSelections.includes(trash.label) && (
                  <View style={styles.incorrectMark}>
                    <Text style={styles.incorrectMarkText}>✗</Text>
                  </View>
                )}
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
  feedbackContainer: {
    backgroundColor: "#ffebee",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  feedbackText: {
    color: "#c62828",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  attemptsText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
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
  incorrectOption: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    opacity: 0.7,
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
    position: "relative",
  },
  incorrectMark: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#f44336",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  incorrectMarkText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
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
