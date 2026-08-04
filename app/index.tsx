import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const BREAKPOINT_WIDTH = 768;

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const isWebSplit = Platform.OS === 'web' && width > BREAKPOINT_WIDTH;

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validations
  const handleLogin = () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`Welcome to SMART POS System!\nLogged in as: ${email}`);
    }, 1500);
  };

  const renderForm = () => {
    return (
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        {/* Header (visible on mobile only inside the form, hidden on web split since left pane handles it) */}
        {!isWebSplit && (
          <View style={styles.mobileHeader}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoMobile}
              contentFit="contain"
            />
            <Text style={[styles.title, { color: theme.text }]}>SMART POS System</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter your credentials to access your store
            </Text>
          </View>
        )}

        {isWebSplit && (
          <View style={styles.webFormHeader}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Welcome Back</Text>
            <Text style={[styles.formSubtitle, { color: theme.textSecondary }]}>
              Sign in to your point of sale terminal
            </Text>
          </View>
        )}

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#f1f5f9' }]}>
            <Feather name="mail" size={20} color={theme.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="manager@store.com"
              placeholderTextColor={theme.icon}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#f1f5f9' }]}>
            <Feather name="lock" size={20} color={theme.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="••••••••"
              placeholderTextColor={theme.icon}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.icon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <Pressable onPress={() => setRememberMe(!rememberMe)} style={styles.checkboxContainer}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: theme.tint,
                  backgroundColor: rememberMe ? theme.tint : 'transparent',
                },
              ]}
            >
              {rememberMe && <Feather name="check" size={12} color="#ffffff" />}
            </View>
            <Text style={[styles.checkboxLabel, { color: theme.textSecondary }]}>Remember me</Text>
          </Pressable>
          <TouchableOpacity onPress={() => alert('Reset password link sent to email.')}>
            <Text style={[styles.forgotPassword, { color: theme.tint }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Sign In to Terminal</Text>
          )}
        </TouchableOpacity>

        {/* Footer Navigation */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>New business? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={[styles.footerLink, { color: theme.tint }]}>Create POS Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLeftPane = () => {
    return (
      <View
        style={[
          styles.leftPane,
          Platform.select({
            web: {
              backgroundImage: 'linear-gradient(135deg, #312e81 0%, #0f172a 100%)',
            },
            default: {
              backgroundColor: '#1e1b4b',
            },
          }) as any,
        ]}
      >
        <View style={styles.brandingContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoWeb}
            contentFit="contain"
          />
          <Text style={styles.webTitle}>SMART POS System</Text>
          <Text style={styles.webSubtitle}>
            Unify your sales, inventory, and analytics in real-time. Designed for quick checkouts and smart growth.
          </Text>
        </View>

        {/* Simulated iPad POS device frame */}
        <View style={styles.deviceFrame}>
          <Image
            source={require('@/assets/images/pos-preview.png')}
            style={styles.previewImage}
            contentFit="cover"
          />
        </View>
      </View>
    );
  };

  if (isWebSplit) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {renderLeftPane()}
        <View style={styles.rightPane}>{renderForm()}</View>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.mobileFormContainer}>{renderForm()}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  leftPane: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    overflow: 'hidden',
  },
  rightPane: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 40,
    maxWidth: 480,
  },
  logoWeb: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  webTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  webSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 24,
  },
  deviceFrame: {
    width: '90%',
    aspectRatio: 1.6,
    borderRadius: 20,
    borderWidth: 12,
    borderColor: '#1e293b',
    backgroundColor: '#020617',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  previewImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mobileFormContainer: {
    width: '100%',
    maxWidth: 420,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  mobileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoMobile: {
    width: 70,
    height: 70,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  webFormHeader: {
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 14,
  },
  forgotPassword: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
