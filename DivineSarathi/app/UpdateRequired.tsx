import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const UpdateRequired = () => {
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handleUpdatePress = () => {
    const updateUrl = 'https://divinesarathi.in/download';
    Linking.openURL(updateUrl).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
      <View style={styles.content}>
        {/* Icon/Emoji */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔄</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>Update Required</Text>

        {/* Message */}
        <Text style={styles.message}>
          A new version of Divine Sarathi is available. Please update to
          continue using the app.
        </Text>

        {/* Current Version */}
        <Text style={styles.versionText}>
          Current Version: {appVersion}
        </Text>

        {/* Update Button */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdatePress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#f39c12', '#e67e22']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Update App</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#b8b8b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 40,
  },
  updateButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#f39c12',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default UpdateRequired;

