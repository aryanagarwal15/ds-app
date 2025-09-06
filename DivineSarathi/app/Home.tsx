import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  FlatList,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import changeNavigationBarColor from "react-native-navigation-bar-color";
import * as SystemUI from "expo-system-ui";
import { useDispatch } from "react-redux";
import { logoutUser } from "../redux/auth/slice";
import type { AppDispatch } from "../redux/store";
import { router } from "expo-router";

// Import custom hooks and utilities
import { usePermissions } from "../hooks/usePermissions";
import { useAnimations } from "../hooks/useAnimations";
import { useWebRTC } from "../hooks/useWebRTC";
import { useRecording } from "../hooks/useRecording";
import type { ConnectionState } from "../types/audio";

// Import components
import MainInterface from "../components/MainInterface";
import ConversationView from "../components/ConversationView";

const { width } = Dimensions.get("window");

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Main state
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Simplified conversation system
  const [conversations, setConversations] = useState<
    {
      id: string;
      userMessage: string;
      krishnaResponse: string;
      timestamp: Date;
      isComplete: boolean;
    }[]
  >([]);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const conversationScrollRef = useRef<FlatList>(null);

  // Current active conversation
  const [activeConversation, setActiveConversation] = useState<{
    id: string;
    userMessage: string;
    krishnaResponse: string;
    displayedUserMessage: string;
    displayedKrishnaResponse: string;
    isUserComplete: boolean;
    isKrishnaComplete: boolean;
    isTyping: boolean;
  } | null>(null);

  // Removed typewriter effect refs

  // Ref to track if conversation is being completed to prevent loops
  const isCompletingRef = useRef(false);
  const lastCompletedIdRef = useRef<string | null>(null);

  // Auto-scroll control state - tracks if user is at bottom
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [userHasManuallyScrolled, setUserHasManuallyScrolled] = useState(false);

  // Memoized scroll handlers to prevent re-renders
  const handleScrollBeginDrag = useCallback(() => {
    setUserHasManuallyScrolled(true);
  }, []);

  const handleScrollEndDrag = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 10;
    setIsUserAtBottom(isAtBottom);
    if (isAtBottom) {
      setUserHasManuallyScrolled(false);
    }
  }, []);

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 10;
    setIsUserAtBottom(isAtBottom);
    if (isAtBottom) {
      setUserHasManuallyScrolled(false);
    }
  }, []);

  // Animation refs for typing indicator
  const typingDot1Anim = useRef(new Animated.Value(0.3)).current;
  const typingDot2Anim = useRef(new Animated.Value(0.3)).current;
  const typingDot3Anim = useRef(new Animated.Value(0.3)).current;

  // Custom hooks
  const {
    checkPermissions,
    checkIfSimulator,
    localStreamRef,
    cleanupLocalStream,
  } = usePermissions(setError);

  const {
    pulseAnim,
    rippleAnim,
    fadeAnim,
    startPulseAnimation,
    stopPulseAnimation,
    startRippleAnimation,
    stopRippleAnimation,
  } = useAnimations(transcript, response);

  // Add circleScaleAnim for MainInterface component
  const circleScaleAnim = useRef(new Animated.Value(1)).current;

  const { dataChannelRef, connectToRealtime, cleanup } = useWebRTC(
    setConnectionState,
    setError,
    setTranscript,
    setResponse,
    startRippleAnimation,
    stopRippleAnimation,
    localStreamRef
  );

  const {
    startRecording,
    stopRecording,
    handleMuteToggle: toggleMute,
  } = useRecording(
    connectionState,
    isRecording,
    setIsRecording,
    setConnectionState,
    setTranscript,
    setResponse,
    setError,
    dataChannelRef,
    localStreamRef,
    startPulseAnimation,
    stopPulseAnimation
  );

  // Handle profile navigation
  const handleProfileNavigation = useCallback(() => {
    // router.push('/profile'); // Uncomment when profile route is created
  }, []);

  // Typing indicator animation
  const startTypingAnimation = useCallback(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotAnimation(typingDot1Anim, 0),
      createDotAnimation(typingDot2Anim, 200),
      createDotAnimation(typingDot3Anim, 400),
    ]).start();
  }, [typingDot1Anim, typingDot2Anim, typingDot3Anim]);

  const stopTypingAnimation = useCallback(() => {
    typingDot1Anim.stopAnimation();
    typingDot2Anim.stopAnimation();
    typingDot3Anim.stopAnimation();

    // Reset to default state
    typingDot1Anim.setValue(0.3);
    typingDot2Anim.setValue(0.3);
    typingDot3Anim.setValue(0.3);
  }, [typingDot1Anim, typingDot2Anim, typingDot3Anim]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Clean up local state
      cleanup();
      cleanupLocalStream();
      setIsRecording(false);
      setTranscript("");
      setResponse("");
      stopPulseAnimation();
      stopRippleAnimation();
      
      // Perform complete logout (clears Redux store and AsyncStorage)
      await dispatch(logoutUser() as any);
      
      // Navigate to onboarding
      router.replace("/Onboarding");
    } catch (error) {
      console.error("Error during logout:", error);
      // Still navigate even if logout fails
      router.replace("/Onboarding");
    }
  }, [
    cleanup,
    cleanupLocalStream,
    dispatch,
    stopPulseAnimation,
    stopRippleAnimation,
    router,
  ]);

  // Start a new conversation when recording begins
  const startNewConversation = useCallback(() => {
    // Reset completion tracking for new conversation
    lastCompletedIdRef.current = null;

    const newConversation = {
      id: Date.now().toString(),
      userMessage: "",
      krishnaResponse: "",
      displayedUserMessage: "",
      displayedKrishnaResponse: "",
      isUserComplete: false,
      isKrishnaComplete: false,
      isTyping: false,
    };
    setActiveConversation(newConversation);
  }, []);

  // Handle mute/unmute
  const handleMuteToggle = useCallback(() => {
    const newMutedState = toggleMute();
    setIsMuted(newMutedState);
  }, [toggleMute]);

  // Handle connect/disconnect
  const handleConnectionToggle = useCallback(async () => {
    if (connectionState === "idle" || connectionState === "error") {
      const permissionGranted = await checkPermissions();
      if (permissionGranted) {
        await connectToRealtime();
      }
    } else {
      cleanup();
      cleanupLocalStream();
      setIsRecording(false);
      setTranscript("");
      setResponse("");
      stopPulseAnimation();
      stopRippleAnimation();
    }
  }, [
    connectionState,
    checkPermissions,
    connectToRealtime,
    cleanup,
    cleanupLocalStream,
    stopPulseAnimation,
    stopRippleAnimation,
  ]);

  // Handle main button press
  const handlePress = useCallback(async () => {
    switch (connectionState) {
      case "idle":
      case "error":
        const permissionGranted = await checkPermissions();
        if (permissionGranted) {
          await connectToRealtime();
        }
        break;

      case "connected":
        startNewConversation();
        setUserHasManuallyScrolled(false);
        setIsUserAtBottom(true);
        startRecording();
        break;

      case "speaking":
        stopRecording();
        break;

      default:
        break;
    }
  }, [
    connectionState,
    checkPermissions,
    connectToRealtime,
    startRecording,
    stopRecording,
    startNewConversation,
  ]);

  // Complete active conversation and move to history
  const completeActiveConversation = useCallback(() => {
    if (
      !activeConversation ||
      !activeConversation.isUserComplete ||
      !activeConversation.isKrishnaComplete ||
      isCompletingRef.current ||
      !activeConversation.userMessage ||
      !activeConversation.krishnaResponse ||
      lastCompletedIdRef.current === activeConversation.id
    ) {
      return;
    }

    console.log("Starting conversation completion for:", activeConversation.id);
    isCompletingRef.current = true;
    lastCompletedIdRef.current = activeConversation.id;

    const completedConversation = {
      id: activeConversation.id,
      userMessage: activeConversation.userMessage,
      krishnaResponse: activeConversation.krishnaResponse,
      timestamp: new Date(),
      isComplete: true,
    };

    setConversations((prev) => {
      const alreadyExists = prev.some(
        (conv) => conv.id === activeConversation.id
      );
      console.log(
        "Completing conversation:",
        activeConversation.id,
        "Already exists:",
        alreadyExists,
        "Total conversations:",
        prev.length
      );
      if (alreadyExists) {
        console.log("Conversation already exists, skipping addition");
        isCompletingRef.current = false;
        return prev;
      }
      console.log("Adding new conversation to history");
      return [...prev, completedConversation];
    });

    // Clear active conversation, transcript/response, and reset completion flag immediately
    setTranscript("");
    setResponse("");
    setActiveConversation(null);
    isCompletingRef.current = false;
    console.log("Conversation completion process finished");
  }, [
    activeConversation?.id,
    activeConversation?.userMessage,
    activeConversation?.krishnaResponse,
    activeConversation?.isUserComplete,
    activeConversation?.isKrishnaComplete,
  ]);

  // Handle conversation change
  const onConversationChange = useCallback((index: number) => {
    setCurrentConversationIndex(index);
  }, []);

  // Removed typewriter effect for user messages

  // Removed typewriter effect for Krishna responses

  // Removed typewriter timeout clearing functions

  // Check for simulator on mount
  useEffect(() => {
    checkIfSimulator();
  }, [checkIfSimulator]);

  // Configure navigation bar colors for Android
  useEffect(() => {
    const configureSystemBars = async () => {
      if (Platform.OS === "android") {
        try {
          await SystemUI.setBackgroundColorAsync("#1a1a2e");
        } catch (systemUIError) {
          try {
            changeNavigationBarColor("#1a1a2e", true);
          } catch (navBarError) {
            console.log("Navigation bar configuration error:", navBarError);
          }
        }
      }
    };

    configureSystemBars();
  }, []);

  // Handle transcript updates
  useEffect(() => {
    if (!transcript) return;

    if (activeConversation) {
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              userMessage: transcript,
              displayedUserMessage: transcript, // Immediately display full message
              isUserComplete: true,
            }
          : null
      );
    } else {
      const newConversation = {
        id: Date.now().toString(),
        userMessage: transcript,
        krishnaResponse: "",
        displayedUserMessage: transcript, // Immediately display full message
        displayedKrishnaResponse: "",
        isUserComplete: true,
        isKrishnaComplete: false,
        isTyping: false,
      };
      setActiveConversation(newConversation);
    }
  }, [transcript, activeConversation?.id]);

  // Handle response updates
  useEffect(() => {
    if (!response) return;

    if (activeConversation) {
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              krishnaResponse: response,
              displayedKrishnaResponse: response, // Immediately display full response
              isKrishnaComplete:
                response.length > 0 &&
                !isRecording &&
                connectionState !== "listening",
              isTyping: response.length > 0 && connectionState === "listening",
            }
          : null
      );
    } else {
      const newConversation = {
        id: Date.now().toString(),
        userMessage: "",
        krishnaResponse: response,
        displayedUserMessage: "",
        displayedKrishnaResponse: response, // Immediately display full response
        isUserComplete: false,
        isKrishnaComplete:
          response.length > 0 &&
          !isRecording &&
          connectionState !== "listening",
        isTyping: false,
      };
      setActiveConversation(newConversation);
    }
  }, [response, activeConversation?.id, isRecording, connectionState]);

  // Memoize the completion check to prevent unnecessary re-renders
  const shouldCompleteConversation = useMemo(() => {
    return (
      activeConversation?.isUserComplete &&
      activeConversation?.isKrishnaComplete &&
      !isCompletingRef.current &&
      activeConversation?.userMessage &&
      activeConversation?.krishnaResponse
    );
  }, [
    activeConversation?.isUserComplete,
    activeConversation?.isKrishnaComplete,
    activeConversation?.userMessage,
    activeConversation?.krishnaResponse,
  ]);

  // Auto-complete conversation when both parts are ready
  useEffect(() => {
    if (shouldCompleteConversation) {
      completeActiveConversation();
    }
  }, [shouldCompleteConversation, completeActiveConversation]);

  // Removed typewriter effect handlers

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      cleanupLocalStream();
      stopPulseAnimation();
      stopRippleAnimation();
      stopTypingAnimation();
    };
  }, [
    cleanup,
    cleanupLocalStream,
    stopPulseAnimation,
    stopRippleAnimation,
    stopTypingAnimation,
  ]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {Platform.OS === "ios" && <SafeAreaView style={styles.statusBarArea} />}
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#1a1a2e"
          translucent={false}
        />

        <LinearGradient
          colors={["#1a1a2e", "#16213e", "#0f3460"]}
          style={styles.gradient}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={handleProfileNavigation}
                style={styles.profileButton}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={28}
                  color="#D4A574"
                />
              </TouchableOpacity>
              <Text style={styles.title}>DIVINE SARATHI</Text>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Ionicons name="log-out-outline" size={24} color="#D4A574" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Connection Status Bar */}
          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusIndicator,
                connectionState === "connected" && styles.statusConnected,
                connectionState === "connecting" && styles.statusConnecting,
                connectionState === "error" && styles.statusError,
              ]}
            />
            <Text style={styles.statusText}>
              {connectionState === "idle"
                ? "Ready to connect"
                : connectionState === "connecting"
                ? "Connecting to Krishna Ji..."
                : connectionState === "connected"
                ? "Connected to Krishna Ji"
                : connectionState === "speaking"
                ? "You are speaking..."
                : connectionState === "listening"
                ? "Krishna Ji is listening..."
                : "Connection error"}
            </Text>
          </View>

          {/* Main Content Area with Horizontal Scrolling - Only 2 Pages */}
          <View style={styles.mainContentWrapper}>
            <FlatList
              ref={conversationScrollRef}
              data={[
                { id: "main", type: "main" },
                { id: "conversations", type: "conversations" },
              ]}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / width
                );
                onConversationChange(index);
              }}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.mainContentPage}>
                  {item.type === "main" ? (
                    <MainInterface
                      connectionState={connectionState}
                      pulseAnim={pulseAnim}
                      rippleAnim={rippleAnim}
                      fadeAnim={fadeAnim}
                      circleScaleAnim={circleScaleAnim}
                      conversations={conversations}
                      activeConversation={activeConversation}
                      onPress={handlePress}
                    />
                  ) : (
                    <ConversationView
                      conversations={conversations}
                      activeConversation={activeConversation}
                      typingDot1Anim={typingDot1Anim}
                      typingDot2Anim={typingDot2Anim}
                      typingDot3Anim={typingDot3Anim}
                      isUserAtBottom={isUserAtBottom}
                      userHasManuallyScrolled={userHasManuallyScrolled}
                      onScrollBeginDrag={handleScrollBeginDrag}
                      onScrollEndDrag={handleScrollEndDrag}
                      onMomentumScrollEnd={handleMomentumScrollEnd}
                    />
                  )}
                </View>
              )}
            />

            {/* Simple 2-dot pagination */}
            <View style={styles.mainPaginationDots}>
              <View
                style={[
                  styles.mainPaginationDot,
                  currentConversationIndex === 0 &&
                    styles.mainPaginationDotActive,
                ]}
              />
              <View
                style={[
                  styles.mainPaginationDot,
                  currentConversationIndex === 1 &&
                    styles.mainPaginationDotActive,
                ]}
              />
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                isMuted && styles.controlButtonActive,
              ]}
              onPress={handleMuteToggle}
              disabled={connectionState === "idle"}
            >
              <Ionicons
                name={isMuted ? "mic-off" : "mic"}
                size={24}
                color={isMuted ? "#ff6b6b" : "#D4A574"}
              />
              <Text
                style={[
                  styles.controlButtonText,
                  isMuted && styles.controlButtonTextActive,
                ]}
              >
                {isMuted ? "Unmute" : "Mute"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                (connectionState === "connected" ||
                  connectionState === "speaking" ||
                  connectionState === "listening") &&
                  styles.controlButtonConnected,
              ]}
              onPress={handleConnectionToggle}
            >
              <Ionicons
                name={
                  connectionState === "connected" ||
                  connectionState === "speaking" ||
                  connectionState === "listening"
                    ? "stop"
                    : "play"
                }
                size={24}
                color={
                  connectionState === "connected" ||
                  connectionState === "speaking" ||
                  connectionState === "listening"
                    ? "#ff6b6b"
                    : "#4ecdc4"
                }
              />
              <Text
                style={[
                  styles.controlButtonText,
                  (connectionState === "connected" ||
                    connectionState === "speaking" ||
                    connectionState === "listening") &&
                    styles.controlButtonTextDisconnect,
                ]}
              >
                {connectionState === "connected" ||
                connectionState === "speaking" ||
                connectionState === "listening"
                  ? "Disconnect"
                  : "Connect"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.clearErrorButton}
                onPress={() => setError(null)}
              >
                <Ionicons name="close" size={16} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  statusBarArea: {
    flex: 0,
    backgroundColor: "#1a1a2e",
  },
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#D4A574",
    letterSpacing: 2,
    textAlign: "center",
  },
  logoutButton: {
    padding: 8,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#666",
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: "#4ecdc4",
  },
  statusConnecting: {
    backgroundColor: "#f9ca24",
  },
  statusError: {
    backgroundColor: "#ff6b6b",
  },
  statusText: {
    fontSize: 14,
    color: "#D4A574",
    fontWeight: "500",
  },
  mainContentWrapper: {
    flex: 1,
  },
  mainContentPage: {
    width: width,
    flex: 1,
  },
  mainPaginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  mainPaginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(212, 165, 116, 0.3)",
    marginHorizontal: 3,
  },
  mainPaginationDotActive: {
    backgroundColor: "#D4A574",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    paddingBottom: 30,
    paddingTop: 20,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 100,
  },
  controlButtonActive: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
  },
  controlButtonConnected: {
    backgroundColor: "rgba(78, 205, 196, 0.2)",
  },
  controlButtonText: {
    fontSize: 12,
    color: "#D4A574",
    marginTop: 4,
    fontWeight: "600",
  },
  controlButtonTextActive: {
    color: "#ff6b6b",
  },
  controlButtonTextDisconnect: {
    color: "#ff6b6b",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  clearErrorButton: {
    padding: 4,
  },
});

export default Home;
