import React, { useState, useEffect, useReducer, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Button,
  Image,
  Dimensions,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  FlashMode,
} from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import GameTutorial from "@/components/GameTutorial";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/Colors";
import { classifyImage } from "@/utils/classifyImage";
import { classToEcoponto } from "@/constants/ClassToEcoponto";
// eslint-disable-next-line import/no-named-as-default
import useModelLoader from "../useModelLoader";
import EcopontoWidget from "@/components/EcopontoWidget";
import { useFocusEffect } from "expo-router";
import { useGameCamera } from "@/hooks/useGameCamera";

// Constants
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
const CONFIDENCE_THRESHOLD = 60;
const CLOSE_ICON_DELAY = 500;

// State management
interface GameState {
  showTutorial: boolean;
  showGameScreen: boolean;
  flash: FlashMode;
  capturedUri: string | null;
  showCapturedUriScan: boolean;
  classifiedItem: string;
  loadingWidget: boolean;
  showCloseIcon: boolean;
  classifying: boolean;
  ecoponto: string;
  errorMessage: string | null;
  cameraKey: number;
}

type GameAction =
  | { type: "RESET_ALL" }
  | { type: "SET_TUTORIAL"; payload: boolean }
  | { type: "SET_FLASH"; payload: FlashMode }
  | { type: "SET_CAPTURED_URI"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CLASSIFYING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "SET_CLASSIFICATION_RESULT";
      payload: { item: string; ecoponto: string };
    }
  | { type: "SHOW_PREVIEW" }
  | { type: "SHOW_CLOSE_ICON"; payload: boolean }
  | { type: "INCREMENT_CAMERA_KEY" };

const initialState: GameState = {
  showTutorial: false,
  showGameScreen: false,
  flash: "off",
  capturedUri: null,
  showCapturedUriScan: false,
  classifiedItem: "",
  loadingWidget: false,
  showCloseIcon: false,
  classifying: false,
  ecoponto: "",
  errorMessage: null,
  cameraKey: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "RESET_ALL":
      return {
        ...initialState,
        cameraKey: state.cameraKey,
      };
    case "SET_TUTORIAL":
      return { ...state, showTutorial: action.payload };
    case "SET_FLASH":
      return { ...state, flash: action.payload };
    case "SET_CAPTURED_URI":
      return { ...state, capturedUri: action.payload };
    case "SET_LOADING":
      return { ...state, loadingWidget: action.payload };
    case "SET_CLASSIFYING":
      return { ...state, classifying: action.payload };
    case "SET_ERROR":
      return { ...state, errorMessage: action.payload };
    case "SET_CLASSIFICATION_RESULT":
      return {
        ...state,
        classifiedItem: action.payload.item,
        ecoponto: action.payload.ecoponto,
        showGameScreen: true,
        classifying: false,
        loadingWidget: false,
        showCapturedUriScan: false,
        flash: "off",
      };
    case "SHOW_PREVIEW":
      return {
        ...state,
        showCapturedUriScan: true,
        showCloseIcon: false,
      };
    case "SHOW_CLOSE_ICON":
      return { ...state, showCloseIcon: action.payload };
    case "INCREMENT_CAMERA_KEY":
      return { ...state, cameraKey: state.cameraKey + 1 };
    default:
      return state;
  }
}

// Reusable Components
const LoadingOverlay = ({ message }: { message: string }) => (
  <View style={styles.loaderContainer}>
    <View style={styles.loaderBackground}>
      <ActivityIndicator size="large" color="white" />
      <Text style={styles.loaderText}>{message}</Text>
    </View>
  </View>
);

const ErrorOverlay = ({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) => (
  <TouchableWithoutFeedback onPress={onDismiss}>
    <View style={styles.loaderContainer}>
      <View style={styles.loaderBackground}>
        <Text style={styles.loaderText}>{message}</Text>
      </View>
    </View>
  </TouchableWithoutFeedback>
);

const PreviewOverlay = ({
  capturedUri,
  showCloseIcon,
  onDismiss,
  onScan,
}: {
  capturedUri: string;
  showCloseIcon: boolean;
  onDismiss: () => void;
  onScan: () => void;
}) => (
  <View style={StyleSheet.absoluteFill}>
    <BlurView intensity={50} style={StyleSheet.absoluteFill} tint="dark" />
    <View style={styles.previewOverlay} pointerEvents="box-none">
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: capturedUri }}
          style={styles.previewImage}
          resizeMode="contain"
        />
        {showCloseIcon && (
          <>
            <TouchableOpacity style={styles.closeIcon} onPress={onDismiss}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanBtn} onPress={onScan}>
              <Text style={styles.scanBtnText}>Scan it</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  </View>
);

