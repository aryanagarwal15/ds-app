import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

interface DetailsSectionProps {
  onAgeChange: (ageRange: string) => void;
  onGenderChange: (gender: string) => void;
  selectedAge: string | null;
  selectedGender: string | null;
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

export default function DetailsSection({
  onAgeChange,
  onGenderChange,
  selectedAge,
  selectedGender,
}: DetailsSectionProps) {
  const renderAgeOption = (ageRange: { id: string; label: string }) => {
    const isSelected = selectedAge === ageRange.id;

    return (
      <TouchableOpacity
        key={ageRange.id}
        style={[
          styles.optionButton,
          isSelected && styles.optionButtonSelected,
        ]}
        onPress={() => onAgeChange(ageRange.id)}
        activeOpacity={0.8}
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
            ]}
          >
            {ageRange.label}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color="#8B1538" />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderGenderOption = (gender: { id: string; label: string; icon: string }) => {
    const isSelected = selectedGender === gender.id;

    return (
      <TouchableOpacity
        key={gender.id}
        style={[
          styles.genderButton,
          isSelected && styles.genderButtonSelected,
        ]}
        onPress={() => onGenderChange(gender.id)}
        activeOpacity={0.8}
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
            ]}
          >
            {gender.label}
          </Text>
          {isSelected && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#8B1538"
              style={styles.checkIcon}
            />
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
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            {/* Age Section */}
            <View style={styles.sectionContainer}>
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

            {/* Gender Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👤 Gender</Text>
                <Text style={styles.sectionSubtitle}>
                  This helps us personalize your spiritual journey
                </Text>
              </View>
              
              <View style={styles.genderContainer}>
                {genderOptions.map(renderGenderOption)}
              </View>
            </View>

            {/* Privacy Note */}
            <View style={styles.privacyNote}>
              <Ionicons name="shield-checkmark" size={16} color="#FFD700" />
              <Text style={styles.privacyText}>
                Your personal information is kept private and secure
              </Text>
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
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 20,
    marginVertical: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  gradientBackground: {
    flex: 1,
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    gap: 25,
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
  checkIcon: {
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
