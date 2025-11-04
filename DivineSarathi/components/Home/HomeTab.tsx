import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import StorySubsection from "../Stories/StorySubsection";
import {
  fetchCategories,
  fetchDailyStories,
  fetchInitialStories,
  Story,
} from "@/services/storiesApi";
import CategorySelector from "../CategorySelector/CategorySelector";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DailyStories from "../DailyStories/DailyStories";

const HomeTab = ({ onStoryClick }: { onStoryClick: (storyId: number, storyTitle: string) => void }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [dailyStories, setDailyStories] = useState<Story[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    fetchCategories().then((data) => {
      setCategories(data.categories);
      setSubCategories(data.subCategories);
    });
  }, []);

  useEffect(() => {
    fetchInitialStories().then((data) => {
      setStories(data.stories);
    });
    fetchDailyStories().then((data) => {
      setDailyStories(data.stories);
    });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchInitialStories().then((data) => {
        setStories(data.stories);
      });
    }
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* top bar with image to the left and option to go to profile in the right */}
          <View style={styles.topBar}>
            <Image
              source={require("@/assets/images/home_logo.png")}
              style={styles.logo}
            />
            <TouchableOpacity onPress={() => router.push("/Profile")}>
              {/* profile icon */}
              <Ionicons name="person-circle-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <DailyStories dailyStories={dailyStories} />
          <Text style={styles.geetaForDailyLife}>Geeta For Daily Life</Text>
          <CategorySelector
            categories={subCategories}
            onCategorySelect={setSelectedCategory}
          />
          <StorySubsection onStoryClick={onStoryClick} sectionTitle="" stories={stories} />
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
    marginBottom: 12,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logo: {
    width: 160,
    height: 48,
    resizeMode: "contain",
  },
});

export default HomeTab;
