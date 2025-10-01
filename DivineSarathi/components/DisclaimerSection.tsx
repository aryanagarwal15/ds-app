import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { saveDisclaimerAcceptance } from "../redux/auth/slice";
import { useDispatch } from "react-redux";
import { useAudioContext } from "../contexts/AudioContext";

const { height: screenHeight } = Dimensions.get("window");

// Disclaimer text in both languages
const disclaimerLines = {
  english: [
    "Namaste, dear one.",
    "Before we begin, I'd like to share",
    "a few words to guide your experience.",
    "You may listen to my voice as you",
    "fill in the details below.",
    "",
    "DivineSarathi is not a place",
    "for medical advice.",
    "It does not offer predictions",
    "or astrological readings.",
    "Instead, it shares timeless wisdom —",
    "for you to reflect upon.",
    "",
    "This is not just a chatbot",
    "that gives you information.",
    "It is your companion — drawing from",
    "our scriptures to guide you inward.",
    "",
    "Every word you hear is rooted",
    "in the Gita, the Puranas,",
    "and the wisdom of our sages.",
    "We do not preach, nor claim",
    "absolute truth.",
    "",
    "With care and reverence, we share",
    "the wisdom passed down through",
    "our ancient texts.",
    "",
    "We hold deep respect for all beliefs.",
    "If something does not resonate",
    "with you, please gently let it pass.",
    "",
    "This space is sacred.",
    "We assure you that your personal",
    "data is safe, secure, and your",
    "voice is never recorded.",
    "",
    "Take a breath.",
    "Let us begin.",
  ],
  hindi: [
    "नमस्ते प्रिय भक्त",
    "शुरू करने से पहले, मैं कुछ बातें",
    "कहना चाहता हूँ — जो आपके अनुभव को",
    "और भी सार्थक बनाएँगी।",
    "आप मुझे सुनते समय नीचे दिए गए",
    "प्रश्नों का उत्तर दे सकते हैं।",
    "",
    "DivineSarathi कोई मेडिकल सलाह",
    "देने का स्थान नहीं है।",
    "हम न तो भविष्यवाणी करते हैं,",
    "न ही ज्योतिष उपाय देते हैं।",
    "हम केवल सनातन ज्ञान प्रस्तुत करते हैं —",
    "आत्म-चिंतन के लिए।",
    "",
    "यह सिर्फ़ जानकारी देने वाला",
    "चैटबॉट नहीं है।",
    "इसे अपना सारथि मानें — जो शास्त्रों से",
    "प्रेरणा लेकर, आपको भीतर की ओर",
    "देखने का आमंत्रण देता है।",
    "",
    "आप जो भी सुनेंगे, वह भगवद्गीता,",
    "पुराणों और हमारे ऋषियों की",
    "शिक्षाओं पर आधारित है।",
    "",
    "हम न तो प्रवचन देते हैं,",
    "न ही पूर्ण सत्य का दावा करते हैं।",
    "",
    "हम निष्ठा और कोमलता से वही",
    "प्रस्तुत करते हैं — जो हमारे",
    "शास्त्रों में लिखा है।",
    "",
    "हम सभी धर्मों और विचार",
    "धाराओं का आदर करते हैं।",
    "",
    "यदि कुछ आपसे न जुड़ पाए...",
    "तो कृपया उसे अनदेखा करें।",
    "",
    "यह स्थान पवित्र है।",
    "हम आपको आश्वासन करते हैं कि आपकी",
    "निजी जानकारी सुरक्षित है और आपकी",
    "आवाज़ रिकॉर्ड नहीं की जाती।",
    "",
    "एक गहरी साँस लें।",
    "आइए, आरंभ करें।",
  ],
};

interface DisclaimerSectionProps {
  onDisclaimerChange: (isAccepted: boolean) => void;
  isExpanded?: boolean;
  language?: "english" | "hindi";
  autoScroll?: boolean;
  scrollSpeed?: number; // milliseconds per line
  onLineChange?: (lineIndex: number, line: string) => void; // callback for voice-over sync
  voiceOverTimings?: number[]; // array of milliseconds for each line timing
  enableLineHighlighting?: boolean; // separate control for line highlighting (voice-over sync)
  loopReading?: boolean; // whether to loop the reading or play once
  onReadingComplete?: () => void; // callback when reading completes (for single play)
}

