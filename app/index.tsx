import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dot1Anim = useRef(new Animated.Value(1)).current;
  const dot2Anim = useRef(new Animated.Value(1)).current;
  const dot3Anim = useRef(new Animated.Value(1)).current;

  // Set up animations & redirect
  useEffect(() => {
    // 1. Entrance Fade-in and Slide-up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Continuous Logo Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Continuous Dot Pulse sequence
    const createDotLoop = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createDotLoop(dot1Anim, 0),
      createDotLoop(dot2Anim, 150),
      createDotLoop(dot3Anim, 300),
    ]).start();

    // 4. Redirect to login screen after 3 seconds
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [fadeAnim, slideAnim, pulseAnim, dot1Anim, dot2Anim, dot3Anim, router]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Decorative Background Elements */}
      <View style={styles.backgroundContainer} pointerEvents="none">
        <View style={styles.glowTopRight} />
        <View style={styles.glowBottomLeft} />
      </View>

      <Animated.View
        style={[
          styles.mainContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Brand Logo Container */}
        <Animated.View
          style={[
            styles.logoCard,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <MaterialIcons name="point-of-sale" size={48} color="#004ac6" />
        </Animated.View>

        {/* Brand Name */}
        <Text style={styles.brandTitle}>SmartPOS</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Powering your retail business</Text>
      </Animated.View>

      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
        <Text style={styles.loadingText}>Initializing System</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004ac6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: 0,
  },
  glowTopRight: {
    position: 'absolute',
    top: -SCREEN_HEIGHT * 0.1,
    right: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.8,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: SCREEN_WIDTH * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT * 0.1,
    left: -SCREEN_WIDTH * 0.2,
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: SCREEN_WIDTH * 0.35,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  mainContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoCard: {
    width: 96,
    height: 96,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 64,
    alignItems: 'center',
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});
