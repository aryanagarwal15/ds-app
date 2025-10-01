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
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  setLanguagePreferenceThunk,
  fetchUserProfile,
} from "../../redux/auth/slice";
import { RootState } from "../../redux/store";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  {
    code: "english",
    name: "English",
    nativeName: "English",
  },
  {
    code: "hindi",
    name: "Hindi",
    nativeName: "हिंदी",
  },
];

export default function LanguageSelection() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userProfile } = useSelector((state: RootState) => state.auth);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user profile is complete and navigate directly to Home
  useEffect(() => {
    if (userProfile?.completionStatus?.isComplete) {
      router.replace("/HomeV2");
    }
  }, [userProfile, router]);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const handleContinue = async () => {
    if (!selectedLanguage) {
      Alert.alert(
        "Language Required",
        "Please select your preferred language to continue."
      );
      return;
    }

    setLoading(true);
    try {
      // Save language preference to server and local storage
      // @ts-ignore
      await dispatch(setLanguagePreferenceThunk(selectedLanguage));

      // Fetch updated user profile to get latest completion status
      // @ts-ignore
      const updatedProfile = await dispatch(fetchUserProfile());

      // Navigation will be handled by the main index.tsx based on completion status
      router.replace("/");
    } catch (error) {
      console.error("Error saving language preference:", error);
      Alert.alert(
        "Error",
        "Failed to save language preference. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderLanguageOption = (language: LanguageOption) => {
    const isSelected = selectedLanguage === language.code;

    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageOption,
          isSelected && styles.languageOptionSelected,
        ]}
        onPress={() => handleLanguageSelect(language.code)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            isSelected
              ? ["#FFD700", "#FFA500", "#FF8C00"]
              : ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
          }
          style={styles.languageOptionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.languageHeader}>
            <View style={styles.languageNames}>
              <Text
                style={[
                  styles.languageName,
                  isSelected && styles.languageNameSelected,
                ]}
              >
                {language.name}
              </Text>
              <Text
                style={[
                  styles.languageNativeName,
                  isSelected && styles.languageNativeNameSelected,
                ]}
              >
                {language.nativeName}
              </Text>
            </View>
            {isSelected && (
              <Ionicons name="checkmark-circle" size={24} color="#8B1538" />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
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
        {/* Sacred Om Symbol */}
        <View style={styles.headerSection}>
          <Text style={styles.omSymbol}>ॐ</Text>
          <Text style={styles.sanskritText}>भाषा चुनें</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Choose Your Language</Text>
            <Text style={styles.subtitle}>
              Select your preferred language for divine conversations
            </Text>
          </View>

          {/* Language Options */}
          <View style={styles.languageContainer}>
            {languages.map(renderLanguageOption)}

            {/* Coming Soon */}
            <View style={styles.comingSoonContainer}>
              <Text style={styles.comingSoonText}>
                More languages coming soon...
              </Text>
            </View>
          </View>

          {/* Continue Button */}
          <View style={styles.actionSection}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>
                  Preparing your divine experience...
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !selectedLanguage && styles.continueButtonDisabled,
                ]}
                onPress={handleContinue}
                disabled={!selectedLanguage || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    selectedLanguage
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
                      !selectedLanguage && styles.buttonTextDisabled,
                    ]}
                  >
                    Continue
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={selectedLanguage ? "#8B1538" : "#999"}
                    style={styles.buttonIcon}
                  />
                </LinearGradient>
              </TouchableOpacity>
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
    paddingBottom: 30,
  },
  omSymbol: {
    fontSize: 60,
    color: "#FFD700",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 10,
  },
  sanskritText: {
    fontSize: 24,
    color: "#FFD700",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentSection: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFE4B5",
    textAlign: "center",
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  descriptionContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  description: {
    fontSize: 14,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 10,
  },
  lotusSymbol: {
    fontSize: 30,
    textAlign: "center",
  },
  languageContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 15,
  },
  languageOption: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
    }),
  },
  languageOptionSelected: {
    borderColor: "#FFD700",
    ...Platform.select({
      ios: {
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
    }),
  },
  languageOptionGradient: {
    padding: 20,
    borderRadius: 13,
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 15,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  languageNameSelected: {
    color: "#8B1538",
  },
  languageNativeName: {
    fontSize: 16,
    color: "#FFE4B5",
    fontWeight: "500",
  },
  languageNativeNameSelected: {
    color: "#8B1538",
  },
  languageDescription: {
    fontSize: 14,
    color: "#FFE4B5",
    lineHeight: 20,
    fontStyle: "italic",
  },
  languageDescriptionSelected: {
    color: "#8B1538",
  },
  comingSoonContainer: {
    alignItems: "center",
  },
  comingSoonText: {
    fontSize: 12,
    color: "#FFE4B5",
    marginBottom: 8,
    fontStyle: "italic",
  },
  comingSoonLanguages: {
    flexDirection: "row",
    gap: 8,
  },
  comingSoonFlag: {
    fontSize: 20,
    opacity: 0.6,
  },
  actionSection: {
    alignItems: "center",
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
  continueButton: {
    width: width * 0.8,
    marginBottom: 25,
    borderRadius: 25,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  continueButtonDisabled: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
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
  blessingsText: {
    fontSize: 14,
    color: "#FFE4B5",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  blessingsTranslation: {
    fontSize: 12,
    color: "#FFD700",
    fontStyle: "normal",
    fontWeight: "400",
  },
  decorativeElements: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  decorativeSymbol: {
    fontSize: 24,
    opacity: 0.6,
  },
});
