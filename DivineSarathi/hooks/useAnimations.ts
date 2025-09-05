import { useRef, useCallback, useEffect } from 'react';
import { Animated } from 'react-native';
import type { AnimationRefs, AnimationControls } from '../types/audio';

export const useAnimations = (transcript: string, response: string) => {
  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Audio visualization animations
  const startPulseAnimation = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [pulseAnim]);

  const startRippleAnimation = useCallback(() => {
    rippleAnim.setValue(0);
    Animated.loop(
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [rippleAnim]);

  const stopRippleAnimation = useCallback(() => {
    rippleAnim.stopAnimation();
    rippleAnim.setValue(0);
  }, [rippleAnim]);

  // Fade in animation for text content
  useEffect(() => {
    if (transcript || response) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [transcript, response, fadeAnim]);

  return {
    pulseAnim,
    rippleAnim,
    fadeAnim,
    startPulseAnimation,
    stopPulseAnimation,
    startRippleAnimation,
    stopRippleAnimation,
  };
};
