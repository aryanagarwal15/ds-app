/**
 * MainInterfaceV2 - Enhanced main interface component for the Divine Sarathi app
 *
 * Features:
 * - Comprehensive error handling with retry mechanisms
 * - Proper loading states for all data fetching operations
 * - Edge case handling for empty states and network failures
 * - Authentication error handling with automatic token cleanup
 * - Pull-to-refresh functionality
 * - Optimized performance with memoization and useCallback
 * - Separated API logic into dedicated service layer
 * - Type-safe interfaces and error handling
 *
 * API Service: ../services/storiesApi.ts handles all data fetching logic
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  fetchCategories,
  fetchInitialStories,
  withRetry,
  StoriesApiError,
  Story,
} from "../services/storiesApi";

interface LoadingStates {
  categories: boolean;
  stories: boolean;
  refreshing: boolean;
}

interface ErrorStates {
  categories: string | null;
  stories: string | null;
  general: string | null;
}

interface MainInterfaceV2Props {
  error: string | null;
  onClearError: () => void;
  onConnectionToggle: (storyId: string) => void;
  onAuthenticationRequired?: () => void;
}

const MainInterfaceV2: React.FC<MainInterfaceV2Props> = ({
  error,
  onClearError,
  onConnectionToggle,
  onAuthenticationRequired,
}) => {
  // State management
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [stories, setStories] = useState<Story[]>([]);
  const [dailyStories, setDailyStories] = useState<Story[]>([]);

  // Loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    categories: false,
    stories: false,
    refreshing: false,
  });

  // Error states
  const [errorStates, setErrorStates] = useState<ErrorStates>({
    categories: null,
    stories: null,
    general: null,
  });

  // Data availability flags
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Clear error state helper
  const clearError = useCallback((errorType: keyof ErrorStates) => {
    setErrorStates((prev) => ({ ...prev, [errorType]: null }));
  }, []);

  // Handle authentication errors
  const handleAuthError = useCallback(() => {
    if (onAuthenticationRequired) {
      onAuthenticationRequired();
    } else {
      Alert.alert("Authentication Required", "Please login to continue", [
        { text: "OK", style: "default" },
      ]);
    }
  }, [onAuthenticationRequired]);

  // Get categories from the server
  const loadCategories = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, categories: true }));
    clearError("categories");

    try {
      const categoriesData = await withRetry(() => fetchCategories());
      setCategories(categoriesData.categories);
      setSubCategories(categoriesData.subCategories);

      // Don't auto-select any subcategory - show all stories initially
    } catch (error) {
      console.error("Error loading categories:", error);

      if (error instanceof StoriesApiError && error.isAuthError) {
        handleAuthError();
      } else {
        const errorMessage =
          error instanceof StoriesApiError
            ? error.message
            : "Failed to load categories. Please try again.";
        setErrorStates((prev) => ({ ...prev, categories: errorMessage }));
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, categories: false }));
    }
  }, [clearError, handleAuthError]);

  // Get initial stories from the server
  const loadStories = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, stories: true }));
    clearError("stories");

    try {
      const storiesData = await withRetry(() => fetchInitialStories());
      setStories(storiesData.stories);
      setDailyStories(storiesData.dailyStories);
    } catch (error) {
      console.error("Error loading stories:", error);

      if (error instanceof StoriesApiError && error.isAuthError) {
        handleAuthError();
      } else {
        const errorMessage =
          error instanceof StoriesApiError
            ? error.message
            : "Failed to load stories. Please try again.";
        setErrorStates((prev) => ({ ...prev, stories: errorMessage }));
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, stories: false }));
    }
  }, [clearError, handleAuthError]);

  // Initialize all data
  const initializeData = useCallback(async () => {
    setIsInitialized(false);

    try {
      await Promise.allSettled([loadCategories(), loadStories()]);
    } finally {
      setIsInitialized(true);
    }
  }, [loadCategories, loadStories]);

  // Refresh data
  const refreshData = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, refreshing: true }));

    try {
      await Promise.allSettled([loadCategories(), loadStories()]);
    } finally {
      setLoadingStates((prev) => ({ ...prev, refreshing: false }));
    }
  }, [loadCategories, loadStories]);

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Memoized computed values
  const filteredStories = useMemo(() => {
    if (!selectedSubCategory) {
      return stories;
    }
    return stories.filter(
      (story) => story.sub_category === selectedSubCategory
    );
  }, [stories, selectedSubCategory]);

  const hasData = useMemo(
    () => ({
      categories: categories.length > 0,
      subCategories: subCategories.length > 0,
      stories: stories.length > 0,
      dailyStories: dailyStories.length > 0,
    }),
    [categories, subCategories, stories, dailyStories]
  );

  const isLoading = useMemo(
    () => loadingStates.categories || loadingStates.stories,
    [loadingStates]
  );

  const hasErrors = useMemo(
    () =>
      Boolean(
        errorStates.categories || errorStates.stories || errorStates.general
      ),
    [errorStates]
  );

  // Event handlers
  const handleStoryPress = useCallback(
    (storyId: string) => {
      if (!storyId) {
        console.warn("Story ID is required");
        return;
      }

      try {
        onConnectionToggle(storyId);
      } catch (error) {
        console.error("Error handling story press:", error);
        setErrorStates((prev) => ({
          ...prev,
          general: "Failed to open story. Please try again.",
        }));
      }
    },
    [onConnectionToggle]
  );

  const handleSubCategoryChange = useCallback(
    (category: string) => {
      if (category !== selectedSubCategory) {
        setSelectedSubCategory(category);
      }
    },
    [selectedSubCategory]
  );

  const handleRetry = useCallback(
    (type: "categories" | "stories" | "all") => {
      switch (type) {
        case "categories":
          loadCategories();
          break;
        case "stories":
          loadStories();
          break;
        case "all":
          initializeData();
          break;
      }
    },
    [loadCategories, loadStories, initializeData]
  );

  const handleProfilePress = useCallback(() => {
    try {
      router.push("/Profile");
    } catch (error) {
      console.error("Error navigating to profile:", error);
      Alert.alert("Error", "Failed to open profile. Please try again.");
    }
  }, []);

  return (
    <LinearGradient
      colors={["#FFB080", "#FFB080", "#E6A0FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.backgroundContentContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Add a nav bar here with Divine Sarathi written on left and the profile circle on the right */}
        <View style={styles.navBar}>
          <Text style={styles.navBarTitle}>Divine Sarathi</Text>
          <TouchableOpacity
            style={styles.navBarProfileButton}
            onPress={handleProfilePress}
            disabled={isLoading}
          >
            <Ionicons name="person-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={loadingStates.refreshing}
              onRefresh={refreshData}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        >
          {/* Loading State */}
          {!isInitialized && isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading stories...</Text>
            </View>
          )}

          {/* Daily Story Card */}
          {isInitialized && (
            <>
              {hasData.dailyStories ? (
                <Pressable
                  style={styles.dailyStoryCard}
                  onPress={() => handleStoryPress(dailyStories[0].id)}
                  disabled={isLoading}
                >
                  <Text style={styles.dailyStoryTitle}>Daily Story</Text>
                  <Text style={styles.dailyStoryContent}>
                    {dailyStories[0]?.title}
                  </Text>
                  {dailyStories[0]?.sub_title && (
                    <Text style={styles.dailyStorySubtitle}>
                      {dailyStories[0].sub_title}
                    </Text>
                  )}
                </Pressable>
              ) : (
                <View style={styles.dailyStoryCard}>
                  <Text style={styles.dailyStoryTitle}>Daily Story</Text>
                  <Text style={styles.emptyStateText}>
                    {errorStates.stories
                      ? "Failed to load daily story"
                      : "No daily story available"}
                  </Text>
                  {errorStates.stories && (
                    <Pressable
                      style={styles.retryButton}
                      onPress={() => handleRetry("stories")}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </>
          )}

          {/* Geeta for Daily Life Section */}
          {isInitialized && (
            <View style={styles.geetaSection}>
              <Text style={styles.geetaSectionTitle}>Gita for daily life</Text>

              {/* Categories Loading */}
              {loadingStates.categories && (
                <View style={styles.sectionLoadingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.sectionLoadingText}>
                    Loading categories...
                  </Text>
                </View>
              )}

              {/* Categories Error */}
              {errorStates.categories && (
                <View style={styles.errorSection}>
                  <Text style={styles.errorSectionText}>
                    {errorStates.categories}
                  </Text>
                  <Pressable
                    style={styles.retryButton}
                    onPress={() => handleRetry("categories")}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </Pressable>
                </View>
              )}

              {/* Category Buttons */}
              {hasData.subCategories && !loadingStates.categories && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingLeft: 16 }}
                  contentContainerStyle={{ paddingRight: 16 }}
                >
                  {/* All Stories Button */}
                  <Pressable
                    style={[
                      styles.categoryButton,
                      selectedSubCategory === "" && styles.categoryButtonActive,
                    ]}
                    onPress={() => handleSubCategoryChange("")}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedSubCategory === "" &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </Pressable>

                  {subCategories.map((category) => (
                    <Pressable
                      key={category}
                      style={[
                        styles.categoryButton,
                        selectedSubCategory === category &&
                          styles.categoryButtonActive,
                      ]}
                      onPress={() => handleSubCategoryChange(category)}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selectedSubCategory === category &&
                            styles.categoryButtonTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}

              {/* Stories Loading */}
              {loadingStates.stories && (
                <View style={styles.sectionLoadingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.sectionLoadingText}>
                    Loading stories...
                  </Text>
                </View>
              )}

              {/* Stories Error */}
              {errorStates.stories && !loadingStates.stories && (
                <View style={styles.errorSection}>
                  <Text style={styles.errorSectionText}>
                    {errorStates.stories}
                  </Text>
                  <Pressable
                    style={styles.retryButton}
                    onPress={() => handleRetry("stories")}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </Pressable>
                </View>
              )}

              {/* Stories Grid */}
              {hasData.stories && !loadingStates.stories && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.storiesGridContent}
                  style={{ marginTop: 16, paddingLeft: 16 }}
                >
                  {filteredStories.length > 0 ? (
                    filteredStories.map((story) => (
                      <Pressable
                        key={story.id}
                        style={styles.storyCard}
                        onPress={() => handleStoryPress(story.id)}
                        disabled={isLoading}
                      >
                        <Text style={styles.storyTitle} numberOfLines={2}>
                          {story.title}
                        </Text>
                        {story.sub_title && (
                          <Text style={styles.storySubtitle} numberOfLines={4}>
                            {story.sub_title}
                          </Text>
                        )}

                        {story.verse_number && (
                          <Text style={styles.storyVerse}>
                            Verse {story.verse_number}
                          </Text>
                        )}
                      </Pressable>
                    ))
                  ) : (
                    <View style={styles.emptyStoriesContainer}>
                      <Text style={styles.emptyStateText}>
                        {selectedSubCategory
                          ? `No stories found for "${selectedSubCategory}"`
                          : "No stories available"}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          )}

          {/* General Error Display */}
          {errorStates.general && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
              <Text style={styles.errorText}>{errorStates.general}</Text>
              <Pressable
                style={styles.clearErrorButton}
                onPress={() => clearError("general")}
              >
                <Ionicons name="close" size={16} color="#ff6b6b" />
              </Pressable>
            </View>
          )}

          {/* External Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.clearErrorButton} onPress={onClearError}>
                <Ionicons name="close" size={16} color="#ff6b6b" />
              </Pressable>
            </View>
          )}

          {/* General Retry Option */}
          {!isInitialized && hasErrors && (
            <View style={styles.generalRetryContainer}>
              <Text style={styles.generalRetryText}>
                Something went wrong while loading the app
              </Text>
              <Pressable
                style={styles.primaryRetryButton}
                onPress={() => handleRetry("all")}
              >
                <Text style={styles.primaryRetryButtonText}>Retry</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundContentContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  dailyStoryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    padding: 16,
    marginTop: 16,
  },
  dailyStoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  dailyStoryContent: {
    fontSize: 14,
    color: "#222",
    marginTop: 8,
  },
  dailyStoryReadMore: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 8,
    fontWeight: "500",
  },
  geetaSection: {
    marginTop: 24,
  },
  geetaSectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    marginLeft: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 8,
  },
  categoryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  categoryButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  storiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 16,
  },
  storiesGridContent: {
    marginRight: 16,
  },
  storyCard: {
    width: 180,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 260,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 16,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  storySubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 18,
    marginBottom: 12,
    flex: 1,
  },
  storyVerse: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  clearErrorButton: {
    padding: 4,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navBarTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  navBarProfileButton: {
    padding: 8,
  },
  // New styles for improved UI
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  sectionLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sectionLoadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#666",
  },
  errorSection: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
    alignItems: "center",
  },
  errorSectionText: {
    color: "#ff6b6b",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  primaryRetryButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 12,
  },
  primaryRetryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  generalRetryContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  generalRetryText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  emptyStoriesContainer: {
    width: 200,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dailyStorySubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
});

export default MainInterfaceV2;
