import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const STORY_CARD_WIDTH = 220;
const STORY_CARD_MARGIN = 16;
const INDICATOR_COUNT = 7;

type StoryStatus = "locked" | "play" | "listened" | "today";

export interface DailyStory {
  id: string;
  title: string;
  image: any; // require or uri
  status: StoryStatus;
  position: number;
}

interface DailyStoriesProps {
  dailyStories: DailyStory[];
  onStoryClick: (storyId: number, storyTitle: string) => void;
}

const DailyStories: React.FC<DailyStoriesProps> = ({
  dailyStories,
  onStoryClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // For horizontal scroll
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to "today" story on mount
  useEffect(() => {
    const todayIndex = dailyStories.findIndex(
      (story) => story.status === "today"
    );

    if (todayIndex !== -1 && scrollRef.current) {
      // Calculate the scroll position
      const scrollPosition =
        todayIndex * (STORY_CARD_WIDTH + STORY_CARD_MARGIN);

      // Use a timeout to ensure the layout is ready
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
        setCurrentIndex(todayIndex);
      }, 100);
    }
  }, [dailyStories]);

  // Calculate the indicator window
  let indicatorStart = 0;
  if (currentIndex > 5 && dailyStories.length > INDICATOR_COUNT) {
    indicatorStart = Math.min(
      currentIndex - 5,
      dailyStories.length - INDICATOR_COUNT
    );
  }
  const indicatorEnd = Math.min(
    indicatorStart + INDICATOR_COUNT,
    dailyStories.length
  );

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / (STORY_CARD_WIDTH + STORY_CARD_MARGIN));
    setCurrentIndex(idx);
  };

  const handleCardPress = (story: DailyStory, idx: number) => {
    if (story.status !== "locked" && onStoryClick) {
      onStoryClick(Number(story.id), story.title);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={STORY_CARD_WIDTH + STORY_CARD_MARGIN}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: STORY_CARD_WIDTH / 2 - 24 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {dailyStories.map((story, idx) => (
          <TouchableOpacity
            key={story.id}
            activeOpacity={story.status === "locked" ? 1 : 0.8}
            onPress={() => handleCardPress(story, idx)}
            style={[
              styles.storyCard,
              currentIndex === idx && styles.storyCardActive,
              {
                marginRight:
                  idx === dailyStories.length - 1 ? 0 : STORY_CARD_MARGIN,
              },
            ]}
          >
            <Image
              source={{ uri: story.image }}
              style={styles.storyImage}
              resizeMode="cover"
            />
            {story.status === "today" && (
              <View style={styles.todayStoryContainer}>
                <Text style={styles.todayStoryText}> Today's Story</Text>
              </View>
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.storyTitle} numberOfLines={2}>
                {story.title}
              </Text>
            </View>
            <View style={styles.statusButtonContainer}>
              {story.status === "locked" ? (
                <View style={styles.statusButtonLocked}>
                  <Ionicons name="lock-closed" size={22} color="#fff" />
                </View>
              ) : story.status === "listened" ? (
                <View style={styles.statusButtonListened}>
                  <Ionicons name="checkmark-done" size={22} color="#fff" />
                </View>
              ) : (
                <View style={styles.statusButtonPlay}>
                  <Ionicons name="play" size={22} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Tab Indicator */}
      <View style={styles.indicatorContainer}>
        {Array.from({
          length: Math.min(INDICATOR_COUNT, dailyStories.length),
        }).map((_, i) => {
          const storyIdx = indicatorStart + i;
          const story = dailyStories[storyIdx];
          const isActive = storyIdx === currentIndex;
          return (
            <View key={storyIdx}>
              <View
                style={[
                  styles.indicatorDot,
                  story.status === "listened" && { backgroundColor: "#CDB45970", borderWidth: 0 },
                  isActive && styles.activeIndicatorDot,
                  storyIdx == 0 && styles.indicatorTextFirst,
                  story.status === "today" && {
                    borderWidth: 4,
                    borderColor: "#CDB459",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.indicatorText,
                    isActive && styles.activeIndicatorText,
                    story.status === "listened" && { color: "#fff" },
                  ]}
                >
                  {story?.position}
                </Text>
              </View>
              <View
                style={[
                  styles.indicatorImageContainer,
                  story.status === "locked" && { opacity: 0.5 },
                ]}
              >
                {storyIdx == 0 && (
                  <Image
                    source={require("../../assets/images/rudraksha_line.png")}
                  />
                )}

                <Image source={require("../../assets/images/rudraksha.png")} />
                <Image
                  source={require("../../assets/images/rudraksha_line.png")}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  storyCard: {
    width: STORY_CARD_WIDTH,
    height: 240,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
    marginBottom: 8,
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 10,
  },
  storyCardActive: {
    width: STORY_CARD_WIDTH + 20,
    height: 240 + 20,
    marginTop: 0,
  },
  storyImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
  },
  storyTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textShadowColor: "#000",
    width: "75%",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    minHeight: 36,
  },
  statusButtonContainer: {
    position: "absolute",
    right: 12,
    bottom: 16,
  },
  statusButtonPlay: {
    backgroundColor: "#FFA344",
    borderRadius: 18,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  statusButtonLocked: {
    backgroundColor: "#B0B0B0",
    borderRadius: 18,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  },
  statusButtonListened: {
    backgroundColor: "#4CAF50",
    borderRadius: 18,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  indicatorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#CDB459",
    marginHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicatorDot: {
    backgroundColor: "#CDB459",
  },
  indicatorText: {
    color: "#CDB459",
    fontWeight: "600",
    fontSize: 16,
  },
  activeIndicatorText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  todayStoryContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  todayStoryText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    textShadowColor: "#000",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  indicatorImage: {
    marginTop: 8,
  },
  indicatorImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  indicatorTextFirst: {
    marginLeft: 22,
  },
});

export default DailyStories;
