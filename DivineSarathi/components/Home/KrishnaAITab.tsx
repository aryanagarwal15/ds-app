import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { ConnectionState } from "@/types/audio";
import { ChatMessage } from "@/types/audio";

const { width, height } = Dimensions.get("window");

const BUTTON_SIZE = 64;
const SCREEN_PADDING = 20;

const KrishnaAITab = ({
  fullscreen,
  connectionState,
  isRecording,
  transcript,
  response,
  chatTranscript,
  isMuted,
  onMuteToggle,
  onConnectionToggle,
  activeConversation,
  isKrishnaInterfaceOpen,
  setIsKrishnaInterfaceOpen,
  storyTitle,
}: {
  fullscreen: boolean;
  connectionState: ConnectionState;
  isRecording: boolean;
  transcript: string;
  response: string;
  chatTranscript: ChatMessage[];
  isMuted: boolean;
  onMuteToggle: () => void;
  onConnectionToggle: (storyId: string) => void;
  activeConversation: string;
  isKrishnaInterfaceOpen: boolean;
  setIsKrishnaInterfaceOpen: (isOpen: boolean) => void;
  storyTitle: string;
}) => {
  // Animated values for container, top section, and bottom section
  const containerAnim = useRef(new Animated.Value(0)).current; // 0: mini, 1: fullscreen
  const topAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const horizontalScrollViewRef = useRef<ScrollView>(null);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);

  useEffect(() => {
    // Animate all together
    Animated.parallel([
      Animated.timing(containerAnim, {
        toValue: fullscreen ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(topAnim, {
        toValue: fullscreen ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(bottomAnim, {
        toValue: fullscreen ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [fullscreen]);

  const renderChatMessage = (
    sender: string,
    message: string,
    isUser: boolean
  ) => (
    <View style={styles.messageContainer}>
      <View
        style={[
          styles.messageWrapper,
          isUser ? styles.userMessageWrapper : styles.krishnaMessageWrapper,
        ]}
      >
        <View style={styles.messageBubble}>
          <Text style={styles.senderLabel}>{sender}</Text>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      </View>
    </View>
  );

  const handleCarouselScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollPosition / width);
    setActiveCarouselIndex(newIndex);
  };

  // Interpolate container style
  const containerStyle = {
    position: "absolute" as const,
    left: containerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [24, 0],
    }),
    right: containerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [24, 0],
    }),
    bottom: containerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [116, 0],
    }),
    top: containerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [undefined, 0],
    }),
    height: containerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [48, height],
    }),
    backgroundColor: "#E5F5FF",
    borderRadius: containerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [24, 0],
    }),
    zIndex: 2,
    overflow: "hidden" as const,
    alignItems: "center" as const,
    justifyContent: "flex-start" as const,
  };

  // Top section: image and text
  const topSectionStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginTop: topAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Platform.OS === "ios" ? 64 : 32],
    }),
    opacity: topAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1],
    }),
  };

  // Bottom section: play and mic buttons
  const bottomSectionStyle = {
    position: "absolute" as const,
    left: 0,
    right: 0,
    bottom: bottomAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0],
    }),
    alignItems: "center" as const,
    justifyContent: "center" as const,
    opacity: bottomAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    flexDirection: "row" as const,
  };

  // Mini mode: show play/mic inline, fullscreen: show at bottom
  return (
    <Animated.View style={containerStyle}>
      <Animated.View style={topSectionStyle}>
        {/* Image on the left */}
        <View style={{ marginRight: 12 }}>
          <Ionicons
            name="person-circle-outline"
            size={fullscreen ? 64 : 36}
            color="#A88B5B"
          />
        </View>
        {/* Text in the middle, flex: 1 to take available space */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: fullscreen ? 22 : 16,
              fontWeight: "600",
              color: "#000",
            }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {storyTitle}
          </Text>
        </View>

        {fullscreen && (
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
                {/* //add FFEFA2 color filled circle here  */}
                <View style={styles.krishnaMainInterface}></View>
              </View>

              <View style={styles.chatMessagesScreen}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={{ height: 0.3 * height }}
                >
                  {chatTranscript.length === 0 && !activeConversation ? (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.emptyStateText}>
                        Your chat with Krishna Ji will show here
                      </Text>
                    </View>
                  ) : (
                    <>
                      {chatTranscript.map((message) =>
                        renderChatMessage(
                          message.sender,
                          message.message,
                          message.sender === "user"
                        )
                      )}
                      {activeConversation &&
                        renderChatMessage(
                          "Krishna Ji",
                          activeConversation,
                          false
                        )}
                    </>
                  )}
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
            <Text style={styles.krishnaIntroText}>
              You are talking to Krishna Ji
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "60%",
                alignSelf: "center",
              }}
            >
              <TouchableOpacity onPress={() => onConnectionToggle("")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#FFA34450",
                    borderRadius: 24,
                    paddingHorizontal: 32,
                    paddingVertical: 12,
                  }}
                >
                  {connectionState === "connected" ||
                  connectionState === "speaking" ||
                  connectionState === "listening" ? (
                    <Ionicons name="stop" size={32} color="#000" />
                  ) : (
                    <Ionicons name="play-outline" size={32} color="#000" />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onMuteToggle()}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#FFA34450",
                    borderRadius: 24,
                    paddingHorizontal: 32,
                    paddingVertical: 12,
                  }}
                >
                  {isMuted ? (
                    <Ionicons name="mic-off" size={32} color="#000" />
                  ) : (
                    <Ionicons name="mic" size={32} color="#000" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {/* Play and mic buttons on the right (mini mode only) */}
        {!fullscreen && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="play-outline"
              size={24}
              color="#000"
              style={{ marginRight: 16 }}
            />
            <Ionicons name="mic" size={24} color="#000" />
          </View>
        )}
      </Animated.View>
      {/* Play and mic buttons at the bottom (fullscreen only, with animation) */}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    position: "absolute",
    zIndex: 2,
    left: 0,
    right: 0,
    maxHeight: 0.95 * height,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    bottom: 0,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
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
    top: 140,
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
    color: "#8B5A3C",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 32,
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: 32,
  },
  gradientButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  senderLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#8B5A3C",
    marginBottom: 2,
  },
  messageText: {
    color: "#2C2C2C",
    fontSize: 14,
    lineHeight: 18,
  },
  carouselIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    top: 0,
    marginTop: 32,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(139, 90, 60, 0.3)",
    marginHorizontal: 5,
  },
  activeCarouselDot: {
    backgroundColor: "#8B5A3C",
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: BUTTON_SIZE / 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingButtonConnected: {
    backgroundColor: "rgba(139, 90, 60, 0.9)",
  },
  floatingButtonMuted: {
    backgroundColor: "rgba(220, 85, 85, 0.9)",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 100,
    lineHeight: 22,
  },
  krishnaMainInterface: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFEFA2",
  },
});

export default KrishnaAITab;
