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

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = 'light';
  const theme = Colors.light;

  // Form states
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validations
  const handleSignup = () => {
    setErrorMessage('');
    if (!fullName || !businessName || !email || !password || !confirmPassword) {
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
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`Success!\nAccount created for ${businessName}.\nPlease sign in.`);
      router.push('/');
    }, 1500);
  };

  const renderForm = () => {
    const linkColor = '#004ac6'; // primary link color

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
          <Text style={[styles.title, { color: theme.text }]}>Create POS Account</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Set up your business profile to get started
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
          <Text style={[styles.inputLabel, { color: theme.text }]}>Full Name</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <MaterialIcons name="person" size={20} color={theme.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your full name"
              placeholderTextColor={theme.icon}
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Business Name</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <MaterialIcons name="storefront" size={20} color={theme.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your business name"
              placeholderTextColor={theme.icon}
              value={businessName}
              onChangeText={(text) => {
                setBusinessName(text);
                if (errorMessage) setErrorMessage('');
              }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Email Address</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <MaterialIcons name="email" size={20} color={theme.icon} style={styles.inputIcon} />
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
          <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
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

        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Confirm Password</Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <MaterialIcons name="lock-outline" size={20} color={theme.icon} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Confirm your password"
              placeholderTextColor={theme.icon}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Register Business</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Footer */}
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Already registered? </Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={[styles.footerLink, { color: linkColor }]}>Sign In</Text>
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
