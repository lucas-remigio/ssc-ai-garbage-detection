import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

interface EcopontoWidgetProps {
  result: string;
  image: string; // URL or local path
  onClose?: () => void;
  classifiedItem?: string; // Add this prop to receive the classified item name
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
  classifiedItem,
}: EcopontoWidgetProps) {
  const [showAnimation, setShowAnimation] = useState<"success" | "fail" | null>(
    null
  );
  const [gameFinished, setGameFinished] = useState(false);
  const [incorrectSelections, setIncorrectSelections] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [selectedCorrectOption, setSelectedCorrectOption] = useState<
    string | null
  >(null);

  const handlePress = (label: string) => {
    if (gameFinished) return;

    if (label === result) {
      console.log(`Correct!`);
      setSelectedCorrectOption(label);
      setShowAnimation("success");
      setGameFinished(true);

      // Auto-close after animation completes
      setTimeout(() => {
        setShowAnimation(null);
        onClose?.();
      }, 4000); // Increased to 4 seconds to allow reading the success message
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

  const handleClose = () => {
    setShowAnimation(null);
    onClose?.();
  };

  const getSuccessMessage = () => {
    const itemName = classifiedItem || "item";
    return `Very good! The image was a ${itemName}, so the ${selectedCorrectOption} ecoponto is correct!`;
  };

  const getErrorMessage = () => {
    const itemName = classifiedItem || "item";
    return `Oops! The image was a ${itemName}, so the correct answer was ${result}.`;
  };

  if (showAnimation) {
    return (
      <View style={styles.overlay}>
        <View style={styles.animationContainer}>
          {/* Close button for animation screen */}
          <TouchableOpacity
            style={styles.animationCloseButton}
            onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>

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
              styles.animationTitle,
              { color: showAnimation === "success" ? "#4CAF50" : "#F44336" },
            ]}>
            {showAnimation === "success" ? "Correct!" : "Game Over"}
          </Text>
          {showAnimation === "success" && (
            <Text style={styles.successMessage}>{getSuccessMessage()}</Text>
          )}
          {showAnimation === "fail" && (
            <Text style={styles.failMessage}>{getErrorMessage()}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <MaterialIcons name="close" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>Choose the Right Ecoponto!</Text>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.centerImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subtitle}>Where does this item belong?</Text>

        {/* Show classified item if available */}
        {classifiedItem && (
          <Text style={styles.classifiedText}>
            Detected:{" "}
            <Text style={styles.classifiedItem}>{classifiedItem}</Text>
          </Text>
        )}

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
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: -8,
    left: -8,
    backgroundColor: "red",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2E7D32",
    textAlign: "center",
    paddingLeft: 40, // Add padding to avoid overlap with close button
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
    marginBottom: 12,
    textAlign: "center",
  },
  classifiedText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  classifiedItem: {
    fontWeight: "bold",
    color: "#2E7D32",
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
    width: width * 0.85,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  animationCloseButton: {
    position: "absolute",
    top: -8,
    left: -8,
    backgroundColor: "red",
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  animation: {
    width: 150,
    height: 150,
  },
  animationTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  failMessage: {
    fontSize: 16,
    color: "#c62828",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
});
