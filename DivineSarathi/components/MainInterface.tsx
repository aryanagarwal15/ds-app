import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { ConnectionState } from '../types/audio';

interface MainInterfaceProps {
  connectionState: ConnectionState;
  pulseAnim: Animated.Value;
  rippleAnim: Animated.Value;
  fadeAnim: Animated.Value;
  circleScaleAnim: Animated.Value;
  conversations: {
    id: string;
    userMessage: string;
    krishnaResponse: string;
    timestamp: Date;
    isComplete: boolean;
  }[];
  activeConversation: {
    id: string;
    userMessage: string;
    krishnaResponse: string;
    displayedUserMessage: string;
    displayedKrishnaResponse: string;
    isUserComplete: boolean;
    isKrishnaComplete: boolean;
    isTyping: boolean;
  } | null;
  onPress: () => void;
}

const MainInterface: React.FC<MainInterfaceProps> = ({
  connectionState,
  pulseAnim,
  rippleAnim,
  fadeAnim,
  circleScaleAnim,
  conversations,
  activeConversation,
  onPress,
}) => {
  return (
    <View style={styles.mainContent}>
      <Text style={styles.greetingText}>नमस्ते 🙏</Text>
      <Text style={styles.subGreetingText}>Talk to Lord Krishna Ji</Text>
      <Text style={styles.instructionText}>
        {connectionState === 'idle' ? 'Tap connect to begin your divine conversation' :
         connectionState === 'connected' ? 'Tap the circle to speak with Krishna Ji' :
         connectionState === 'speaking' ? 'Krishna Ji is listening to your words...' :
         connectionState === 'listening' ? 'Krishna Ji is responding...' :
         'Please connect to start talking'}
      </Text>
      
      {/* Main Circular Button */}
      <View style={styles.buttonContainer}>
        {/* Ripple Effect for Listening State */}
        {connectionState === 'listening' && (
          <Animated.View 
            style={[
              styles.ripple,
              {
                transform: [{
                  scale: rippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2.5],
                  }),
                }],
                opacity: rippleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 0.3, 0],
                }),
              }
            ]}
          />
        )}
        
        <Animated.View style={{ 
          transform: [
            { scale: Animated.multiply(pulseAnim, circleScaleAnim) }
          ] 
        }}>
          <TouchableOpacity
            style={styles.mainButton}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={connectionState === 'connecting'}
          >
            <LinearGradient
              colors={
                connectionState === 'speaking' ? ['#ff6b6b', '#ee5a52', '#ff8e8e'] :
                connectionState === 'listening' ? ['#4ecdc4', '#44a08d', '#95e1d3'] :
                connectionState === 'connected' ? ['#fce38a', '#f38ba8', '#f9ca24'] :
                ['#667eea', '#764ba2', '#f093fb']
              }
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={
                  connectionState === 'speaking' ? 'mic' :
                  connectionState === 'listening' ? 'volume-high' :
                  connectionState === 'connected' ? 'mic-outline' :
                  'play'
                } 
                size={60} 
                color="white" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Navigation indicators */}
      {(conversations.length > 0 || activeConversation) && (
        <View style={styles.navigationHints}>
          <Animated.View style={[styles.swipeIndicator, { opacity: fadeAnim }]}>
            <Ionicons name="chevron-up" size={20} color="#D4A574" />
            <Text style={styles.swipeText}>Swipe up to view conversation</Text>
          </Animated.View>
          
          <View style={styles.horizontalScrollIndicator}>
            <Ionicons name="chevron-forward" size={16} color="#D4A574" />
            <Text style={styles.horizontalScrollText}>Swipe left to see all conversations</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4A574',
    marginBottom: 8,
    textAlign: 'center',
  },
  subGreetingText: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 16,
    color: '#B8B8B8',
    marginBottom: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    position: 'relative',
  },
  ripple: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
  },
  mainButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
      },
      android: {
        elevation: 25,
      },
    }),
  },
  gradientButton: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationHints: {
    alignItems: 'center',
    marginTop: 20,
  },
  swipeIndicator: {
    alignItems: 'center',
    marginTop: 20,
  },
  swipeText: {
    fontSize: 14,
    color: '#D4A574',
    marginTop: 4,
    fontWeight: '500',
  },
  horizontalScrollIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  horizontalScrollText: {
    fontSize: 12,
    color: '#D4A574',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default MainInterface;
