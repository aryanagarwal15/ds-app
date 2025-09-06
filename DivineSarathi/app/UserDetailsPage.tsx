import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import DisclaimerSection from "../components/DisclaimerSection";
import DetailsSection from "../components/DetailsSection";
import { saveUserDetails } from "../redux/auth/slice";

const { width, height } = Dimensions.get("window");

export default function UserDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAgeChange = (ageRange: string) => {
    setSelectedAge(ageRange);
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleContinue = async () => {
    if (!selectedAge || !selectedGender) {
      Alert.alert(
        "Information Required",
        "Please select both your age range and gender to continue."
      );
      return;
    }

    setLoading(true);
    try {
      // Save user details to server
      // @ts-ignore
      await dispatch(saveUserDetails(selectedAge, selectedGender));
      
      console.log("User Details saved:", { age: selectedAge, gender: selectedGender });
      
      // Navigation will be handled by the main index.tsx based on completion status
      router.replace("/");
    } catch (error) {
      console.error("Error saving user details:", error);
      Alert.alert(
        "Error",
        "Failed to save your details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#FF8A00", "#FF6B00", "#E74C3C", "#8B1538"]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >

        {/* Main Content */}
        <View style={styles.contentSection}>
          {/* Disclaimer Section - 25% */}
          <View style={styles.disclaimerContainer}>
            <DisclaimerSection />
          </View>

          {/* Details Section - 75% */}
          <View style={styles.detailsContainer}>
            <DetailsSection
              onAgeChange={handleAgeChange}
              onGenderChange={handleGenderChange}
              selectedAge={selectedAge}
              selectedGender={selectedGender}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>
                  Setting up your profile...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.continueButton,
                    (!selectedAge || !selectedGender) && styles.continueButtonDisabled,
                  ]}
                  onPress={handleContinue}
                  disabled={!selectedAge || !selectedGender || loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      selectedAge && selectedGender
                        ? ["#FFD700", "#FFA500", "#FF8C00"]
                        : ["#666", "#555", "#444"]
                    }
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        (!selectedAge || !selectedGender) && styles.buttonTextDisabled,
                      ]}
                    >
                      Continue
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={20}
                      color={(selectedAge && selectedGender) ? "#8B1538" : "#999"}
                      style={styles.buttonIcon}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  omSymbol: {
    fontSize: 50,
    color: "#FFD700",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    marginBottom: 5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#FFE4B5",
    textAlign: "center",
    fontWeight: "500",
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 10,
  },
  disclaimerContainer: {
    height: "25%",
    marginBottom: 10,
  },
  detailsContainer: {
    height: "60%",
    marginBottom: 10,
  },
  actionSection: {
    height: "15%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#FFD700",
    marginTop: 15,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  continueButton: {
    width: width * 0.8,
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B1538",
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonTextDisabled: {
    color: "#999",
  },
  buttonIcon: {
    marginLeft: 10,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 14,
    color: "#FFE4B5",
    textAlign: "center",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
