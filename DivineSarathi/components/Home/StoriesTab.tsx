import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import StorySubsection from "../Stories/StorySubsection";

const StoriesTab = () => {
  const stories = [
    {
      image: "https://via.placeholder.com/150",
      verse: "Verse 1",
      title: "How to stay calm under pressure?",
    },
    {
      image: "https://via.placeholder.com/150",
      verse: "Verse 2",
      title: "Story 2",
    },
    {
      image: "https://via.placeholder.com/150",
      verse: "Verse 3",
      title: "Story 3",
    },
    {
      image: "https://via.placeholder.com/150",
      verse: "Verse 4",
      title: "Story 4",
    },
  ];
  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.geetaForDailyLife}>Favourites</Text>
          <StorySubsection sectionTitle="Story 1" stories={stories} />
          <StorySubsection sectionTitle="Story 1" stories={stories} />
          <StorySubsection sectionTitle="Story 1" stories={stories} />
          <StorySubsection sectionTitle="Story 1" stories={stories} />
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
});

export default StoriesTab;
