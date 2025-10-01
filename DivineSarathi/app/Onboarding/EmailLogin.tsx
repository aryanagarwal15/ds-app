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
  TextInput,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { authenticateWithGoogle } from "../../redux/auth/slice";
import { LinearGradient } from "expo-linear-gradient";
import { buildApiUrl, API_CONFIG, API_ENDPOINTS } from "../../constants/config";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function EmailLogin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Please enter your email address.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.AUTH.EMAIL_SEND_OTP),
        {
          method: "POST",
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        }
      );

      if (response.ok) {
        setStep("otp");
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "Failed to send OTP. Please try again."
        );
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert("OTP Required", "Please enter the OTP code.");
      return;
    }

    if (otp.trim().length !== 6) {
      Alert.alert("Invalid OTP", "Please enter a 6-digit OTP code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.AUTH.EMAIL_VERIFY_OTP),
        {
          method: "POST",
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.trim(),
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const token = result.token;

        if (token) {
          // Use the same authentication flow as Google auth
          // @ts-ignore
          await dispatch(authenticateWithGoogle(token));
          router.replace("/AuthLoading");
        } else {
          Alert.alert("Error", "Authentication failed. Please try again.");
        }
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Invalid OTP",
          errorData.message || "The OTP code you entered is incorrect."
        );
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      Alert.alert("Error", "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("email");
      setOtp("");
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF7EF" />
      <View style={styles.gradientBackground}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#FF8100" />
        </TouchableOpacity>

        {/* Sacred Om Symbol */}
        <View style={styles.headerSection}>
          <Image
            source={require("../../assets/images/logo_no_background.png")}
            style={styles.logo}
          />
          <Text style={styles.sanskritText}>दिव्य सारथी</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              {step === "email" ? "Enter Your Email" : "Enter OTP"}
            </Text>
            <Text style={styles.subtitle}>
              {step === "email"
                ? "We'll send you a verification code"
                : `Code sent to ${email}`}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {step === "email" ? (
              <View style={styles.inputContainer}>
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.15)",
                    "rgba(255, 255, 255, 0.1)",
                  ]}
                  style={styles.inputGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color="#69585F"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#69585F"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.15)",
                    "rgba(255, 255, 255, 0.1)",
                  ]}
                  style={styles.inputGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons
                    name="key-outline"
                    size={24}
                    color="#69585F"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor="#69585F"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />
                </LinearGradient>
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.authSection}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>
                  {step === "email" ? "Sending OTP..." : "Verifying OTP..."}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.continueButton}
                onPress={step === "email" ? handleSendOtp : handleVerifyOtp}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>
                    {step === "email" ? "Send OTP" : "Verify & Continue"}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
                </View>
              </TouchableOpacity>
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
    backgroundColor: "#FBF7EF",
  },
  backButton: {
    position: "absolute",
    left: 20,
    padding: 8,
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
    color: "#FF8100",
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
    fontFamily: "Roboto",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#D9712C",
    textAlign: "center",
    fontWeight: "500",
    fontFamily: "Roboto",
  },
  formContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#FDD5B0",
    backgroundColor: "#FDD5B0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#FF8100",
    paddingVertical: 12,
  },
  resendButton: {
    alignSelf: "flex-end",
    marginTop: 10,
  },
  resendText: {
    fontSize: 14,
    color: "#FF8100",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  lotusSymbol: {
    fontSize: 40,
    textAlign: "center",
    marginTop: 20,
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
    color: "#FF8100",
    marginTop: 15,
    fontWeight: "500",
    fontFamily: "Roboto",
  },
  continueButton: {
    width: width * 0.8,
    marginBottom: 16,
    borderRadius: 25,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "#FEB989",
    borderWidth: 2,
    borderColor: "#F38132",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Roboto",
  },
  buttonIcon: {
    marginLeft: 10,
  },
  blessingsText: {
    fontSize: 14,
    color: "#FF8100",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  blessingsTranslation: {
    fontSize: 12,
    color: "#FF8100",
    fontStyle: "normal",
    fontWeight: "400",
    fontFamily: "Roboto",
  },
});
