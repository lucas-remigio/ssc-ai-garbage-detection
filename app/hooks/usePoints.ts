import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const POINTS_KEY = "points";

export const usePoints = () => {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Load points on mount
  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      const storedPoints = await AsyncStorage.getItem(POINTS_KEY);
      const currentPoints = storedPoints ? parseInt(storedPoints, 10) : 0;
      setPoints(currentPoints);
    } catch (error) {
      console.error("Error loading points:", error);
      setPoints(0);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = useCallback(
    async (pointsToAdd: number = 1) => {
      try {
        const newPoints = points + pointsToAdd;
        await AsyncStorage.setItem(POINTS_KEY, newPoints.toString());
        setPoints(newPoints);
        console.log(`Points updated: ${newPoints}`);
        return newPoints;
      } catch (error) {
        console.error("Error updating points:", error);
        return points;
      }
    },
    [points]
  );

  const resetPoints = useCallback(async () => {
    try {
      await AsyncStorage.setItem(POINTS_KEY, "0");
      setPoints(0);
      console.log("Points reset to 0");
    } catch (error) {
      console.error("Error resetting points:", error);
    }
  }, []);

  return {
    points,
    loading,
    addPoints,
    resetPoints,
    refreshPoints: loadPoints,
  };
};
