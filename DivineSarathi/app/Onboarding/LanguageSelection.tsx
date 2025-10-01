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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
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
        <View style={styles.languageOptionGradient}>
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
              <Ionicons name="checkmark-circle" size={40} color="#69585F" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7EF" />
      <View style={styles.gradientBackground}>
        {/* Sacred Om Symbol */}
        <View style={styles.headerSection}>
          <Image
            source={require("../../assets/images/logo_no_background.png")}
            style={styles.logo}
          />
          {/* <Text style={styles.omSymbol}>ॐ</Text> */}
          <Text style={styles.sanskritText}>डिवाइन सारथी</Text>
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
                <ActivityIndicator size="large" color="#DA8852" />
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
                <View style={styles.buttonGradient}>
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
                    color={"#fff"}
                    style={styles.buttonIcon}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
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
    backgroundColor: "#FBF7EF",
  },
  headerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 30,
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 16,
  },
  sanskritText: {
    fontSize: 24,
    color: "#FFB169",
    fontWeight: "600",
    fontFamily: "Roboto",
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
    color: "#D9712C",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Roboto",
  },
  subtitle: {
    fontSize: 16,
    color: "#D9712C",
    textAlign: "center",
    fontWeight: "500",
    fontFamily: "Roboto",
  },
  descriptionContainer: {
    alignItems: "center",
    backgroundColor: "#FDD5B010",
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: "#FDD5B0",
  },
  description: {
    fontSize: 14,
    color: "#DA8852",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "400",
    marginBottom: 16,
    fontFamily: "Roboto",
  },
  lotusSymbol: {
    fontSize: 30,
    textAlign: "center",
    fontFamily: "Roboto",
  },
  languageContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 15,
  },
  languageOption: {
    borderRadius: 24,
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
    backgroundColor: "#FDD5B0",
    borderColor: "#FF8100",
  },
  languageOptionGradient: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FDD5B0",
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
    color: "#FF8100",
    marginBottom: 2,
  },
  languageNameSelected: {
    color: "#69585F",
  },
  languageNativeName: {
    fontSize: 16,
    color: "#FF8100",
    fontWeight: "500",
  },
  languageNativeNameSelected: {
    color: "#69585F",
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
    marginTop: 16,
  },
  comingSoonText: {
    fontSize: 14,
    color: "#DA8852",
    marginBottom: 8,
    fontStyle: "italic",
    fontFamily: "Roboto",
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
    borderRadius: 24,
    backgroundColor: "#FEB989",
    borderWidth: 2,
    borderColor: "#F66700",
  },
  continueButtonDisabled: {
    backgroundColor: "#69585F",
    borderColor: "#69585F",
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
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Roboto",
  },
  buttonTextDisabled: {
    color: "#999",
  },
  buttonIcon: {
    marginLeft: 10,
  },
  blessingsText: {
    fontSize: 14,
    color: "#DA8852",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
    paddingHorizontal: 20,
    fontFamily: "Roboto",
  },
  blessingsTranslation: {
    fontSize: 12,
    color: "#DA8852",
    fontStyle: "normal",
    fontWeight: "400",
    fontFamily: "Roboto",
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
