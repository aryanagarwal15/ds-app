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
  fetchStoriesByCategory,
  Story,
} from "@/services/storiesApi";
import CategorySelector from "../CategorySelector/CategorySelector";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DailyStories, { DailyStory } from "../DailyStories/DailyStories";

const HomeTab = ({
  onStoryClick,
}: {
  onStoryClick: (
    storyId: number,
    storyTitle: string,
    storyCategory: string
  ) => void;
}) => {
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [dailyStories, setDailyStories] = useState<DailyStory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [subCategory2, setSubCategory2] = useState<{ [key: string]: Story[] }>(
    {}
  );

  const handleDailyStoryClick = (storyId: number, storyTitle: string) => {
    onStoryClick(storyId, storyTitle, "Daily Stories");
  };

  const handleGeetaStoryClick = (storyId: number, storyTitle: string) => {
    onStoryClick(storyId, storyTitle, "Geeta");
  };

  useEffect(() => {
    fetchCategories().then((data) => {
      setSubCategories(data.subCategories);
      setSelectedCategory(data.subCategories[0]);
    });
  }, []);

  useEffect(() => {
    fetchDailyStories().then((data) => {
      setDailyStories(data.stories);
    });
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchStoriesByCategory(selectedCategory).then((data) => {
        let fetchedStories = data.stories;
        //get all subcategory 2s in array from fetchedStories
        let subCategory2Array = fetchedStories.map(
          (story) => story.sub_category_2
        );
        // Group stories by sub_category_2 and set as an object { [subCategory2]: Story[] }
        const subCategory2Map: { [key: string]: Story[] } = {};
        subCategory2Array.forEach((subCat2) => {
          if (subCat2 && !subCategory2Map[subCat2]) {
            subCategory2Map[subCat2] = fetchedStories.filter(
              (story) => story.sub_category_2 === subCat2
            );
          }
        });
        setSubCategory2(subCategory2Map);
      });
    }
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 180 }}
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
              <Ionicons
                name="person-circle-outline"
                size={24}
                color="#CDB459"
              />
            </TouchableOpacity>
          </View>
          <DailyStories
            dailyStories={dailyStories}
            onStoryClick={handleDailyStoryClick}
          />
          <Text style={styles.geetaForDailyLife}>Geeta For Daily Life</Text>
          <CategorySelector
            categories={subCategories}
            categorySelected={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          {Object.entries(subCategory2).map(([subCategory2, stories]) => (
            <StorySubsection
              key={subCategory2}
              onStoryClick={handleGeetaStoryClick}
              sectionTitle={subCategory2}
              stories={stories}
            />
          ))}
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
