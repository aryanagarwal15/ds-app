import React, { useState, useEffect } from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import DisclaimerSection from "../components/DisclaimerSection";
import DetailsSection from "../components/DetailsSection";
import { useAudioContext } from "../contexts/AudioContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function UserDetailsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] =
    useState<boolean>(false);
  const heightProgress = useSharedValue(0);

  const userProfile = useSelector((state: any) => state.auth.userProfile);
  const { backgroundMusic } = useAudioContext();

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${25 + heightProgress.value * 75}%`,
    };
  });

  // Animation function
  const animateHeight = (toExpanded: boolean) => {
    heightProgress.value = withTiming(toExpanded ? 1 : 0, {
      duration: 1500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };

  // Start background music when component mounts
  useEffect(() => {
    backgroundMusic.play();

    return () => {
      // Cleanup: stop background music when component unmounts
      backgroundMusic.stop();
    };
  }, []);

  // Auto-navigate when complete
  React.useEffect(() => {
    if (userProfile.completionStatus.isComplete) {
      setTimeout(() => {
        router.replace("/Home");
      }, 1500);
    }
  }, [userProfile, router]);

  const handleAgeChange = (ageRange: string | null) => {
    setSelectedAge(ageRange);
  };

  const handleGenderChange = (gender: string | null) => {
    setSelectedGender(gender);
  };

  const handleDisclaimerChange = (isAccepted: boolean) => {
    setIsDisclaimerAccepted(isAccepted);
  };

  // Check if user details are complete but disclaimer is not
  const hasUserDetails = userProfile?.completionStatus?.hasUserDetails;
  const hasDisclaimer = userProfile?.completionStatus?.hasDisclaimer;
  const showDisclaimerOnly = hasUserDetails && !hasDisclaimer;
  // const showDisclaimerOnly = false;

  // Trigger animation
  React.useEffect(() => {
    if (showDisclaimerOnly) {
      animateHeight(showDisclaimerOnly);
    }
  }, [showDisclaimerOnly]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#FFD700", "#FF8A00", "#FF6B00", "#E74C3C", "#8B1538"]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.contentSection}>
          <Animated.View
            style={[
              animatedStyle,
              showDisclaimerOnly
                ? styles.fullDisclaimerContainer
                : styles.disclaimerContainer,
            ]}
          >
            <DisclaimerSection
              onDisclaimerChange={handleDisclaimerChange}
              isExpanded={showDisclaimerOnly}
              language={userProfile.language}
              autoScroll={true}
              scrollSpeed={3000}
              enableLineHighlighting={true}
              loopReading={false}
              onReadingComplete={() =>
                console.log("Disclaimer reading completed")
              }
            />
          </Animated.View>

          {!showDisclaimerOnly && (
            <View style={styles.detailsContainer}>
              <DetailsSection
                onAgeChange={handleAgeChange}
                onGenderChange={handleGenderChange}
                selectedAge={selectedAge}
                selectedGender={selectedGender}
                dispatch={dispatch}
              />
            </View>
          )}
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
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  contentSection: {
    flex: 1,
  },
  disclaimerContainer: {
    height: "25%",
    marginBottom: 10,
  },
  fullDisclaimerContainer: {
    height: "100%",
  },
  detailsContainer: {
    height: "75%",
    paddingTop: 10,
  },
});
