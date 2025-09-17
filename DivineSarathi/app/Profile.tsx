import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

// Helper function for opening links robustly
const openLink = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Can't open this link:", url);
    }
  } catch (e) {
    Alert.alert("An error occurred while opening the link.");
  }
};

export default function ProfileScreen() {
  const { userProfile, user } = useSelector((s: RootState) => s.auth);
  const displayName =
    userProfile?.username ||
    user?.name ||
    (userProfile?.email ? userProfile.email.split('@')[0] : '') ||
    'User';

  return (
    <View style={styles.container}>
      {/* Top Bar - Title and Icons */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} />
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconButton} />
      </View>
      <Image
        source={{ uri: 'https://your-profile-image-url.png' }}
        style={styles.avatar}
        // Replace with <View> with Icon or SVG if no profile image
      />
      <Text style={styles.name}>Hello, {displayName}</Text>

      {/* Main Action Buttons */}
      <TouchableOpacity style={styles.ageButton} onPress={() => Alert.alert('Account Details Pressed!')}>
        <Text style={styles.ageButtonText}>Account Details</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ageButton} onPress={() => Alert.alert('Feedback Pressed!')}>
        <Text style={styles.ageButtonText}>Feedback</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.ageButton} onPress={() => Alert.alert('Rate Us Pressed!')}>
        <Text style={styles.ageButtonText}>Rate Us</Text>
      </TouchableOpacity>

      {/* Socials Heading */}
      <Text style={styles.socialsHeading}>Follow our socials</Text>

      {/* Social Media Icons */}
      <View style={styles.socialsRow}>
  <TouchableOpacity style={styles.socialIcon}
    onPress={() => openLink('https://www.instagram.com')}>
    <Image
      source={require('../../assets/icons/Instagram.png')}
      style={styles.socialIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
  <TouchableOpacity style={styles.socialIcon}
    onPress={() => openLink('https://www.facebook.com')}>
    <Image
      source={require('../../assets/icons/Facebook.png')}
      style={styles.socialIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
  <TouchableOpacity style={[styles.socialIcon, styles.socialIconSmall]}
    onPress={() => openLink('https://twitter.com')}>
    <Image
      source={require('../../assets/icons/X.png')}
      style={styles.socialIcon}
      resizeMode="contain"
    />
  </TouchableOpacity>
</View>


      {/* Bottom Links */}
      <View style={styles.bottomRow}>
        <TouchableOpacity onPress={() => openLink('https://your-terms-link.com')}>
          <Text style={styles.linkText}>Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://your-privacy-policy-link.com')}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles section
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 393,
    height: 852,
    backgroundColor: '#FBF7EF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  topBar: {
    width: 393,
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: 'Roboto',
    fontWeight: '600',
    fontSize: 24,
    color: '#29687C',
    textAlign: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 40,
    backgroundColor: '#FF8100',
    alignSelf: 'center',
  },
  name: {
    marginTop: 24,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 24,
    lineHeight: 25,
    color: '#29687C',
    textAlign: 'center',
  },
  ageButton: {
    width: 301,
    height: 55,
    backgroundColor: 'rgba(137, 205, 179, 0.1)',
    borderWidth: 2,
    borderColor: '#89CDB3',
    borderRadius: 24,
    alignSelf: 'center',
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageButtonText: {
    color: '#30938E',
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 25,
  },
  socialsHeading: {
    marginTop: 40,
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 18,
    color: '#30938E',
    textAlign: 'center',
  },
  socialsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#29687C',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  socialIconSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  bottomRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 16,
    left: 0,
    paddingHorizontal: 46,
  },
  linkText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 15,
    textDecorationLine: 'underline',
    color: '#30938E',
  },
});
