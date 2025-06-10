import { useRef, useCallback } from "react";
import { CameraView } from "expo-camera";

export const useGameCamera = () => {
  const ref = useRef<CameraView>(null);

  const takePicture = useCallback(async () => {
    try {
      const photo = await ref.current?.takePictureAsync({
        skipProcessing: true,
        exif: false,
        base64: false,
      });
      return photo?.uri || null;
    } catch (error) {
      console.error("Failed to take picture:", error);
      return null;
    }
  }, []);

  return {
    cameraRef: ref,
    takePicture,
  };
};
