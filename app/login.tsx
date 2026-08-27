import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/constants/config';
import { store } from '@/constants/store';

// Specified premium fintech color system
const THEME = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  errorBackground: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#DC2626',
  success: '#16A34A',
};

const AnimatedMaterialIcon = Animated.createAnimatedComponent(MaterialIcons);

export default function LoginScreen() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Entrance animation values
  const fadeCard = useRef(new Animated.Value(0)).current;
  const translateCardY = useRef(new Animated.Value(25)).current;
  const scaleCard = useRef(new Animated.Value(0.97)).current;

  const fadeIcon = useRef(new Animated.Value(0)).current;
  const scaleIcon = useRef(new Animated.Value(0.85)).current;
  const floatIcon = useRef(new Animated.Value(0)).current;

  const fadeTitle = useRef(new Animated.Value(0)).current;
  const translateTitleY = useRef(new Animated.Value(8)).current;

  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const translateSubtitleY = useRef(new Animated.Value(8)).current;

  const fadeForm = useRef(new Animated.Value(0)).current;
  const translateFormY = useRef(new Animated.Value(12)).current;

  // 2. Input Focus animation values
  const emailFocusAnim = useRef(new Animated.Value(0)).current;
  const passwordFocusAnim = useRef(new Animated.Value(0)).current;

  // 3. Micro scale press values for inputs
  const emailPressScale = useRef(new Animated.Value(1)).current;
  const passwordPressScale = useRef(new Animated.Value(1)).current;

  // 4. Password eye visibility rotation / fade
  const eyeVisibilityAnim = useRef(new Animated.Value(0)).current;

  // 5. Tactile press feedback values for links
  const forgotPressScale = useRef(new Animated.Value(1)).current;
  const signupPressScale = useRef(new Animated.Value(1)).current;
  const supportPressScale = useRef(new Animated.Value(1)).current;

  // 6. Login button press animation (scale & shadow/color interpolation)
  const buttonPressAnim = useRef(new Animated.Value(0)).current;

  // 7. Error slide & shake animation values
  const errorOpacityAnim = useRef(new Animated.Value(0)).current;
  const errorTranslateY = useRef(new Animated.Value(-8)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;

  // 8. Auth success checkpoint scaling
  const successOpacityAnim = useRef(new Animated.Value(0)).current;
  const successScaleAnim = useRef(new Animated.Value(0.4)).current;

  // Entrance Choreography Sequence
  useEffect(() => {
    Animated.parallel([
      // Card Entrance (0ms)
      Animated.timing(fadeCard, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateCardY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleCard, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      // POS Icon Entrance (200ms delay)
      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(fadeIcon, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleIcon, {
            toValue: 1,
            duration: 450,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Title Entrance (350ms delay)
      Animated.sequence([
        Animated.delay(350),
        Animated.parallel([
          Animated.timing(fadeTitle, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateTitleY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Subtitle Entrance (450ms delay)
      Animated.sequence([
        Animated.delay(450),
        Animated.parallel([
          Animated.timing(fadeSubtitle, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateSubtitleY, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Form Elements Entrance (550ms delay)
      Animated.sequence([
        Animated.delay(550),
        Animated.parallel([
          Animated.timing(fadeForm, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(translateFormY, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // Loop slowly for gentle floating POS icon
      startIconFloat();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gentle POS Icon Floating Loop
  const startIconFloat = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatIcon, {
          toValue: -3,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatIcon, {
          toValue: 3,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Handler for custom inline validation alert animations
  const triggerErrorShake = () => {
    errorShakeAnim.setValue(0);
    errorTranslateY.setValue(-8);
    errorOpacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(errorTranslateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(errorOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Horizontal subtle shake sequence (approx 350ms total)
      Animated.sequence([
        Animated.timing(errorShakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    });
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    triggerErrorShake();
  };

  // Handler for success checkpoints before exit navigation
  const triggerSuccessSequence = (callback: () => void) => {
    setIsSuccess(true);
    Animated.parallel([
      Animated.timing(successOpacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(successScaleAnim, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wait for success check visualization (600ms)
      setTimeout(() => {
        // Exit screen animation (fade card and scale down slightly)
        Animated.parallel([
          Animated.timing(fadeCard, {
            toValue: 0.85,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(scaleCard, {
            toValue: 0.98,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          callback();
        });
      }, 600);
    });
  };

  // Input Focus Animations
  const animateInputFocus = (anim: Animated.Value, isFocused: boolean) => {
    Animated.timing(anim, {
      toValue: isFocused ? 1 : 0,
      duration: 220,
      useNativeDriver: false, // Required for border & background color interpolation
    }).start();
  };

  // Micro scale press transitions on inputs
  const animateInputPress = (scaleVal: Animated.Value, isPressing: boolean) => {
    Animated.timing(scaleVal, {
      toValue: isPressing ? 0.992 : 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Password visibility toggle click rotation
  const toggleShowPassword = () => {
    const nextVal = !showPassword;
    Animated.timing(eyeVisibilityAnim, {
      toValue: nextVal ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowPassword(nextVal);
    });
  };

  // Tactile press animations for links
  const animateLinkPress = (scaleVal: Animated.Value, isPressing: boolean) => {
    Animated.timing(scaleVal, {
      toValue: isPressing ? 0.96 : 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  // Primary Button active press styling animations
  const handleButtonPressIn = () => {
    Animated.timing(buttonPressAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.timing(buttonPressAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  // Authenticate user logic
  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      showError('Please fill in all fields.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email) && email.length < 3) {
      showError('Please enter a valid email address or username.');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_username: email.trim().toLowerCase(),
          password: password,
        }),
      });

      setIsLoading(false);

      if (!response.ok) {
        const errData = await response.json();
        showError(errData.detail || 'Login failed. Please check credentials.');
        return;
      }

      const data = await response.json();
      // Persist the session (JWT to SecureStore) before navigating, so a cold
      // start immediately after login stays logged in.
      await store.login({
        id: data.id.toString(),
        storeId: data.store_id.toString(),
        userName: data.name,
        role: data.role || 'owner',
        shopName: data.shop_name || 'SmartPOS Store',
        shopCategory: data.shop_category || 'Retail',
        phone: data.phone || '',
        email: data.email_or_username,
        image: data.image || undefined,
        gstNumber: data.gst_number || undefined,
        businessAddress: data.business_address || undefined,
        storePhone: data.store_phone || data.phone || undefined,
        token: data.token,
      });

      // Successfully authenticated with brief checkpoint sequence
      triggerSuccessSequence(() => {
        router.replace('/(tabs)/dashboard');
      });
    } catch (err) {
      console.warn("Login request failed:", err);
      setIsLoading(false);
      showError('Unable to reach the server. Check your connection and try again.');
    }
  };

  // Color & layout interpolations for input field micro-interactions
  const emailBorderColor = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.border, THEME.primary],
  });

  const emailIconColor = emailFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.textSecondary, THEME.primary],
  });

  const passwordBorderColor = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.border, THEME.primary],
  });

  const passwordIconColor = passwordFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.textSecondary, THEME.primary],
  });

  // Password visibility eye rotation
  const eyeRotation = eyeVisibilityAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Login Button Style Interpolations
  const buttonScale = buttonPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.97],
  });

  const buttonBgColor = buttonPressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [THEME.primary, THEME.primaryDark],
  });

  return (
    <SafeAreaView style={styles.outerContainer} edges={['top', 'bottom']}>
      {/* Subtle Premium Background Glow */}
      <View style={styles.backgroundGlowContainer} pointerEvents="none">
        <View style={styles.radialGlow} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.avoidingContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Centered Login Card Animated wrapper */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeCard,
                transform: [
                  { translateY: translateCardY },
                  { scale: scaleCard },
                ],
              },
            ]}
          >
            {/* Header Section */}
            <View style={styles.formHeader}>
              {/* POS Icon with floating & entrance animations */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    opacity: fadeIcon,
                    transform: [
                      { scale: scaleIcon },
                      { translateY: floatIcon },
                    ],
                  },
                ]}
              >
                <AnimatedMaterialIcon
                  name="point-of-sale"
                  size={32}
                  color={THEME.primary}
                  accessibilityLabel="SmartPOS logo"
                />
              </Animated.View>

              {/* Title with staggered entrance */}
              <Animated.View
                style={{
                  opacity: fadeTitle,
                  transform: [{ translateY: translateTitleY }],
                  alignItems: 'center',
                }}
              >
                <Text style={styles.title}>Welcome Back</Text>
              </Animated.View>

              {/* Subtitle with staggered entrance */}
              <Animated.View
                style={{
                  opacity: fadeSubtitle,
                  transform: [{ translateY: translateSubtitleY }],
                  alignItems: 'center',
                }}
              >
                <Text style={styles.subtitle}>
                  Login to manage your store
                </Text>
              </Animated.View>
            </View>

            {/* Error validation shake banner */}
            {errorMessage ? (
              <Animated.View
                style={[
                  styles.errorContainer,
                  {
                    opacity: errorOpacityAnim,
                    transform: [
                      { translateY: errorTranslateY },
                      { translateX: errorShakeAnim },
                    ],
                  },
                ]}
                accessibilityRole="alert"
              >
                <MaterialIcons name="error-outline" size={20} color={THEME.errorText} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </Animated.View>
            ) : null}

            {/* Form Fields Animated Container */}
            <Animated.View
              style={{
                opacity: fadeForm,
                transform: [{ translateY: translateFormY }],
                width: '100%',
              }}
            >
              {/* Email/Username field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email or Username</Text>
                <Animated.View style={[{ opacity: emailFocusAnim }, styles.inputGlowBorder]} />
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    {
                      borderColor: emailBorderColor,
                      transform: [{ scale: emailPressScale }],
                    },
                  ]}
                >
                  <Pressable
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPressIn={() => animateInputPress(emailPressScale, true)}
                    onPressOut={() => animateInputPress(emailPressScale, false)}
                  >
                    <View style={styles.inputIconBox}>
                      <AnimatedMaterialIcon
                        name="person"
                        size={20}
                        style={{ color: emailIconColor }}
                      />
                    </View>
                    <View style={styles.inputDivider} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email or username"
                      placeholderTextColor={THEME.textSecondary}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errorMessage) setErrorMessage('');
                      }}
                      onFocus={() => animateInputFocus(emailFocusAnim, true)}
                      onBlur={() => animateInputFocus(emailFocusAnim, false)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      accessibilityLabel="Email or Username Input Field"
                    />
                  </Pressable>
                </Animated.View>
              </View>

              {/* Password field */}
              <View style={styles.inputGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <Pressable
                    onPressIn={() => animateLinkPress(forgotPressScale, true)}
                    onPressOut={() => animateLinkPress(forgotPressScale, false)}
                    onPress={() =>
                      Alert.alert(
                        'Reset Password',
                        'To reset your password, please contact your store owner or administrator — they can update it for you from staff settings.',
                        [{ text: 'OK' }]
                      )
                    }
                    accessibilityRole="link"
                    accessibilityLabel="Forgot Password, click to reset"
                  >
                    <Animated.View style={{ transform: [{ scale: forgotPressScale }] }}>
                      <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    </Animated.View>
                  </Pressable>
                </View>
                <Animated.View style={[{ opacity: passwordFocusAnim }, styles.inputGlowBorder]} />
                <Animated.View
                  style={[
                    styles.inputWrapper,
                    {
                      borderColor: passwordBorderColor,
                      transform: [{ scale: passwordPressScale }],
                    },
                  ]}
                >
                  <Pressable
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    onPressIn={() => animateInputPress(passwordPressScale, true)}
                    onPressOut={() => animateInputPress(passwordPressScale, false)}
                  >
                    <View style={styles.inputIconBox}>
                      <AnimatedMaterialIcon
                        name="lock"
                        size={20}
                        style={{ color: passwordIconColor }}
                      />
                    </View>
                    <View style={styles.inputDivider} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={THEME.textSecondary}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errorMessage) setErrorMessage('');
                      }}
                      onFocus={() => animateInputFocus(passwordFocusAnim, true)}
                      onBlur={() => animateInputFocus(passwordFocusAnim, false)}
                      autoCapitalize="none"
                      autoCorrect={false}
                      accessibilityLabel="Password Input Field"
                    />
                  </Pressable>
                  <TouchableOpacity
                    onPress={toggleShowPassword}
                    style={styles.eyeIcon}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                  >
                    <Animated.View style={{ transform: [{ rotate: eyeRotation }] }}>
                      <MaterialIcons
                        name={showPassword ? 'visibility' : 'visibility-off'}
                        size={20}
                        color={THEME.textSecondary}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Primary Action Button (Tactile Press scale & loading checkpoint) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isLoading ? "Logging in progress" : "Login"}
                accessibilityState={{ disabled: isLoading }}
                disabled={isLoading || isSuccess}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                onPress={handleLogin}
              >
                <Animated.View
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: buttonBgColor,
                      transform: [{ scale: buttonScale }],
                    },
                    (isLoading || isSuccess) && styles.primaryButtonDisabled,
                  ]}
                >
                  {isSuccess ? (
                    <Animated.View
                      style={{
                        transform: [{ scale: successScaleAnim }],
                        opacity: successOpacityAnim,
                      }}
                    >
                      <MaterialIcons name="check" size={24} color="#FFFFFF" />
                    </Animated.View>
                  ) : isLoading ? (
                    <View style={styles.loadingButtonContent}>
                      <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinnerSpacing} />
                      <Text style={styles.primaryButtonText}>Logging in...</Text>
                    </View>
                  ) : (
                    <Text style={styles.primaryButtonText}>Login</Text>
                  )}
                </Animated.View>
              </Pressable>

              {/* Sign Up Footer */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>{"Don't have an account? "}</Text>
                <Pressable
                  onPressIn={() => animateLinkPress(signupPressScale, true)}
                  onPressOut={() => animateLinkPress(signupPressScale, false)}
                  onPress={() => router.push('/signup')}
                  accessibilityRole="link"
                  accessibilityLabel="Sign Up, click to create a new account"
                >
                  <Animated.View style={{ transform: [{ scale: signupPressScale }] }}>
                    <Text style={styles.footerLink}>Sign Up</Text>
                  </Animated.View>
                </Pressable>
              </View>
            </Animated.View>
          </Animated.View>

          {/* Help & Support Button (Tactile scale) */}
          <Animated.View
            style={[
              styles.supportContainer,
              {
                opacity: fadeForm,
                transform: [
                  { translateY: translateFormY },
                  { scale: supportPressScale },
                ],
              },
            ]}
          >
            <Pressable
              style={styles.supportButton}
              onPressIn={() => animateLinkPress(supportPressScale, true)}
              onPressOut={() => animateLinkPress(supportPressScale, false)}
              onPress={() => alert('Help & Support is currently unavailable.')}
              accessibilityRole="link"
              accessibilityLabel="Help and Support link"
            >
              <MaterialIcons name="help-outline" size={18} color={THEME.textSecondary} />
              <Text style={styles.supportText}>Help & Support</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  backgroundGlowContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  radialGlow: {
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 80,
      },
      web: {
        filter: 'blur(80px)',
      },
      android: {
        backgroundColor: 'rgba(37, 99, 235, 0.03)',
      },
    }),
  },
  avoidingContainer: {
    flex: 1,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: THEME.card,
    paddingHorizontal: 24,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    ...Platform.select({
      ios: {
        shadowColor: THEME.textPrimary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: THEME.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.errorBackground,
    borderWidth: 1,
    borderColor: THEME.errorBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  errorText: {
    color: THEME.errorText,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
    width: '100%',
    position: 'relative',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textPrimary,
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.primary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 12,
    height: 52,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    zIndex: 2,
  },
  inputGlowBorder: {
    position: 'absolute',
    left: -3,
    top: 23, // Shifted down relative to labels
    width: '100%',
    height: 58,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: 'rgba(37, 99, 235, 0.15)',
    zIndex: 1,
    paddingHorizontal: 3,
  },
  inputIconBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  inputDivider: {
    width: 1,
    height: 20,
    backgroundColor: THEME.border,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: THEME.textPrimary,
    paddingHorizontal: 14,
  },
  eyeIcon: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerSpacing: {
    marginRight: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: THEME.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.primary,
  },
  supportContainer: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  supportText: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME.textSecondary,
  },
});
