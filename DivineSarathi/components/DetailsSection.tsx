import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { saveUserAge, saveUserGender } from "../redux/auth/slice";

interface DetailsSectionProps {
  onAgeChange: (ageRange: string | null) => void;
  onGenderChange: (gender: string | null) => void;
  selectedAge: string | null;
  selectedGender: string | null;
  dispatch: any;
}

const ageRanges = [
  { id: "18-25", label: "18-25 years" },
  { id: "26-35", label: "26-35 years" },
  { id: "36-45", label: "36-45 years" },
  { id: "46-55", label: "46-55 years" },
  { id: "56-65", label: "56-65 years" },
  { id: "65+", label: "65+ years" },
];

const genderOptions = [
  { id: "male", label: "Male", icon: "man" },
  { id: "female", label: "Female", icon: "woman" },
  { id: "other", label: "Other", icon: "person" },
];

const { width: screenWidth } = Dimensions.get("window");

export default function DetailsSection({
  onAgeChange,
  onGenderChange,
  selectedAge,
  selectedGender,
  dispatch,
}: DetailsSectionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const totalSteps = 2;
  const [isAgeLoading, setIsAgeLoading] = useState(false);
  const [isGenderLoading, setIsGenderLoading] = useState(false);

  // Auto-advance to gender question when age is selected
  useEffect(() => {
    if (selectedAge && currentStep === 0 && !isAgeLoading) {
      setTimeout(() => {
        setCurrentStep(1);
        scrollViewRef.current?.scrollTo({
          x: screenWidth,
          animated: true,
        });
      }, 500); // Delay for better UX and API call completion
    }
  }, [selectedAge, currentStep, screenWidth, isAgeLoading]);

  const handleAgeChange = async (ageRange: string) => {
    if (isAgeLoading) return; // Prevent multiple calls

    setIsAgeLoading(true);
    try {
      // Update local state immediately for UI responsiveness
      onAgeChange(ageRange);

      // Save to API and Redux store
      // @ts-ignore
      await dispatch(saveUserAge(ageRange));

      console.log("Age saved successfully:", ageRange);
    } catch (error) {
      console.error("Error saving age:", error);
      Alert.alert("Error", "Failed to save your age. Please try again.");
      // Revert local state on error
      onAgeChange(null);
    } finally {
      setIsAgeLoading(false);
    }
  };

  const handleGenderChange = async (gender: string) => {
    console.log("calling");
    if (isGenderLoading) return; // Prevent multiple calls

    setIsGenderLoading(true);
    try {
      // Update local state immediately for UI responsiveness
      onGenderChange(gender);

      // Save to API and Redux store
      // @ts-ignore
      await dispatch(saveUserGender(gender));

      console.log("Gender saved successfully:", gender);
    } catch (error) {
      console.error("Error saving gender:", error);
      Alert.alert("Error", "Failed to save your gender. Please try again.");
      // Revert local state on error
      onGenderChange(null);
    } finally {
      setIsGenderLoading(false);
    }
  };

  const renderPageIndicators = () => {
    return (
      <View style={styles.indicatorContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  index === currentStep
                    ? "#FFD700"
                    : "rgba(255, 255, 255, 0.3)",
                width: index === currentStep ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderAgeOption = (ageRange: { id: string; label: string }) => {
    const isSelected = selectedAge === ageRange.id;
    const isCurrentlyLoading = isAgeLoading && isSelected;

    return (
      <TouchableOpacity
        key={ageRange.id}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
          isAgeLoading && !isSelected && styles.optionButtonDisabled,
        ]}
        onPress={() => handleAgeChange(ageRange.id)}
        activeOpacity={0.8}
        disabled={isAgeLoading}
      >
        <LinearGradient
          colors={
            isSelected
              ? ["#FFD700", "#FFA500", "#FF8C00"]
              : ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
          }
          style={styles.optionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text
            style={[
              styles.optionText,
              isSelected && styles.optionTextSelected,
              isAgeLoading && !isSelected && styles.optionTextDisabled,
            ]}
          >
            {ageRange.label}
          </Text>
          {isCurrentlyLoading ? (
            <ActivityIndicator size="small" color="#8B1538" />
          ) : (
            isSelected && (
              <Ionicons name="checkmark-circle" size={20} color="#8B1538" />
            )
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderGenderOption = (gender: {
    id: string;
    label: string;
    icon: string;
  }) => {
    const isSelected = selectedGender === gender.id;
    const isCurrentlyLoading = isGenderLoading && isSelected;

    return (
      <TouchableOpacity
        key={gender.id}
        style={[
          styles.genderButton,
          isSelected && styles.genderButtonSelected,
          isGenderLoading && !isSelected && styles.genderButtonDisabled,
        ]}
        onPress={() => handleGenderChange(gender.id)}
        activeOpacity={0.8}
        disabled={isGenderLoading}
      >
        <LinearGradient
          colors={
            isSelected
              ? ["#FFD700", "#FFA500", "#FF8C00"]
              : ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
          }
          style={styles.genderGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons
            name={gender.icon as any}
            size={24}
            color={isSelected ? "#8B1538" : "#FFFFFF"}
            style={styles.genderIcon}
          />
          <Text
            style={[
              styles.genderText,
              isSelected && styles.genderTextSelected,
              isGenderLoading && !isSelected && styles.genderTextDisabled,
            ]}
          >
            {gender.label}
          </Text>
          {isCurrentlyLoading ? (
            <ActivityIndicator
              size="small"
              color="#8B1538"
              style={styles.loadingIcon}
            />
          ) : (
            isSelected && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#8B1538"
                style={styles.checkIcon}
              />
            )
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 215, 0, 0.1)"]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Page Indicators */}
        {renderPageIndicators()}

        {/* Horizontal Scroll Container */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScrollContainer}
          contentContainerStyle={styles.horizontalContentContainer}
          onMomentumScrollEnd={(event) => {
            const newStep = Math.round(
              event.nativeEvent.contentOffset.x / screenWidth
            );
            setCurrentStep(newStep);
          }}
          scrollEnabled={selectedAge !== null} // Only allow manual scroll after age is selected
        >
          {/* Age Selection Page */}
          <View style={[styles.pageContainer, { width: screenWidth - 40 }]}>
            <ScrollView
              style={styles.pageScrollContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.pageContent}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>🕰️ Age Range</Text>
                  <Text style={styles.sectionSubtitle}>
                    Help us provide age-appropriate guidance
                  </Text>
                </View>

                <View style={styles.optionsContainer}>
                  {ageRanges.map(renderAgeOption)}
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Gender Selection Page */}
          <View style={[styles.pageContainer, { width: screenWidth - 40 }]}>
            <View style={styles.pageContent}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👤 Gender</Text>
                <Text style={styles.sectionSubtitle}>
                  This helps us personalize your spiritual journey
                </Text>
              </View>

              <View style={styles.genderContainer}>
                {genderOptions.map(renderGenderOption)}
              </View>

              {/* Privacy Note */}
              <View style={styles.privacyNote}>
                <Ionicons name="shield-checkmark" size={16} color="#FFD700" />
                <Text style={styles.privacyText}>
                  Your personal information is kept private and secure
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,
    padding: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  horizontalScrollContainer: {
    flex: 1,
  },
  horizontalContentContainer: {
    alignItems: "stretch",
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  pageScrollContainer: {
    flex: 1,
  },
  pageContent: {
    gap: 25,
    minHeight: "100%",
    justifyContent: "center",
  },
  stepInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  stepText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  sectionContainer: {
    gap: 15,
  },
  sectionHeader: {
    alignItems: "center",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#FFE4B5",
    textAlign: "center",
    fontWeight: "400",
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    borderColor: "#FFD700",
    elevation: 5,
    shadowOpacity: 0.3,
  },
  optionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 11,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  optionTextSelected: {
    color: "#8B1538",
    fontWeight: "bold",
  },
  optionButtonDisabled: {
    opacity: 0.5,
  },
  optionTextDisabled: {
    opacity: 0.5,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  genderButton: {
    flex: 1,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  genderButtonSelected: {
    borderColor: "#FFD700",
    elevation: 5,
    shadowOpacity: 0.3,
  },
  genderGradient: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 11,
    minHeight: 80,
    position: "relative",
  },
  genderIcon: {
    marginBottom: 5,
  },
  genderText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
  },
  genderTextSelected: {
    color: "#8B1538",
    fontWeight: "bold",
  },
  genderButtonDisabled: {
    opacity: 0.5,
  },
  genderTextDisabled: {
    opacity: 0.5,
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  loadingIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    gap: 8,
  },
  privacyText: {
    fontSize: 12,
    color: "#FFE4B5",
    fontStyle: "italic",
    textAlign: "center",
    flex: 1,
  },
});
