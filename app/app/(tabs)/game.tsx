import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Button } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import GameTutorial from "@/components/GameTutorial";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function GameScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showTutorial, setShowTutorial] = useState(false);

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

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}/>
      </CameraView>
      {showTutorial && <GameTutorial onClose={handleCloseTutorial} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});