export default function DisclaimerSection({
  onDisclaimerChange,
  isExpanded = false,
  language = "english",
  autoScroll = true,
  scrollSpeed = 3000,
  onLineChange,
  voiceOverTimings,
  enableLineHighlighting = true,
  loopReading = false,
  onReadingComplete,
}: DisclaimerSectionProps) {
  const dispatch = useDispatch();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const scrollAnimatedValue = useRef(new Animated.Value(0)).current;
  const highlightAnimatedValue = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const highlightIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const scrollViewRef = useRef<ScrollView>(null);
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const { disclaimerAudio, pauseAllAudio, resumeAllAudio } = useAudioContext();

  const lines = disclaimerLines[language];
  const lineHeight = 24;
  const containerHeight = isExpanded ? screenHeight * 0.8 : screenHeight * 0.25;
  const visibleLines = Math.floor(containerHeight / lineHeight) - 2; // Reserve space for title and button

  // Function to scroll to the current line in full page view
  const scrollToCurrentLine = (lineIndex: number) => {
    if (isExpanded && scrollViewRef.current && !isManualScrolling) {
      const scrollY = lineIndex * (lineHeight + 3); // lineHeight + marginVertical
      scrollViewRef.current.scrollTo({
        y: Math.max(0, scrollY - containerHeight / 2), // Center the line in view
        animated: true,
      });
    }
  };

  useEffect(() => {
    // Auto-scroll only in compact view
    if (autoScroll && !isExpanded) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }

    // Line highlighting works in both views if enabled
    if (enableLineHighlighting) {
      startLineHighlighting();
    } else {
      stopLineHighlighting();
    }

    return () => {
      stopAutoScroll();
      stopLineHighlighting();
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, [autoScroll, scrollSpeed, enableLineHighlighting, voiceOverTimings]);

  //useeffect if isscrolling is true then start playing disclaimer audio
  useEffect(() => {
    if (isScrolling) {
      disclaimerAudio.play(language);
      setIsAudioPlaying(true);
    }
  }, [isScrolling]);

  const startAutoScroll = () => {
    if (intervalRef.current) return;

    setIsScrolling(true);

    // Helper function to find next non-empty line
    const findNextNonEmptyLine = (startIndex: number) => {
      let nextIndex = startIndex + 1;
      while (nextIndex < lines.length && lines[nextIndex].trim() === "") {
        nextIndex++;
      }
      return nextIndex;
    };

    // Simple auto-scroll for compact view (no voice-over sync)
    intervalRef.current = setInterval(() => {
      setCurrentLineIndex((prevIndex) => {
        const nextIndex = findNextNonEmptyLine(prevIndex);
        if (nextIndex >= lines.length) {
          if (loopReading) {
            return 0; // Loop back to start
          } else {
            // Stop when we reach the end
            stopAutoScroll();
            onReadingComplete?.();
            return prevIndex; // Stay at the last line
          }
        }
        return nextIndex;
      });
    }, scrollSpeed);
  };

  const startLineHighlighting = () => {
    if (highlightIntervalRef.current) return;

    // Helper function to find next non-empty line
    const findNextNonEmptyLine = (startIndex: number) => {
      let nextIndex = startIndex;
      while (nextIndex < lines.length && lines[nextIndex].trim() === "") {
        nextIndex++;
      }
      return nextIndex;
    };
    // Use voice-over timings if provided, otherwise use fixed scroll speed
    if (voiceOverTimings && voiceOverTimings.length > 0) {
      let currentIndex = 0;
      const scheduleNextLine = () => {
        if (currentIndex >= lines.length) {
          if (loopReading) {
            currentIndex = 0; // Loop back to start
          } else {
            // Stop when we reach the end
            stopLineHighlighting();
            onReadingComplete?.();
            return;
          }
        }
        const timing = voiceOverTimings[currentIndex] || scrollSpeed;
        highlightIntervalRef.current = setTimeout(() => {
          setCurrentLineIndex(currentIndex);
          scrollToCurrentLine(currentIndex);
          onLineChange?.(currentIndex, lines[currentIndex]);
          currentIndex = findNextNonEmptyLine(currentIndex);
          scheduleNextLine();
        }, timing);
      };
      scheduleNextLine();
    } else {
      highlightIntervalRef.current = setInterval(() => {
        setCurrentLineIndex((prevIndex) => {
          const nextIndex = findNextNonEmptyLine(prevIndex);
          if (nextIndex >= lines.length) {
            if (loopReading) {
              return 0; // Loop back to start
            } else {
              // Stop when we reach the end
              stopLineHighlighting();
              onReadingComplete?.();
              return prevIndex; // Stay at the last line
            }
          }
          scrollToCurrentLine(nextIndex);
          onLineChange?.(nextIndex, lines[nextIndex]);
          return nextIndex;
        });
      }, scrollSpeed);
    }
  };

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScrolling(false);
  };

  const stopLineHighlighting = () => {
    if (highlightIntervalRef.current) {
      if (voiceOverTimings && voiceOverTimings.length > 0) {
        clearTimeout(highlightIntervalRef.current);
      } else {
        clearInterval(highlightIntervalRef.current);
      }
      highlightIntervalRef.current = null;
    }
  };

  // Handle manual scroll detection
  const handleScroll = () => {
    if (isExpanded) {
      setIsManualScrolling(true);

      // Clear existing timeout
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }

      // Set a timeout to re-enable automatic scrolling after user stops scrolling
      manualScrollTimeoutRef.current = setTimeout(() => {
        setIsManualScrolling(false);
      }, 2000); // 2 seconds after user stops scrolling
    }
  };

  const handleAcceptDisclaimer = async () => {
    stopAutoScroll();
    await pauseAllAudio();
    stopLineHighlighting();
    setIsAudioPlaying(false);
    onDisclaimerChange(true);
    // @ts-ignore
    dispatch(saveDisclaimerAcceptance());
  };

  const handlePlayPauseAudio = async () => {
    if (isAudioPlaying) {
      await pauseAllAudio();
      stopAutoScroll();
      setIsAudioPlaying(false);
    } else {
      await resumeAllAudio(language);
      startAutoScroll();
      setIsAudioPlaying(true);
    }
  };

  const renderScrollingView = () => {
    const startIndex = Math.max(
      0,
      currentLineIndex - Math.floor(visibleLines / 2)
    );
    const endIndex = Math.min(lines.length, startIndex + visibleLines);
    // const visibleLinesSlice = lines.slice(startIndex, endIndex);
    const visibleLinesSlice = lines;

    return (
      <View style={styles.scrollingContainer}>
        {/* Pause Button */}
        <TouchableOpacity
          style={styles.pauseButton}
          onPress={handlePlayPauseAudio}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isAudioPlaying ? "pause-circle" : "play-circle"}
            size={32}
            color="#8B1538"
          />
        </TouchableOpacity>
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={isExpanded}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {visibleLinesSlice.map((line, index) => {
            const actualIndex = startIndex + index;
            const isActive = actualIndex === currentLineIndex;
            const isNearActive = Math.abs(actualIndex - currentLineIndex) <= 1;

            return (
              <Animated.View
                key={`${actualIndex}-${line}`}
                style={[
                  styles.lineContainer,
                  {
                    opacity: isNearActive ? 1 : 0.4,
                    transform: [
                      {
                        scale: isActive ? 1.05 : 1,
                      },
                    ],
                  },
                ]}
              >
                <Text
                  style={[
                    styles.lyricsText,
                    {
                      color: isActive ? "#FEB989" : "#2C1810",
                      fontWeight: isActive ? "bold" : "600",
                    },
                  ]}
                >
                  {line}
                </Text>
              </Animated.View>
            );
          })}
        </ScrollView>
        <View
          style={[
            styles.buttonContainer,
            { display: isExpanded ? "flex" : "none" },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleAcceptDisclaimer}
          >
            <Text style={styles.buttonText}>
              {language === "hindi" ? "स्वीकार करें" : "Let's Begin"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground}>{renderScrollingView()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  gradientBackground: {
    flex: 1,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  // Scrolling view styles (25% height)
  scrollingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseButton: {
    position: "absolute",
    left: 10,
    bottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  lineContainer: {
    marginVertical: 3,
    paddingHorizontal: 15,
  },
  lyricsText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  // Full view styles (100% height)
  fullContainer: {
    flex: 1,
    paddingVertical: 15,
  },
  fullPauseButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 25,
    padding: 10,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  disclaimerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C1810",
    textAlign: "center",
    marginBottom: 25,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  fullContentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    marginHorizontal: 5,
  },
  fullLineContainer: {
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  fullLyricsText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "500",
  },
  spacer: {
    height: 10,
  },
  // Button styles
  buttonContainer: {
    alignItems: "center",
    marginTop: 25,
    paddingBottom: 15,
  },
  button: {
    backgroundColor: "#8B1538",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
