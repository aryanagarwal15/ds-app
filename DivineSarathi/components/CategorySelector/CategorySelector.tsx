import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";


const CategorySelector = ({ categories, onCategorySelect }: { categories: string[], onCategorySelect: (category: string) => void }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const handleSelect = (category: string) => {
    setSelectedCategory(category);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              selectedCategory === category && styles.selectedCategoryItem,
            ]}
            onPress={() => handleSelect(category)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: "center",
  },
  categoryItem: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 10,
  },
  selectedCategoryItem: {
    backgroundColor: "#FFA34460",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "#000",
    fontWeight: "400",
  },
});

export default CategorySelector;
