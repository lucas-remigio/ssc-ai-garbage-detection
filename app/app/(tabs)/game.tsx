import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Button, Image, Dimensions, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import { CameraView, CameraType, useCameraPermissions, FlashMode } from 'expo-camera';
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import GameTutorial from "@/components/GameTutorial";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { classifyImage } from "@/utils/classifyImage";
import { classToEcoponto } from "@/constants/ClassToEcoponto";
import useModelLoader from "../useModelLoader";
import EcopontoWidget from "@/components/EcopontoWidget";
import { image } from "@tensorflow/tfjs";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function GameScreen() {
  const { model, loading, error } = useModelLoader();
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showTutorial, setShowTutorial] = useState(false);
  const [showGameScreen, setShowGameScreen] = useState(false);
  const [flash, setFlash] = useState<FlashMode>('off');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const ref = useRef<CameraView>(null);
  const [loadingWidget, setLoadingWidget] = useState(false);
  const [showCloseIcon, setShowCloseIcon] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [ecoponto, setEcoponto] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      //const seen = await AsyncStorage.getItem("seenGameTutorial");
      //if (!seen) setShowTutorial(true);
      setShowTutorial(true);
    })();
  }, []);

  const handleCloseTutorial = async () => {
    setShowTutorial(false);
    //await AsyncStorage.setItem("seenGameTutorial", "true");
  };

  const toggleFlash = () => {
    setFlash((prevFlash) => prevFlash === 'off' ? 'on' : 'off');
  };

  const classifyTrash = async () => {
    console.log("🗑️ Classifying image...");
    setClassifying(true);
    setLoadingWidget(true);
    setErrorMessage(null);
    try {
      if (!model || !capturedUri) {
        setErrorMessage('Model or image not available');
        return;
      }
      const classNames = Object.keys(classToEcoponto);
      const result = await classifyImage({
        model,
        image: capturedUri,
        classNames,
      });
      if (!Array.isArray(result)) {
        setErrorMessage('Error classifying image');
        return;
      }
      const [success, message, confidence] = result;

      if (Number(confidence) < 80){
        setErrorMessage('Could not classify this image. Try again!');
        return;
      }

      if (success) {
        setEcoponto(classToEcoponto[message] || "Unknown");
        console.log(`🗑️ This belongs to ${classToEcoponto[message] || "Unknown"} with ${confidence} certainty`);
        setShowGameScreen(true);
      } else {
        setErrorMessage('Could not classify this image. Try again!');
      }
    } finally {
      setClassifying(false);
      setLoadingWidget(false);
      setCapturedUri(null);
    }
  }

  const takePicture = async () => {
    if (loading) return;
    setLoadingWidget(true);

    try {
      const photo = await ref.current?.takePictureAsync({ skipProcessing: true });
      if (photo?.uri) {
        requestAnimationFrame(() => {
          setCapturedUri(photo.uri);
        });
      }
    } catch (error) {
      console.error("Failed to take picture:", error);
    } finally {
      setLoadingWidget(false);
    }
  };

  const handleDismissPreview = () => {
    setTimeout(() => {}, 100);
    setCapturedUri(null);
  };

  // Show close icon and scan button with delay when capturedUri changes
  useEffect(() => {
    if (capturedUri) {
      setShowCloseIcon(false);
      const timeout = setTimeout(() => setShowCloseIcon(true), 500); // 500ms delay
      return () => clearTimeout(timeout);
    } else {
      setShowCloseIcon(false);
    }
  }, [capturedUri]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loadingWidget && (
        <View style={styles.loaderContainer}>
          <View style={styles.loaderBackground}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loaderText}>{classifying ? "Classifying..." : "Taking picture..."}</Text>
          </View>
        </View>
      )}
      {errorMessage && (
        <TouchableWithoutFeedback onPress={() => setErrorMessage(null)}>
          <View style={styles.loaderContainer}>
            <View style={styles.loaderBackground}>
              <Text style={styles.loaderText}>{errorMessage}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      <CameraView 
        style={styles.camera} 
        ref={ref} 
        facing={facing} 
        flash={flash} 
        enableTorch={flash === 'on'}
      >
        <View style={styles.overlayContainer}>
          <Text style={styles.text}>Scan the trash item to start recycling</Text>
        </View>
      </CameraView>

      {showTutorial && <GameTutorial onClose={handleCloseTutorial} loading={loading} />}

      {showGameScreen && <EcopontoWidget result={ecoponto} image={capturedUri!} />}

      <TouchableOpacity style={styles.circleButton} onPress={takePicture} disabled={loading}/>

      <TouchableOpacity style={styles.flashButton} onPress={toggleFlash} disabled={loading}>
        <MaterialIcons
          name={flash === 'off' ? "flash-off" : "flash-on"}
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {capturedUri && (
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
                  <TouchableOpacity style={styles.closeIcon} onPress={handleDismissPreview}>
                    <MaterialIcons name="close" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.scanBtn}
                    onPress={classifyTrash}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Scan it</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
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
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    position: 'absolute',
    top: 90,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  circleButton: {
    position: 'absolute',
    bottom: 50,
    left: windowWidth / 2 - 32.5,
    width: 65,
    height: 65,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  flashButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  previewOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // 👈 This is the key fix
  },
  imageWrapper: {
    position: 'relative',
    width: windowWidth * 0.8,
    height: windowHeight * 0.55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  disabledButton: {
  opacity: 0.4,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 10,
  },
  loaderBackground: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
  },
  closeIcon: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: 'red',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  scanBtn: {
    backgroundColor: Colors.light.tabIconSelected,
    paddingVertical: 10,
    paddingHorizontal: 24, // wider padding for a nice button
    borderRadius: 8,
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',    // center horizontally
    alignItems: 'center',
  }

});
