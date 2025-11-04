import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Easing,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/build/Ionicons";

const { width, height } = Dimensions.get("window");

type Story = {
  id: number;
  image: string;
  verse_number: string;
  title: string;
  sub_title: string;
  description: string;
  duration: number;
};

type StorySubsectionProps = {
  onStoryClick: (storyId: number, storyTitle: string) => void;
  sectionTitle: string;
  stories: Story[];
};

const StorySubsection: React.FC<StorySubsectionProps> = ({
  onStoryClick,
  sectionTitle,
  stories,
}) => {
  const [expandedStory, setExpandedStory] = useState<null | Story>(null);
  const anim = useRef(new Animated.Value(0)).current;

  const openStory = (story: Story) => {
    setExpandedStory(story);
    Animated.timing(anim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  const closeStory = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.in(Easing.cubic),
    }).start(() => setExpandedStory(null));
  };

  const playStory = () => {
    console.log("Playing story");
    onStoryClick(expandedStory?.id || 0, expandedStory?.title || "");
  };

  const favouriteStory = () => {
    console.log("Favouriting story");
  };

  // Animation for expanded story
  const expandedStyle = {
    opacity: anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
    ],
  };

  return (
    <View style={{ marginBottom: 32 }}>
      {/* Section Title */}
      <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      {/* Stories Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 8, paddingRight: 16 }}
      >
        {stories.map((story, idx) => (
          <TouchableOpacity
            key={idx}
            activeOpacity={0.85}
            onPress={() => openStory(story)}
            style={styles.storyCardContainer}
          >
            <View style={styles.storyCard}>
              <Image
                source={{ uri: story.image }}
                style={styles.storyImage}
                resizeMode="cover"
              />
              {/* Verse number on top right */}
              <View style={styles.verseContainer}>
                <Text style={styles.verseText}>verse {story.verse_number}</Text>
              </View>
              {/* Title overlay at bottom */}
              <LinearGradient
                colors={["#62482510", "#00000040"]}
                style={styles.titleOverlay}
              >
                <Text style={styles.storyTitle} numberOfLines={2}>
                  {story.title}
                </Text>
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Expanded Story Modal */}
      <Modal
        visible={!!expandedStory}
        animationType="none"
        transparent
        onRequestClose={closeStory}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeStory}>
          {/* Empty to catch background press */}
        </Pressable>
        {expandedStory && (
          <Animated.View style={[styles.expandedContainer, expandedStyle]}>
            <Image
              source={{ uri: expandedStory.image }}
              style={styles.expandedImage}
              resizeMode="cover"
            />
            {/* Verse number on top right */}
            <View style={styles.expandedVerseContainer}>
              <Text style={styles.expandedVerseText}>
                verse {expandedStory.verse_number}
              </Text>
            </View>
            {/* Title overlay at bottom */}
            <BlurView
              intensity={100}
              tint="light"
              blurReductionFactor={4}
              style={styles.expandedTitleOverlay}
            >
              <Text style={styles.expandedStoryTitle}>
                {expandedStory.title}
              </Text>
              {/* Play and favourite button */}
              <View style={styles.expandedStoryButtons}>
                <TouchableOpacity style={styles.expandedStoryPlayButton} onPress={playStory}>
                  <View style={styles.expandedStoryPlayButtonIcon}>
                    <Ionicons name="play" size={24} color="#000" />
                    <Text style={styles.expandedStoryPlayButtonText}>Play</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.expandedStoryFavouriteButton} onPress={favouriteStory}>
                  <View style={styles.expandedStoryFavouriteButtonIcon}>
                    <Ionicons name="heart" size={24} color="#000" />
                    <Text style={styles.expandedStoryFavouriteButtonText}>
                      Favourite
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.expandedStoryDescription}>
                {"This is a sample description to showcase how this will look"}
              </Text>
            </BlurView>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeStory}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Modal>
    </View>
  );
};

const CARD_WIDTH = 234;
const CARD_HEIGHT = 234;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#29687C",
    marginLeft: 16,
    marginBottom: 12,
    textAlign: "left",
  },
  storyCardContainer: {
    marginRight: 16,
  },
  storyCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#eee",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  storyImage: {
    width: "100%",
    height: "100%",
  },
  verseContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#F5EAD6",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-end",
    zIndex: 2,
  },
  verseText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  titleOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#00000070",
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  storyTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#00000070",
    zIndex: 1,
  },
  expandedContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  expandedImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  expandedVerseContainer: {
    position: "absolute",
    top: 24,
    right: 24,
    backgroundColor: "#FFA344",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 3,
  },
  expandedVerseText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  expandedTitleOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 16,
    paddingHorizontal: 16,
    height: "75%",
    alignItems: "center",
    overflow: "hidden",
  },
  expandedStoryTitle: {
    color: "#000",
    fontWeight: "600",
    fontSize: 22,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  closeButton: {
    position: "absolute",
    top: 18,
    left: 18,
    backgroundColor: "#fff",
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 4,
  },
  closeButtonText: {
    fontSize: 28,
    color: "#222",
    fontWeight: "700",
    lineHeight: 32,
    marginTop: -2,
  },
  expandedStoryDescription: {
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
    lineHeight: 24,
    marginTop: 16,
  },
  expandedStoryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    width: "75%",
  },
  expandedStoryPlayButton: {
    backgroundColor: "#FBF7EF",
    borderRadius: 24,
    padding: 12,
    width: 125,
  },
  expandedStoryFavouriteButton: {
    backgroundColor: "#FBF7EF",
    borderRadius: 24,
    padding: 12,
    width: 125,
  },
  expandedStoryPlayButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
    marginLeft: 8,
  },
  expandedStoryFavouriteButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
    marginLeft: 8,
  },
  expandedStoryPlayButtonIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  expandedStoryFavouriteButtonIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default StorySubsection;
