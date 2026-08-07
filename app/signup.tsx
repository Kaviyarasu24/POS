import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

const categories = [
  { label: 'Retail / Apparel', value: 'retail' },
  { label: 'Food & Beverage', value: 'fnb' },
  { label: 'Services', value: 'services' },
  { label: 'Grocery / Market', value: 'grocery' },
  { label: 'Other', value: 'other' },
];

const countryCodes = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
];

export default function SignupScreen() {
  const router = useRouter();
  const theme = Colors.light;

  // Form states
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Dropdown & password visibility states
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validations
  const handleSignup = () => {
    setErrorMessage('');
    if (!shopName || !shopCategory || !fullName || !email || !phone || !password || !confirmPassword) {
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
      alert(`Success!\nAccount created for ${shopName}.\nRegistered Phone: ${countryCode} ${phone}\nPlease sign in.`);
      router.push('/login');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          aria-label="Go back"
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create Account</Text>
      </View>

      {/* Main Content Scroll View */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Section 1: Shop Information */}
          <View style={[styles.sectionCard, showDropdown && { zIndex: 10, elevation: 10 }]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="storefront" size={20} color="#004ac6" />
              <Text style={styles.sectionTitle}>Shop Information</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Shop Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Acme Retail"
                  placeholderTextColor={theme.icon}
                  value={shopName}
                  onChangeText={(text) => {
                    setShopName(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, styles.dropdownTrigger]}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={[styles.input, { color: shopCategory ? theme.text : theme.icon }]}>
                  {shopCategory
                    ? categories.find((c) => c.value === shopCategory)?.label
                    : 'Select category'}
                </Text>
                <MaterialIcons name="expand-more" size={24} color={theme.icon} />
              </TouchableOpacity>

              {showDropdown && (
                <View style={styles.dropdownMenu}>
                  {categories.map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setShopCategory(item.value);
                        setShowDropdown(false);
                        if (errorMessage) setErrorMessage('');
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Section 2: Personal Details */}
          <View style={[styles.sectionCard, showCountryDropdown && { zIndex: 10, elevation: 10 }]}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={20} color="#004ac6" />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
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
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="john@example.com"
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
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={[styles.inputWrapper, { paddingHorizontal: 0 }]}>
                <TouchableOpacity
                  style={styles.countryCodeSelector}
                  onPress={() => setShowCountryDropdown(!showCountryDropdown)}
                >
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color={theme.icon} />
                </TouchableOpacity>
                <View style={styles.verticalDivider} />
                <TextInput
                  style={[styles.input, { paddingHorizontal: 12 }]}
                  placeholder="(555) 000-0000"
                  placeholderTextColor={theme.icon}
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="phone-pad"
                />
              </View>

              {showCountryDropdown && (
                <View style={styles.countryDropdownMenu}>
                  {countryCodes.map((item) => (
                    <TouchableOpacity
                      key={item.code}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setCountryCode(item.code);
                        setShowCountryDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>
                        {item.flag} {item.name} ({item.code})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Section 3: Security */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="lock" size={20} color="#004ac6" />
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
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
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={theme.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
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
          </View>

          {/* Submit Area */}
          <View style={styles.submitArea}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.tint }]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.primaryButtonText}>Register</Text>
                  <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/')} style={styles.loginLinkButton}>
              <Text style={styles.loginLinkLabel}>
                Already have an account? <Text style={styles.loginLinkText}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  header: {
    height: 64,
    backgroundColor: 'rgba(250, 248, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#c3c6d7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
    gap: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    width: '100%',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dae2fd',
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
    width: '100%',
    zIndex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#004ac6',
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
    position: 'relative',
  },
  inputLabel: {
    fontSize: 14,
    color: '#434655',
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#faf8ff',
  },
  dropdownTrigger: {
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#131b2e',
    padding: 0,
    textAlignVertical: 'center',
  },
  eyeIcon: {
    padding: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#131b2e',
  },
  submitArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(37,99,235,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginLinkButton: {
    paddingVertical: 8,
  },
  loginLinkLabel: {
    fontSize: 14,
    color: '#434655',
  },
  loginLinkText: {
    color: '#004ac6',
    fontWeight: '600',
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#131b2e',
    marginRight: 2,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#c3c6d7',
  },
  countryDropdownMenu: {
    position: 'absolute',
    top: 74,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200,
  },
});
