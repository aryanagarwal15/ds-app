import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Share,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Profile: React.FC = () => {
  // Get user profile from Redux store
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const user = useSelector((state: RootState) => state.auth.user);

  // Get the username - it could be in either userProfile.username or user.name
  const userName = userProfile?.username || "";
  const userFirstName = userName.split(" ")[0];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Clear all stored user data
            await AsyncStorage.multiRemove([
              "authToken",
              "authenticated",
              "userInfo",
            ]);
            // Navigate back to login/index
            router.replace("/");
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    // Navigate to UserDetailsPage for editing
    router.push("/Onboarding/UserDetailsPage");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Hello, {userFirstName}!</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await Share.share({
                    message:
                      "Invite friend to try out divinesarathi and download the app at divinesarathi.in/download",
                  });
                } catch (error) {
                  console.error("Error sharing invite:", error);
                  Alert.alert("Error", "Failed to open share dialog. Please try again.");
                }
              }}
            >
              <View style={styles.profileListContainer}>
                <Text style={styles.profileListTitle}>Invite Friends</Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* Logout Button */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
          <View style={styles.complianceContainer}>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.complianceText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.complianceText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  headerRight: {
    width: 40, // Same width as back button for centering
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  profileListContainer: {
    backgroundColor: "#FFA34410",
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    shadowColor: "#000",
  },
  profileListTitle: {
    fontSize: 18,
    color: "#000",
  },
  complianceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginTop: 16,
  },
  complianceText: {
    fontSize: 14,
    color: "#000",
  },
});

export default Profile;
