import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { authenticateWithGoogle } from "../../redux/auth/slice";
import * as WebBrowser from "expo-web-browser";
import { buildApiUrl, API_ENDPOINTS } from "../../constants/config";
import { LinearGradient } from "expo-linear-gradient";

// Complete WebBrowser auth session when the auth flow is done
WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get("window");

export default function Onboarding() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // Define the redirect URI for your app
  const redirectUri = "divinesarathi://auth/callback"; // Custom scheme for your app

  const onGoogleSignIn = async () => {
    setLoading(true);
    try {
      // Use your server's Google OAuth endpoint with platform parameter
      const authUrl = `${buildApiUrl(
        API_ENDPOINTS.AUTH.GOOGLE
      )}?platform=mobile`;

      // Open the auth URL which will handle the entire OAuth flow on your server
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      if (result.type === "success") {
        // Extract token from the redirect URL
        const url = new URL(result.url);
        const token = url.searchParams.get("token");

        if (token) {
          // @ts-ignore
          dispatch(authenticateWithGoogle(token));
          router.replace("/AuthLoading");
        } else {
          Alert.alert("Error", "Authentication failed. Please try again.");
        }
      } else if (result.type === "cancel") {
        // User cancelled the auth flow
        console.log("User cancelled Google sign in");
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "Failed to sign in with Google. Please try again.");
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
        {/* Sacred Om Symbol */}
        <View style={styles.headerSection}>
          <Text style={styles.omSymbol}>ॐ</Text>
          <Text style={styles.sanskritText}>दिव्य सारथी</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>Divine Sarathi</Text>
            <Text style={styles.subtitle}>Your Spiritual Companion</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Connect with Lord Krishna{"\n"}
              Seek guidance, find peace, and strengthen your faith{"\n"}
              through divine conversations
            </Text>

            {/* Lotus Symbol */}
            <Text style={styles.lotusSymbol}>🪷</Text>
          </View>

          <View style={styles.authSection}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>
                  Connecting to the Divine...
                </Text>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.googleSignInButton}
                  onPress={onGoogleSignIn}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#FFD700", "#FFA500", "#FF8C00"]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.buttonText}>Continue with Google</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.alternateLoginButton}
                  onPress={() => router.push("/Onboarding/EmailLogin")}
                >
                  <Text style={styles.alternateLoginText}>
                    Continue with Email
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.blessingsText}>
              <Text style={styles.blessingsTranslation}>
                May all beings be happy and free from illness
              </Text>
            </Text>
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
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
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
    padding: 25,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
  },
  description: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginBottom: 15,
  },
  lotusSymbol: {
    fontSize: 40,
    textAlign: "center",
  },
  authSection: {
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
  googleSignInButton: {
    width: width * 0.8,
    marginBottom: 16,
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
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B1538",
    marginRight: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    textAlign: "center",
    lineHeight: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8B1538",
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  alternateLoginButton: {
    width: width * 0.8,
    marginBottom: 15,
    borderRadius: 25,
  },
  alternateLoginText: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    fontWeight: "500",
  },
});
