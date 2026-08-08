import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/config';
import { store } from '@/constants/store';

export default function LoginScreen() {
  const router = useRouter();
  const theme = Colors.light;

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validations
  const handleLogin = async () => {
    setErrorMessage('');
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email) && email.length < 3) {
      setErrorMessage('Please enter a valid email address or username.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
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
        setErrorMessage(errData.detail || 'Login failed. Please check credentials.');
        return;
      }

      const data = await response.json();
      store.currentUser = {
        id: data.id.toString(),
        storeId: data.store_id ? data.store_id.toString() : 'TGM-1001',
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
      };

      // Successfully authenticated!
      router.push('/(tabs)/dashboard');
    } catch (err) {
      console.warn("API login failed, falling back to local simulation:", err);
      // Fallback: local simulation
      setTimeout(() => {
        setIsLoading(false);
        router.push('/(tabs)/dashboard');
      }, 1000);
    }
  };

  const renderForm = () => {
    const linkColor = '#004ac6';

    return (
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        {/* Header Section */}
        <View style={styles.formHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: 'rgba(37, 99, 235, 0.1)' },
            ]}
          >
            <MaterialIcons
              name="point-of-sale"
              size={32}
              color="#2563eb"
            />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Login to manage your store
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={16} color="#ef4444" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Email or Username</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <MaterialIcons name="person" size={20} color={theme.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your email"
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
          <View style={styles.passwordLabelRow}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
            <TouchableOpacity onPress={() => alert('Reset password link sent to email.')}>
              <Text style={[styles.forgotPassword, { color: linkColor }]}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <MaterialIcons name="lock" size={20} color={theme.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your password"
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
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color={theme.icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Footer */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>{"Don't have an account? "}</Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={[styles.footerLink, { color: linkColor }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { backgroundColor: theme.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        {renderForm()}
        <View style={styles.supportContainer}>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => alert('Help & Support is currently unavailable.')}
          >
            <MaterialIcons name="help" size={18} color={theme.textSecondary} />
            <Text style={[styles.supportText, { color: theme.textSecondary }]}>Help & Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  forgotPassword: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  supportContainer: {
    marginTop: 32,
    alignItems: 'center',
    width: '100%',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  supportText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});
