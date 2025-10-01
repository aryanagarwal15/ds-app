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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { authenticateWithGoogle } from "../../redux/auth/slice";
import * as WebBrowser from "expo-web-browser";
import { buildApiUrl, API_ENDPOINTS } from "../../constants/config";

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
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7EF" />
      <View style={styles.gradientBackground}>
        {/* Sacred Om Symbol */}
        <View style={styles.headerSection}>
          {/* add logo_no_background.png */}
          <Image
            source={require("../../assets/images/logo_no_background.png")}
            style={styles.logo}
          />
          <Text style={styles.sanskritText}>डिवाइन सारथी</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>DivineSarathi</Text>
            <Text style={styles.subtitle}>Your Spiritual Companion</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Connect with Lord Krishna{"\n"}
              Seek guidance, find peace, and strengthen your faith through
              divine conversations
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
                  <View style={styles.GoogleButton}>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.buttonText}>Continue with Google</Text>
                  </View>
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
    fontWeight: "400",
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
    fontSize: 36,
    fontWeight: "bold",
    color: "#D9712C",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "Roboto",
  },
  subtitle: {
    fontSize: 18,
    color: "#D9712C",
    textAlign: "center",
    fontWeight: "500",
    fontFamily: "Roboto",
  },
  descriptionContainer: {
    alignItems: "center",
    backgroundColor: "#FDD5B010",
    borderRadius: 20,
    padding: 25,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: "#FDD5B0",
  },
  description: {
    fontSize: 16,
    color: "#DA8852",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: 15,
    fontFamily: "Roboto",
  },
  lotusSymbol: {
    fontSize: 40,
    textAlign: "center",
    fontFamily: "Roboto",
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
    fontFamily: "Roboto",
  },
  googleSignInButton: {
    width: width * 0.8,
    marginBottom: 8,
    borderRadius: 24,
  },
  GoogleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#FEB989",
    borderWidth: 2,
    borderColor: "#F66700",
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 15,
    borderRadius: 15,
    width: 30,
    height: 30,
    textAlign: "center",
    lineHeight: 30,
    fontFamily: "Roboto",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Roboto",
  },
  blessingsText: {
    fontSize: 14,
    color: "#FFE4B5",
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
    fontFamily: "Roboto",
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
    fontFamily: "Roboto",
  },
});
