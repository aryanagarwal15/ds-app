import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { RootState } from "../redux/store";
import { fetchUserProfile } from "../redux/auth/slice";

const { width } = Dimensions.get("window");

export default function AuthLoading() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userProfile, token, authenticated } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // If we have user profile, determine where to navigate
    if (userProfile) {
      const { completionStatus } = userProfile;

      // If no language selected, go to language selection
      if (!completionStatus?.hasLanguage) {
        router.replace("/Onboarding/LanguageSelection");
        return;
      }

      // If language selected but no user details (age/gender), go to user details
      if (
        completionStatus?.hasLanguage &&
        (!completionStatus?.hasUserDetails || !completionStatus?.hasDisclaimer)
      ) {
        router.replace("/Onboarding/UserDetailsPage"); 
        return;
      }

      // If both language and user details are complete, go to home
      if (completionStatus?.isComplete) {
        router.replace("/HomeV3");
        return;
      }

      router.replace("/Onboarding/LanguageSelection");
    }
  }, [userProfile]);

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
          <Text style={styles.title}>DIVINE SARATHI</Text>
        </View>

        {/* Loading Content */}
        <View style={styles.contentSection}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>
              Preparing your divine experience...
            </Text>
            <Text style={styles.subText}>
              Setting up your spiritual journey
            </Text>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            <Text style={styles.decorativeText}>🪷</Text>
            <Text style={styles.decorativeText}>🕉️</Text>
            <Text style={styles.decorativeText}>🪷</Text>
          </View>
        </View>

        {/* Footer Blessing */}
        <View style={styles.footerSection}>
          <Text style={styles.blessingsText}>
            "सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः"
          </Text>
          <Text style={styles.blessingsTranslation}>
            May all beings be happy and free from illness
          </Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  omSymbol: {
    fontSize: 80,
    color: "#FFD700",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 3,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  contentSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  loadingText: {
    fontSize: 18,
    color: "#FFD700",
    marginTop: 30,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subText: {
    fontSize: 14,
    color: "#FFE4B5",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "400",
    fontStyle: "italic",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  decorativeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: width * 0.6,
    marginBottom: 40,
  },
  decorativeText: {
    fontSize: 32,
    opacity: 0.7,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  footerSection: {
    alignItems: "center",
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  blessingsText: {
    fontSize: 16,
    color: "#FFD700",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  blessingsTranslation: {
    fontSize: 12,
    color: "#FFE4B5",
    textAlign: "center",
    fontStyle: "italic",
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
