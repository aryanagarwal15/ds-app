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
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { buildApiUrl, API_ENDPOINTS, API_CONFIG } from "../../constants/config";

const { width, height } = Dimensions.get("window");

type Story = {
  id: number;
  image: string;
  verse_number: string;
  title: string;
  sub_title: string;
  description: string;
  duration: number;
  is_favourite: boolean;
};

type StorySubsectionProps = {
  onStoryClick: (storyId: number, storyTitle: string) => void;
  sectionTitle: string;
  stories: Story[];
  type: "grid" | "list";
  onFavouriteToggle?: () => void;
};

const StorySubsection: React.FC<StorySubsectionProps> = ({
  onStoryClick,
  sectionTitle,
  stories,
  type = "list",
  onFavouriteToggle,
}) => {
  const [expandedStory, setExpandedStory] = useState<null | Story>(null);
  const [isFavouriting, setIsFavouriting] = useState(false);
  const [isFavourited, setIsFavourited] = useState(false);
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

  const favouriteStory = async () => {
    if (!expandedStory || isFavouriting) return;

    try {
      setIsFavouriting(true);

      // Get auth token
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error", "Please login to add favorites");
        return;
      }

      const isCurrentlyFavourited = isFavourited || expandedStory.is_favourite;
      const endpoint = isCurrentlyFavourited
        ? API_ENDPOINTS.FAVOURITE.REMOVE
        : API_ENDPOINTS.FAVOURITE.ADD;

      // Make API call
      const response = await axios.post(
        buildApiUrl(endpoint),
        { storyId: expandedStory.id },
        {
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
          timeout: API_CONFIG.TIMEOUT,
        }
      );

      if (response.data.success) {
        setIsFavourited(!isCurrentlyFavourited);
        // Update the story's is_favourite property
        if (expandedStory) {
          expandedStory.is_favourite = !isCurrentlyFavourited;
        }
        // Notify parent component of the toggle
        if (onFavouriteToggle) {
          onFavouriteToggle();
        }
      } else {
        Alert.alert(
          "Error",
          response.data.message ||
            `Failed to ${
              isCurrentlyFavourited ? "remove story from" : "add story to"
            } favorites`
        );
      }
    } catch (error: any) {
      console.error("Error updating favorite:", error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (statusCode === 401 || statusCode === 403) {
          Alert.alert("Error", "Authentication expired. Please login again.");
        } else if (!error.response) {
          Alert.alert("Error", "Network error. Please check your connection.");
        } else {
          Alert.alert("Error", message || "Failed to update favorite");
        }
      } else {
        Alert.alert("Error", "An unexpected error occurred");
      }
    } finally {
      setIsFavouriting(false);
    }
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
      {sectionTitle ? (
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      ) : null}
      {/* Stories Row */}
      {type === "list" ? (
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
                <BlurView
                  intensity={80}
                  tint="dark"
                  style={styles.verseContainer}
                >
                  <Text style={styles.verseText}>{story.verse_number}</Text>
                </BlurView>
                {/* Title overlay at bottom */}
                <LinearGradient
                  colors={["#00000070", "#00000060"]}
                  style={[styles.titleOverlay, { justifyContent: "center" }]}
                >
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <Text style={styles.storyTitle} numberOfLines={2}>
                      {story.title}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingLeft: 8,
            paddingRight: 16,
          }}
        >
          {stories.map((story, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.85}
              onPress={() => openStory(story)}
              style={{
                width: "46%",
                margin: "2%",
                aspectRatio: 1,
                borderRadius: 16,
                overflow: "hidden",
                backgroundColor: "#FBF7EF",
                justifyContent: "flex-end",
                alignItems: "center",
                elevation: 2,
              }}
            >
              <Image
                source={{ uri: story.image }}
                style={[
                  styles.gridStoryImage,
                  {
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    width: "100%",
                    height: "100%",
                  },
                ]}
                resizeMode="cover"
              />
              <BlurView
                intensity={80}
                tint="dark"
                style={styles.verseContainer}
              >
                <Text style={styles.verseText}>{story.verse_number}</Text>
              </BlurView>
              <LinearGradient
                colors={["#00000070", "#00000060"]}
                style={[styles.titleOverlay, { justifyContent: "center" }]}
              >
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Text style={styles.storyTitle} numberOfLines={2}>
                    {story.title}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
                {expandedStory.verse_number}
              </Text>
            </View>
            {/* Title overlay at bottom */}
            <BlurView
              intensity={60}
              tint="light"
              blurReductionFactor={4}
              style={styles.expandedTitleOverlay}
            >
              <Text style={styles.expandedStoryTitle}>
                {expandedStory.title}
              </Text>
              {/* Play and favourite button */}
              <View style={styles.expandedStoryButtons}>
                <TouchableOpacity
                  style={styles.expandedStoryPlayButton}
                  onPress={playStory}
                >
                  <View style={styles.expandedStoryPlayButtonIcon}>
                    <Ionicons name="play" size={24} color="#000" />
                    <Text style={styles.expandedStoryPlayButtonText}>Play</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.expandedStoryFavouriteButton,
                    isFavouriting &&
                      styles.expandedStoryFavouriteButtonDisabled,
                    (isFavourited || expandedStory.is_favourite) &&
                      styles.expandedStoryFavouriteButtonFilled,
                  ]}
                  onPress={favouriteStory}
                  disabled={isFavouriting}
                >
                  <View style={styles.expandedStoryFavouriteButtonIcon}>
                    <Ionicons
                      name={
                        isFavouriting
                          ? "hourglass-outline"
                          : isFavourited || expandedStory.is_favourite
                          ? "heart"
                          : "heart-outline"
                      }
                      size={24}
                      color="#000"
                    />
                    <Text style={styles.expandedStoryFavouriteButtonText}>
                      {isFavouriting
                        ? "Updating..."
                        : isFavourited || expandedStory.is_favourite
                        ? "Favourite"
                        : "Favourite"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Text style={styles.expandedStoryDescription}>
                {expandedStory.description}
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

const CARD_WIDTH = 200;
const CARD_HEIGHT = 200;

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
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: "hidden",
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  storyTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    minHeight: 36,
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
    top: Platform.OS === "ios" ? 70 : 10,
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
    height: "70%",
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
    top: Platform.OS === "ios" ? 68 : 10,
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
  expandedStoryFavouriteButtonDisabled: {
    opacity: 0.6,
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
  expandedStoryFavouriteButtonFilled: {
    backgroundColor: "#FFA344",
  },
  gridStoryImage: {
    width: "100%",
    height: "100%",
  },
  gridStoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginTop: 8,
    textAlign: "center",
  },
});

export default StorySubsection;
