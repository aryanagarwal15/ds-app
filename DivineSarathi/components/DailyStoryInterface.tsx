import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DailyStoryInterfaceProps {
  error: string | null;
  onClearError: () => void;
}

const DailyStoryInterface: React.FC<DailyStoryInterfaceProps> = ({
  error,
  onClearError,
}) => {
  return (
    <View style={styles.backgroundContentContainer}>
      <View style={styles.dailyStoryCard}>
        <Text style={styles.dailyStoryTitle}>Daily Story</Text>
        <Text style={styles.dailyStoryContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Text>
        <Text style={styles.dailyStoryReadMore}>Read More</Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.clearErrorButton} onPress={onClearError}>
            <Ionicons name="close" size={16} color="#ff6b6b" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContentContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f00",
    height: "100%",
    zIndex: 1,
  },
  dailyStoryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 16,
    marginTop: 56,
  },
  dailyStoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  dailyStoryContent: {
    fontSize: 14,
    color: "#222",
  },
  dailyStoryReadMore: {
    fontSize: 14,
    color: "#222",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  clearErrorButton: {
    padding: 4,
  },
});

export default DailyStoryInterface;
