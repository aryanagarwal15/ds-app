import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { ConnectionState } from "../types/audio";

const { width, height } = Dimensions.get("window");

const MIN_CHAT_HEIGHT = 0.15 * height;
// if screen is long then 0.95 is sceen is short then 0.85

const MAX_CHAT_HEIGHT = 0.85 * height;
const BUTTON_SIZE = 64;
const BUTTON_GAP = 14;
const SCREEN_PADDING = 20;

const clamp = (value: number, lower: number, upper: number) => {
  "worklet";
  return Math.min(Math.max(value, lower), upper);
};

interface KrishnaTalkInterfaceProps {
  connectionState: ConnectionState;
  isRecording: boolean;
  transcript: string;
  response: string;
  isMuted: boolean;
  onMuteToggle: () => void;
  onConnectionToggle: () => void;
  chatTranscript: ChatMessage[];
  activeConversation: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  isComplete: boolean;
}


const KrishnaTalkInterface: React.FC<KrishnaTalkInterfaceProps> = ({
  connectionState,
  isRecording,
  transcript,
  response,
  chatTranscript,
  isMuted,
  onMuteToggle,
  onConnectionToggle,
  activeConversation
}) => {
  const isDragging = useSharedValue(0);
  const chatBottomMargin = useSharedValue(MIN_CHAT_HEIGHT);
  const previousTranslationY = useSharedValue(0);
  const horizontalScrollViewRef = useRef<ScrollView>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  console.log("chatTranscript", chatTranscript);

  // progress 0->collapsed, 1->expanded
  const expansionProgress = useDerivedValue(() => {
    return (
      (chatBottomMargin.value - MIN_CHAT_HEIGHT) /
      (MAX_CHAT_HEIGHT - MIN_CHAT_HEIGHT)
    );
  }, []);

  const handleCarouselScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollPosition / width);
    setActiveCarouselIndex(newIndex);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = 1;
    })
    .onUpdate((event) => {
      const nextMargin =
        chatBottomMargin.value +
        event.translationY -
        previousTranslationY.value;
      previousTranslationY.value = event.translationY;
      chatBottomMargin.value = clamp(
        nextMargin,
        MIN_CHAT_HEIGHT,
        MAX_CHAT_HEIGHT
      );
    })
    .onFinalize(() => {
      isDragging.value = 0;
      previousTranslationY.value = 0;
      const midPoint = (MIN_CHAT_HEIGHT + MAX_CHAT_HEIGHT) / 2;
      const targetHeight =
        chatBottomMargin.value > midPoint ? MAX_CHAT_HEIGHT : MIN_CHAT_HEIGHT;
      chatBottomMargin.value = withSpring(targetHeight, {
        damping: 18,
        stiffness: 220,
      });
    });

  const chatContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      top: chatBottomMargin.value,
    };
  });

  const fadeOutOnExpansionStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - expansionProgress.value * 2,
    };
  });

  const buttonScaleAnimatedStyle = useAnimatedStyle(() => {
    const maxButtonSize = BUTTON_SIZE;
    const minButtonSize = BUTTON_SIZE - 8;
    const currentButtonSize =
      maxButtonSize - (maxButtonSize - minButtonSize) * expansionProgress.value;
    return { width: currentButtonSize, height: currentButtonSize };
  });

  const leftButtonPositionStyle = useAnimatedStyle(() => {
    const minRightPosition = width - BUTTON_SIZE - SCREEN_PADDING;
    const maxRightPosition = BUTTON_SIZE + SCREEN_PADDING + BUTTON_GAP;
    const currentRightPosition =
      minRightPosition +
      (maxRightPosition - minRightPosition) * expansionProgress.value;
    return {
      right: currentRightPosition,
    };
  });

  const renderChatMessage = (
    sender: string,
    message: string,
    isUser: boolean,
  ) => (
    <View style={styles.messageContainer}>
      <View
        style={[
          styles.messageWrapper,
          isUser ? styles.userMessageWrapper : styles.krishnaMessageWrapper,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
          ]}
        >
          <Text style={styles.senderLabel}>{sender}</Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[styles.dragIndicatorContainer, chatContainerAnimatedStyle]}
        >
          <View style={styles.dragIndicatorWrapper}>
            <View style={styles.dragIndicator} />
          </View>
        </Animated.View>
      </GestureDetector>

      <Animated.View style={[styles.chatContainer, chatContainerAnimatedStyle]}>
        <Animated.View style={[fadeOutOnExpansionStyle, { flex: 1 }]}>
          <View style={styles.chatContentContainer}>
            <ScrollView
              ref={horizontalScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width}
              snapToAlignment="start"
              decelerationRate="fast"
              scrollEventThrottle={16}
              onScroll={handleCarouselScroll}
              style={styles.horizontalScrollView}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              <View style={styles.krishnaIntroScreen}>
                <Text style={styles.krishnaIntroText}>
                  You are talking to Krishna Ji
                </Text>
                <LinearGradient
                  colors={["#fce38a", "#f38ba8", "#f9ca24"]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                ></LinearGradient>
              </View>

              <View style={styles.chatMessagesScreen}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {chatTranscript.map((message) => renderChatMessage(message.sender, message.message, message.sender === "user"))}
                  {activeConversation && renderChatMessage("Krishna Ji", activeConversation, false)}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.carouselIndicatorContainer}>
              <View
                style={[
                  styles.carouselDot,
                  activeCarouselIndex === 0 && styles.activeCarouselDot,
                ]}
              />
              <View
                style={[
                  styles.carouselDot,
                  activeCarouselIndex === 1 && styles.activeCarouselDot,
                ]}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      <View style={styles.floatingButtonsContainer}>
        <Animated.View
          style={[
            styles.floatingButton,
            styles.leftFloatingButton,
            leftButtonPositionStyle,
            buttonScaleAnimatedStyle,
          ]}
        >
          <Pressable
            style={[
              styles.floatingButtonInner,
              isMuted && styles.floatingButtonMuted,
            ]}
            onPress={onMuteToggle}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={24}
              color={isMuted ? "#ff6b6b" : "#4ecdc4"}
            />
          </Pressable>
        </Animated.View>
        <Animated.View
          style={[
            styles.floatingButton,
            styles.rightFloatingButton,
            buttonScaleAnimatedStyle,
          ]}
        >
          <Pressable
            style={[
              styles.floatingButtonInner,
              (connectionState === "connected" ||
                connectionState === "speaking" ||
                connectionState === "listening") &&
                styles.floatingButtonConnected,
            ]}
            onPress={onConnectionToggle}
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
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    position: "absolute",
    zIndex: 2,
    left: 0,
    right: 0,
    backgroundColor: "#0f0",
    maxHeight: 0.95 * height,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    bottom: 0,
  },
  dragIndicatorContainer: {
    flex: 1,
    position: "absolute",
    zIndex: 3,
    left: 0,
    right: 0,
  },
  dragIndicatorWrapper: {
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 32,
    justifyContent: "center",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  dragIndicator: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#111",
  },
  chatContentContainer: {
    position: "absolute",
    top: 36,
    left: 0,
    right: 0,
    flex: 1,
  },
  horizontalScrollView: {
    flex: 1,
    marginTop: 16,
  },
  horizontalScrollContent: {
    flexDirection: "row",
  },
  krishnaIntroScreen: {
    width: width,
    alignItems: "center",
    marginTop: 32,
  },
  krishnaIntroText: {
    textAlign: "center",
    color: "#222",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 32,
  },
  gradientButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  chatMessagesScreen: {
    width: width,
    padding: 16,
    maxHeight: 0.6 * height,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageWrapper: {
    marginBottom: 8,
  },
  userMessageWrapper: {
    alignItems: "flex-end",
  },
  krishnaMessageWrapper: {
    alignItems: "flex-start",
  },
  messageBubble: {
    backgroundColor: "#f8b4b8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: "80%",
  },
  messageBubbleWithBorder: {
    borderWidth: 2,
    borderColor: "#4a90e2",
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 2,
  },
  messageText: {
    color: "#333",
  },
  carouselIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    top: 0,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeCarouselDot: {
    backgroundColor: "#000",
  },
  floatingButtonsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  floatingButton: {
    position: "absolute",
    bottom: 26,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  leftFloatingButton: {
    marginLeft: SCREEN_PADDING,
  },
  rightFloatingButton: {
    right: SCREEN_PADDING,
  },
  floatingButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f29ca3",
    borderRadius: BUTTON_SIZE / 2,
  },
  floatingButtonConnected: {
    backgroundColor: "rgba(78, 205, 196, 0.8)",
  },
  floatingButtonMuted: {
    backgroundColor: "rgba(255, 107, 107, 0.8)",
  },
});

export default KrishnaTalkInterface;