export default function GameScreen() {
  const { model, loading } = useModelLoader();
  const { cameraRef, takePicture: takeCameraPicture } = useGameCamera();
  const [facing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const resetAllStates = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  // Reset camera and state when screen is focused
  useFocusEffect(
    useCallback(() => {
      resetAllStates();
      dispatch({ type: "INCREMENT_CAMERA_KEY" });

      return () => {
        resetAllStates();
      };
    }, [resetAllStates])
  );

  useEffect(() => {
    dispatch({ type: "SET_TUTORIAL", payload: true });
  }, []);

  const handleCloseTutorial = useCallback(() => {
    dispatch({ type: "SET_TUTORIAL", payload: false });
  }, []);

  const toggleFlash = useCallback(() => {
    const newFlash = state.flash === "off" ? "on" : "off";
    dispatch({ type: "SET_FLASH", payload: newFlash });
  }, [state.flash]);

  const classifyTrash = useCallback(async () => {
    console.log("🗑️ Classifying image...");
    dispatch({ type: "SET_CLASSIFYING", payload: true });
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      if (!model || !state.capturedUri) {
        dispatch({
          type: "SET_ERROR",
          payload: "Model or image not available",
        });
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_CLASSIFYING", payload: false });
        return;
      }

      const classNames = Object.keys(classToEcoponto);
      const result = await classifyImage({
        model,
        image: state.capturedUri,
        classNames,
      });

      if (!Array.isArray(result)) {
        dispatch({ type: "SET_ERROR", payload: "Error classifying image" });
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_CLASSIFYING", payload: false });
        return;
      }

      const [success, message, confidence] = result;

      if (Number(confidence) < CONFIDENCE_THRESHOLD || !success) {
        dispatch({
          type: "SET_ERROR",
          payload: "Could not classify this image. Try again!",
        });
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_CLASSIFYING", payload: false });
        return;
      }

      const ecopontoResult = classToEcoponto[message] || "Unknown";
      console.log(
        `🗑️ This belongs to ${ecopontoResult} with ${confidence} certainty`
      );

      dispatch({
        type: "SET_CLASSIFICATION_RESULT",
        payload: { item: message, ecoponto: ecopontoResult },
      });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Error during classification" });
    }
  }, [model, state.capturedUri]);

  const takePicture = useCallback(async () => {
    if (loading) return;
    dispatch({ type: "SET_LOADING", payload: true });

    const photoUri = await takeCameraPicture();

    if (photoUri) {
      requestAnimationFrame(() => {
        console.log("📸 Picture taken:", photoUri);
        dispatch({ type: "SET_CAPTURED_URI", payload: photoUri });
        dispatch({ type: "SHOW_PREVIEW" });
      });
    }

    dispatch({ type: "SET_LOADING", payload: false });
  }, [loading, takeCameraPicture]);

  const handleDismissPreview = useCallback(() => {
    dispatch({ type: "SET_CAPTURED_URI", payload: null });
  }, []);

  // Show close icon and scan button with delay when capturedUri changes
  useEffect(() => {
    if (state.capturedUri) {
      const timeout = setTimeout(
        () => dispatch({ type: "SHOW_CLOSE_ICON", payload: true }),
        CLOSE_ICON_DELAY
      );
      return () => clearTimeout(timeout);
    }
  }, [state.capturedUri]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.message}>
          We need your permission to show the camera
        </ThemedText>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {state.loadingWidget && (
        <LoadingOverlay
          message={state.classifying ? "Classifying..." : "Taking picture..."}
        />
      )}

      {state.errorMessage && (
        <ErrorOverlay
          message={state.errorMessage}
          onDismiss={() => dispatch({ type: "SET_ERROR", payload: null })}
        />
      )}

      <CameraView
        key={state.cameraKey}
        style={styles.camera}
        ref={cameraRef}
        facing={facing}
        flash={state.flash}
        enableTorch={state.flash === "on"}>
        <View style={styles.overlayContainer}>
          <Text style={styles.text}>
            Scan the trash item to start recycling
          </Text>
        </View>
      </CameraView>

      {state.showTutorial && (
        <GameTutorial onClose={handleCloseTutorial} loading={loading} />
      )}

      {state.showGameScreen && (
        <EcopontoWidget
          result={state.ecoponto}
          image={state.capturedUri!}
          classifiedItem={state.classifiedItem}
          onClose={() => {
            dispatch({ type: "RESET_ALL" });
          }}
        />
      )}

      <TouchableOpacity
        style={styles.circleButton}
        onPress={takePicture}
        disabled={loading}
      />

      <TouchableOpacity
        style={styles.flashButton}
        onPress={toggleFlash}
        disabled={loading}>
        <MaterialIcons
          name={state.flash === "off" ? "flash-off" : "flash-on"}
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {state.showCapturedUriScan && state.capturedUri && (
        <PreviewOverlay
          capturedUri={state.capturedUri}
          showCloseIcon={state.showCloseIcon}
          onDismiss={handleDismissPreview}
          onScan={classifyTrash}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 80,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    position: "absolute",
    top: 90,
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  circleButton: {
    position: "absolute",
    bottom: 50,
    left: windowWidth / 2 - 32.5,
    width: 65,
    height: 65,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  flashButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
  previewOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // 👈 This is the key fix
  },
  imageWrapper: {
    position: "relative",
    width: windowWidth * 0.8,
    height: windowHeight * 0.55,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  disabledButton: {
    opacity: 0.4,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 10,
  },
  loaderBackground: {
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 10,
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "white",
    fontSize: 16,
  },
  closeIcon: {
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
  scanBtn: {
    backgroundColor: Colors.light.tabIconSelected,
    paddingVertical: 10,
    paddingHorizontal: 24, // wider padding for a nice button
    borderRadius: 8,
    position: "absolute",
    bottom: -15,
    alignSelf: "center", // center horizontally
    alignItems: "center",
  },
  scanBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
