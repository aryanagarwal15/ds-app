import Ionicons from "@expo/vector-icons/build/Ionicons";
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

const BottomNav = ({
  selectedTab,
  setSelectedTab,
}: {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}) => {
  const handleTabPress = (tab: string) => {
    setSelectedTab(tab);
  };

  useEffect(() => {
    console.log(selectedTab);
  }, [selectedTab]);

  return (
    <BlurView
      intensity={100}
      tint="light"
      blurReductionFactor={4}
      style={styles.bottomNav}
    >
      <TouchableOpacity
        onPress={() => handleTabPress("home")}
        style={styles.bottomNavItem}
      >
        <View
          style={
            selectedTab === "home"
              ? styles.bottomNavItemActive
              : styles.bottomNavItem
          }
        >
          <Ionicons name="home-outline" size={24} color="#000" />
          <Text style={styles.bottomNavItemText}>Home</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleTabPress("chat")}
        style={styles.bottomNavItem}
      >
        <View
          style={
            selectedTab === "chat"
              ? styles.bottomNavItemActive
              : styles.bottomNavItem
          }
        >
          <Ionicons name="chatbox-outline" size={24} color="#000" />
          <Text style={styles.bottomNavItemText}>Krishna AI</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleTabPress("stories")}
        style={styles.bottomNavItem}
      >
        <View
          style={
            selectedTab === "stories"
              ? styles.bottomNavItemActive
              : styles.bottomNavItem
          }
        >
          <Ionicons name="book-outline" size={24} color="#000" />
          <Text style={styles.bottomNavItemText}>Stories</Text>
        </View>
      </TouchableOpacity>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 36,
    left: 24,
    right: 24,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 24,
    overflow: "hidden",
    zIndex: 3,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomNavItemActive: {
    backgroundColor: "#FFA34450",
    paddingHorizontal: 24,
    paddingVertical: 4,
    alignItems: "center",
    borderRadius: 24,
  },
  bottomNavItemText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000",
    marginTop: 4,
  },
});

export default BottomNav;
