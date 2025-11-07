import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAudioContext } from '../../contexts/AudioContext';

const { width, height } = Dimensions.get('window');

const OnboardingTransition: React.FC = () => {
  const { shankhaAudio } = useAudioContext();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const lightBeamAnim = useRef(new Animated.Value(0)).current;
  const particlesAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const cloudAnim = useRef(new Animated.Value(height)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  
  const [showTitle, setShowTitle] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    startDivineSequence();
    
    return () => {
      // Cleanup audio when component unmounts
      shankhaAudio.stop();
    };
  }, []);

  const startDivineSequence = async () => {
    // Start shankha audio
    await shankhaAudio.start();
    
    // Phase 1: Initial divine light emergence (0-2s)
    setTimeout(() => setAnimationPhase(1), 100);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(lightBeamAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2: Divine energy ripples (2-4s)
    setTimeout(() => {
      setAnimationPhase(2);
      Animated.sequence([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    // Phase 3: Celestial rotation and particles (4-6s)
    setTimeout(() => {
      setAnimationPhase(3);
      Animated.parallel([
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        ),
        Animated.timing(particlesAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 4000);

    // Phase 4: Divine clouds and title (6-8s)
    setTimeout(() => {
      setAnimationPhase(4);
      setShowTitle(true);
      Animated.parallel([
        Animated.timing(cloudAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 6000);

    // Phase 5: Final transition to Home (8-10s)
    setTimeout(() => {
      setAnimationPhase(5);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        // Navigate to Home after animation completes
        router.replace('/HomeV3');
      });
    }, 4000);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const lightBeamScale = lightBeamAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 2, 1],
  });

  const particleTranslateY = particlesAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, -height],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  const renderDivineParticles = () => {
    const particles = [];
    for (let i = 0; i < 20; i++) {
      const randomX = Math.random() * width;
      const randomDelay = Math.random() * 2000;
      
      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: randomX,
              transform: [
                {
                  translateY: particleTranslateY,
                },
                {
                  scale: particlesAnim,
                },
              ],
              opacity: particlesAnim,
            },
          ]}
        />
      );
    }
    return particles;
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Cosmic Background */}
      <LinearGradient
        colors={['#0a0a2e', '#16213e', '#1a1a3a', '#0f0f23']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Divine Light Beams */}
      <Animated.View
        style={[
          styles.lightBeamContainer,
          {
            opacity: lightBeamAnim,
            transform: [
              { scale: lightBeamScale },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.8)', 'rgba(255, 255, 255, 0.3)', 'transparent']}
          style={styles.lightBeam}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.8)', 'rgba(255, 255, 255, 0.3)', 'transparent']}
          style={[styles.lightBeam, { transform: [{ rotate: '45deg' }] }]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.8)', 'rgba(255, 255, 255, 0.3)', 'transparent']}
          style={[styles.lightBeam, { transform: [{ rotate: '90deg' }] }]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(255, 215, 0, 0.8)', 'rgba(255, 255, 255, 0.3)', 'transparent']}
          style={[styles.lightBeam, { transform: [{ rotate: '135deg' }] }]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Divine Energy Ripples */}
      <Animated.View
        style={[
          styles.rippleContainer,
          {
            opacity: rippleAnim,
            transform: [{ scale: rippleScale }],
          },
        ]}
      >
        <View style={styles.ripple} />
        <View style={[styles.ripple, styles.ripple2]} />
        <View style={[styles.ripple, styles.ripple3]} />
      </Animated.View>

      {/* Central Divine Orb */}
      <Animated.View
        style={[
          styles.divineOrb,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF6347', '#FFD700']}
          style={styles.orbGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.orbInner} />
      </Animated.View>

      {/* Divine Particles */}
      <View style={styles.particlesContainer}>
        {renderDivineParticles()}
      </View>

      {/* Celestial Clouds */}
      <Animated.View
        style={[
          styles.cloudsContainer,
          {
            transform: [{ translateY: cloudAnim }],
          },
        ]}
      >
        {/* Cloud shapes would go here - simplified for now */}
        <View style={styles.cloud} />
        <View style={[styles.cloud, styles.cloud2]} />
        <View style={[styles.cloud, styles.cloud3]} />
      </Animated.View>

      {/* Divine Title */}
      {showTitle && (
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleAnim,
              transform: [
                {
                  scale: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.divineTitle}>🕉️ Divine Sarathi 🕉️</Text>
          <Text style={styles.subtitle}>Your Spiritual Guide Awakens</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a2e',
  },
  lightBeamContainer: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightBeam: {
    position: 'absolute',
    width: width * 1.5,
    height: 4,
    borderRadius: 2,
  },
  rippleContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  ripple2: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  ripple3: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: 'rgba(255, 165, 0, 0.8)',
  },
  divineOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  orbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    position: 'absolute',
  },
  orbInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
  },
  cloudsContainer: {
    position: 'absolute',
    width: '100%',
    height: 200,
    top: height * 0.2,
  },
  cloud: {
    position: 'absolute',
    width: 100,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    left: width * 0.1,
  },
  cloud2: {
    width: 150,
    height: 60,
    left: width * 0.6,
    top: 50,
  },
  cloud3: {
    width: 80,
    height: 30,
    left: width * 0.3,
    top: 100,
  },
  titleContainer: {
    position: 'absolute',
    bottom: height * 0.25,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  divineTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

export default OnboardingTransition;
