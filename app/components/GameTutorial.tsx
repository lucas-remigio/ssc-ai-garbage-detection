import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Colors } from '@/constants/Colors';

interface GameTutorialProps {
  onClose: () => void;
  loading: boolean;
}

const TUTORIAL_PAGES = [
  {
    title: "ReBin It!",
    text: "This is your camera screen. Point your camera at objects to start playing.",
  },
  {
    title: "Scan Objects",
    text: "Align the object within the frame to let the AI classify it.",
  },
  {
    title: "Earn Points",
    text: "Correctly classify objects to earn points and climb the leaderboard!",
  },
];

const { width, height } = Dimensions.get("window");

export default function GameTutorial({ onClose, loading }: GameTutorialProps) {
  const [page, setPage] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;


  useEffect(() => {
    if (page === TUTORIAL_PAGES.length - 1) {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: -50,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [page]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderBackground}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loaderText}>Loading Model ...</Text>
        </View>
      </View>
    );
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newPage = Math.round(event.nativeEvent.contentOffset.x / width);
    setPage(newPage);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <Animated.FlatList
          ref={flatListRef}
          data={TUTORIAL_PAGES}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          renderItem={({ item }) => (
            <View style={styles.page}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.text}>{item.text}</Text>
            </View>
          )}
        />



        <Animated.View style={[styles.buttonContainer, { opacity: buttonOpacity }]}>
          {page === TUTORIAL_PAGES.length - 1 && (
            <Text style={styles.gotIt} onPress={onClose}>
              Got it!
            </Text>
          )}
        </Animated.View>


        <View style={styles.indicatorContainer}>
          {TUTORIAL_PAGES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [1, 1.5, 1],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    transform: [{ scale }],
                    opacity,
                  },
                ]}
              />
            );
          })}
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
    width: width * 0.8,
    height: height * 0.35,
    alignItems: "center",
  },
  page: {
    width: width * 0.8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#222",
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors['light'].tabIconSelected,
    marginHorizontal: 4,
  },
  buttonContainer: {
    backgroundColor: Colors['light'].tabIconSelected,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 20
  },
  gotIt: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
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

});
