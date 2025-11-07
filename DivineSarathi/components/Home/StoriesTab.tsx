import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import StorySubsection from "../Stories/StorySubsection";
import CategorySelector from "../CategorySelector/CategorySelector";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { buildApiUrl, API_ENDPOINTS, API_CONFIG } from "../../constants/config";
import Ionicons from "@expo/vector-icons/Ionicons";

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

const StoriesTab = () => {
  const [subCategories, setSubCategories] = useState<string[]>(["Favourites"]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Favourites");
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (selectedCategory === "Favourites") {
      fetchFavouriteStories();
    }
  }, [selectedCategory, token]);

  const fetchFavouriteStories = async () => {
    if (!token) {
      
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.FAVOURITE.GET_ALL),
        {
          method: "GET",
          headers: {
            ...API_CONFIG.HEADERS,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response);
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setStories(result.data || []);
      } else {
        throw new Error("Failed to fetch favourite stories");
      }
    } catch (err) {
      console.error("Error fetching favourite stories:", err);
      setError("Failed to load your favourite stories");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FFA344" />
          <Text style={styles.loadingText}>Loading your favourites...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#999" />
          <Text style={styles.emptyTitle}>{error}</Text>
          <Text style={styles.emptyDescription}>Please try again later</Text>
        </View>
      );
    }

    if (stories.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="heart-outline" size={80} color="#FFA344" />
          <Text style={styles.emptyTitle}>No Favourite Stories Yet</Text>
          <Text style={styles.emptyDescription}>
            Stories you mark as favourite will appear here.{"\n"}
            Start exploring and save your favourites!
          </Text>
        </View>
      );
    }

    return (
      <StorySubsection
        type="grid"
        stories={stories}
        sectionTitle=""
        onStoryClick={(id, title) => console.log("Story clicked:", id, title)}
        onFavouriteToggle={fetchFavouriteStories}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Text style={styles.geetaForDailyLife}>Stories</Text>
        <CategorySelector
          categories={subCategories}
          categorySelected={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  geetaForDailyLife: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 16,
    marginBottom: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  emptyTitle: {
    marginTop: 24,
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  emptyDescription: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});

export default StoriesTab;
