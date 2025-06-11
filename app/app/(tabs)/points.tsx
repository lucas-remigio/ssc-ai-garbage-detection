import React, { useCallback } from "react";
import { StyleSheet, View, Text, ScrollView, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { usePoints } from "@/hooks/usePoints";
import { useFocusEffect } from "expo-router";

const { width } = Dimensions.get("window");

export default function PointsScreen() {
  const { points, loading, refreshPoints } = usePoints();

  useFocusEffect(
    useCallback(() => {
      console.log("PointsScreen focused, refreshing points");
      refreshPoints();
    }, [refreshPoints])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading points...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <ThemedView style={styles.headerSection}>
        <View style={styles.pointsCard}>
          <MaterialIcons
            name="star"
            size={50}
            color={Colors.light.tabIconSelected}
          />
          <ThemedText type="title" style={styles.pointsNumber}>
            {points}
          </ThemedText>
          <ThemedText style={styles.pointsLabel}>
            {points === 1 ? "Point" : "Points"} Earned
          </ThemedText>
        </View>
      </ThemedView>

      {/* Achievements Section */}
      <ThemedView style={styles.achievementsSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Achievements
        </ThemedText>

        <View style={styles.achievementsList}>
          <AchievementItem
            icon="emoji-events"
            title="First Steps"
            description="Classify your first item"
            achieved={points >= 1}
            points="1 point"
          />

          <AchievementItem
            icon="whatshot"
            title="Getting Started"
            description="Classify 5 items correctly"
            achieved={points >= 5}
            points="5 points"
          />

          <AchievementItem
            icon="stars"
            title="Eco Warrior"
            description="Classify 10 items correctly"
            achieved={points >= 10}
            points="10 points"
          />

          <AchievementItem
            icon="military-tech"
            title="Recycling Expert"
            description="Classify 25 items correctly"
            achieved={points >= 25}
            points="25 points"
          />

          <AchievementItem
            icon="flash-on"
            title="Garbage Superhero"
            description="Classify 100 items correctly"
            achieved={points >= 100}
            points="100 points"
          />
        </View>
      </ThemedView>

      {/* Tips Section */}
      <ThemedView style={styles.tipsSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Recycling Tips
        </ThemedText>

        <View style={styles.tipsList}>
          <TipItem
            icon="lightbulb"
            text="Clean containers before recycling to avoid contamination"
          />
          <TipItem
            icon="info"
            text="Check local recycling guidelines as they may vary by location"
          />
          <TipItem
            icon="favorite"
            text="Reduce and reuse before recycling for maximum environmental impact"
          />
        </View>
      </ThemedView>
    </ScrollView>
  );
}

// Achievement Item Component
function AchievementItem({
  icon,
  title,
  description,
  achieved,
  points,
}: {
  icon: string;
  title: string;
  description: string;
  achieved: boolean;
  points: string;
}) {
  return (
    <View
      style={[styles.achievementItem, achieved && styles.achievementAchieved]}>
      <MaterialIcons
        name={icon as any}
        size={24}
        color={achieved ? Colors.light.tabIconSelected : "#ccc"}
      />
      <View style={styles.achievementContent}>
        <ThemedText
          style={[
            styles.achievementTitle,
            achieved && styles.achievementTitleAchieved,
          ]}>
          {title}
        </ThemedText>
        <ThemedText style={styles.achievementDescription}>
          {description}
        </ThemedText>
        <ThemedText style={styles.achievementPoints}>{points}</ThemedText>
      </View>
      {achieved && (
        <MaterialIcons
          name="check-circle"
          size={20}
          color={Colors.light.tabIconSelected}
        />
      )}
    </View>
  );
}

// Tip Item Component
function TipItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.tipItem}>
      <MaterialIcons
        name={icon as any}
        size={20}
        color={Colors.light.tabIconSelected}
      />
      <ThemedText style={styles.tipText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    paddingTop: 20, // Add top margin
    paddingBottom: 100, // Account for tab bar
  },
  headerSection: {
    padding: 20,
    alignItems: "center",
  },
  pointsCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: width * 0.8,
  },
  pointsNumber: {
    padding: 10,
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.light.tabIconSelected,
    marginVertical: 10,
  },
  pointsLabel: {
    fontSize: 16,
    color: "#666",
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  achievementsSection: {
    padding: 20,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  achievementAchieved: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tabIconSelected,
  },
  achievementContent: {
    flex: 1,
    marginLeft: 12,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  achievementTitleAchieved: {
    color: Colors.light.tabIconSelected,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  achievementPoints: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  tipsSection: {
    padding: 20,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    marginLeft: 12,
    lineHeight: 20,
  },
});
