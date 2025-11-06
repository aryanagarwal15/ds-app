import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface NoInternetProps {
  onRetry: () => void;
}

export default function NoInternet({ onRetry }: NoInternetProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/krishna.png")}
            style={styles.logo}
          />
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline-outline" size={100} color="#8B5A3C" />
        </View>

        {/* Title */}
        <Text style={styles.title}>No Internet Connection</Text>

        {/* Message */}
        <Text style={styles.message}>
          We're unable to connect to the internet.{"\n"}
          Please check your connection and try again.
        </Text>

        {/* Retry Button */}
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <View style={styles.retryButtonInner}>
            <Ionicons
              name="refresh"
              size={24}
              color="#FFF"
              style={styles.retryIcon}
            />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </View>
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Make sure WiFi or cellular data is turned on
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#E5F5FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  retryButton: {
    backgroundColor: "#FFA344",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  retryIcon: {
    marginRight: 8,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  helpText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});

