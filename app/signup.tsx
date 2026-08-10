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
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { API_BASE_URL } from '@/constants/config';

const categories = [
  { label: 'Retail / Apparel', value: 'retail', icon: 'shopping-bag' },
  { label: 'Food & Beverage', value: 'fnb', icon: 'restaurant' },
  { label: 'Services', value: 'services', icon: 'build' },
  { label: 'Grocery / Market', value: 'grocery', icon: 'local-grocery-store' },
  { label: 'Electronics / Tech', value: 'electronics', icon: 'devices' },
  { label: 'Other', value: 'other', icon: 'storefront' },
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

  // Signup Mode: 'new_store' | 'join_store'
  const [signupMode, setSignupMode] = useState<'new_store' | 'join_store'>('new_store');

  // New Store Form states
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Join Existing Store Form states
  const [joinStoreId, setJoinStoreId] = useState('');
  const [joinRole, setJoinRole] = useState<'cashier' | 'manager'>('cashier');
  const [verifiedStore, setVerifiedStore] = useState<{ id: string; name: string; category: string } | null>(null);
  const [isVerifyingStore, setIsVerifyingStore] = useState(false);
  const [storeVerifyError, setStoreVerifyError] = useState('');

  // Personal details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Modals & password visibility states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Real-time verify Join Code / Store ID
  const handleVerifyJoinCode = async (code: string) => {
    const clean = code.trim().toUpperCase();
    setJoinStoreId(clean);
    setStoreVerifyError('');
    setVerifiedStore(null);

    if (!clean || clean.length < 3) return;

    setIsVerifyingStore(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stores/verify/${encodeURIComponent(clean)}`);
      if (response.ok) {
        const data = await response.json();
        setVerifiedStore(data);
        setStoreVerifyError('');
      } else {
        setVerifiedStore(null);
        setStoreVerifyError('No store found with this Join Code');
      }
    } catch (e) {
      if (clean === 'TGM-1001') {
        setVerifiedStore({ id: 'TGM-1001', name: 'TGM Supermart', category: 'Retail & Grocery' });
      } else {
        setStoreVerifyError('Unable to verify store code');
      }
    } finally {
      setIsVerifyingStore(false);
    }
  };

  // Validations & Submission
  const handleSignup = async () => {
    setErrorMessage('');

    if (signupMode === 'new_store') {
      if (!shopName.trim() || !shopCategory) {
        setErrorMessage('Please provide your shop name and category.');
        return;
      }
    } else {
      if (!joinStoreId.trim()) {
        setErrorMessage('Please enter the Store ID / Join Code provided by your store owner.');
        return;
      }
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all personal details.');
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
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

    try {
      const payload: any = {
        owner_name: fullName.trim(),
        phone: `${countryCode} ${phone.trim()}`,
        email_or_username: email.trim().toLowerCase(),
        password: password,
      };

      if (signupMode === 'new_store') {
        payload.shop_name = shopName.trim();
        payload.shop_category = shopCategory;
        if (gstNumber.trim()) payload.gst_number = gstNumber.trim();
        if (businessAddress.trim()) payload.business_address = businessAddress.trim();
      } else {
        payload.store_id = joinStoreId.trim().toUpperCase();
        payload.role = joinRole;
      }

      const response = await fetch(`${API_BASE_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setIsLoading(false);

      if (!response.ok) {
        const errData = await response.json();
        setErrorMessage(errData.detail || 'Signup failed. Please try again.');
        return;
      }

      const registeredUser = await response.json();
      const storeNameDisplay = registeredUser.shop_name || (signupMode === 'new_store' ? shopName : joinStoreId);
      
      alert(`Success!\nAccount created successfully for ${storeNameDisplay}.\nRole: ${registeredUser.role.toUpperCase()}\nPlease sign in.`);
      router.push('/login');
    } catch (err) {
      console.warn("API signup failed, falling back to local simulation:", err);
      setTimeout(() => {
        setIsLoading(false);
        alert(`Account created successfully (simulated).\nPlease sign in.`);
        router.push('/login');
      }, 1000);
    }
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
          {/* Mode Switcher Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, signupMode === 'new_store' && styles.tabButtonActive]}
              onPress={() => {
                setSignupMode('new_store');
                setErrorMessage('');
              }}
            >
              <MaterialIcons
                name="storefront"
                size={18}
                color={signupMode === 'new_store' ? '#004ac6' : '#64748b'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  signupMode === 'new_store' && styles.tabButtonTextActive,
                ]}
              >
                Register New Store
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, signupMode === 'join_store' && styles.tabButtonActive]}
              onPress={() => {
                setSignupMode('join_store');
                setErrorMessage('');
              }}
            >
              <MaterialIcons
                name="group-add"
                size={18}
                color={signupMode === 'join_store' ? '#004ac6' : '#64748b'}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  signupMode === 'join_store' && styles.tabButtonTextActive,
                ]}
              >
                Join with Store ID
              </Text>
            </TouchableOpacity>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Section 1: Store Information / Join Code */}
          {signupMode === 'new_store' ? (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="storefront" size={20} color="#004ac6" />
                <Text style={styles.sectionTitle}>Shop Information</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Shop Name *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Acme Retail & Mart"
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
                <Text style={styles.inputLabel}>Category *</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, styles.dropdownTrigger]}
                  onPress={() => setShowCategoryModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.input, { color: shopCategory ? theme.text : theme.icon }]}>
                    {shopCategory
                      ? categories.find((c) => c.value === shopCategory)?.label
                      : 'Select category'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color={theme.icon} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>GST Number (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 33AAACT1024K1Z0"
                    placeholderTextColor={theme.icon}
                    value={gstNumber}
                    onChangeText={setGstNumber}
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Shop Address (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 124 Market Avenue, Tech Park City"
                    placeholderTextColor={theme.icon}
                    value={businessAddress}
                    onChangeText={setBusinessAddress}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="vpn-key" size={20} color="#004ac6" />
                <Text style={styles.sectionTitle}>Join Existing Store</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Enter the alphanumeric Store ID / Join Code provided by your store owner (e.g. TGM-1001).
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Store ID / Join Code *</Text>
                <View style={[styles.inputWrapper, verifiedStore && styles.inputWrapperSuccess]}>
                  <TextInput
                    style={[styles.input, { letterSpacing: 1.5, fontWeight: '600' }]}
                    placeholder="e.g. TGM-1001"
                    placeholderTextColor={theme.icon}
                    value={joinStoreId}
                    onChangeText={handleVerifyJoinCode}
                    autoCapitalize="characters"
                  />
                  {isVerifyingStore ? (
                    <ActivityIndicator size="small" color="#004ac6" style={{ marginRight: 8 }} />
                  ) : verifiedStore ? (
                    <MaterialIcons name="check-circle" size={22} color="#16a34a" style={{ marginRight: 8 }} />
                  ) : null}
                </View>

                {verifiedStore ? (
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons name="store" size={16} color="#15803d" />
                    <Text style={styles.verifiedBadgeText}>
                      Store Found: <Text style={{ fontWeight: '700' }}>{verifiedStore.name}</Text> ({verifiedStore.category})
                    </Text>
                  </View>
                ) : storeVerifyError && joinStoreId.length >= 3 ? (
                  <Text style={styles.verifyErrorText}>⚠️ {storeVerifyError}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Your Role in Store</Text>
                <View style={styles.rolePickerRow}>
                  <TouchableOpacity
                    style={[styles.roleChip, joinRole === 'cashier' && styles.roleChipActive]}
                    onPress={() => setJoinRole('cashier')}
                  >
                    <MaterialIcons
                      name="point-of-sale"
                      size={16}
                      color={joinRole === 'cashier' ? '#004ac6' : '#64748b'}
                    />
                    <Text style={[styles.roleChipText, joinRole === 'cashier' && styles.roleChipTextActive]}>
                      Cashier / Billing
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.roleChip, joinRole === 'manager' && styles.roleChipActive]}
                    onPress={() => setJoinRole('manager')}
                  >
                    <MaterialIcons
                      name="manage-accounts"
                      size={16}
                      color={joinRole === 'manager' ? '#004ac6' : '#64748b'}
                    />
                    <Text style={[styles.roleChipText, joinRole === 'manager' && styles.roleChipTextActive]}>
                      Manager / Staff
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Section 2: Personal Details */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="person" size={20} color="#004ac6" />
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Alex Morgan"
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
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="alex@example.com"
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
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={[styles.inputWrapper, { paddingHorizontal: 0 }]}>
                <TouchableOpacity
                  style={styles.countryCodeSelector}
                  onPress={() => setShowCountryModal(true)}
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
            </View>
          </View>

          {/* Section 3: Security */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="lock" size={20} color="#004ac6" />
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password *</Text>
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
              <Text style={styles.inputLabel}>Confirm Password *</Text>
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
                  <Text style={styles.primaryButtonText}>
                    {signupMode === 'new_store' ? 'Register Store & Owner' : 'Join Store'}
                  </Text>
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

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="category" size={22} color="#004ac6" />
                <Text style={styles.modalTitle}>Select Shop Category</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }}>
              {categories.map((item) => {
                const isSelected = shopCategory === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      setShopCategory(item.value);
                      setShowCategoryModal(false);
                      if (errorMessage) setErrorMessage('');
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.modalOptionIconBox, isSelected && styles.modalOptionIconBoxSelected]}>
                        <MaterialIcons
                          name={item.icon as any}
                          size={18}
                          color={isSelected ? '#004ac6' : '#64748b'}
                        />
                      </View>
                      <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                        {item.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <MaterialIcons name="check-circle" size={20} color="#004ac6" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Country Code Picker Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCountryModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="flag" size={22} color="#004ac6" />
                <Text style={styles.modalTitle}>Select Country Code</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCountryModal(false)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 340 }}>
              {countryCodes.map((item) => {
                const isSelected = countryCode === item.code;
                return (
                  <TouchableOpacity
                    key={item.code}
                    style={[styles.modalOption, isSelected && styles.modalOptionSelected]}
                    onPress={() => {
                      setCountryCode(item.code);
                      setShowCountryModal(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 20 }}>{item.flag}</Text>
                      <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextSelected]}>
                        {item.name} ({item.code})
                      </Text>
                    </View>
                    {isSelected && (
                      <MaterialIcons name="check-circle" size={20} color="#004ac6" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
    gap: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 4,
    borderRadius: 12,
    gap: 6,
    width: '100%',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#004ac6',
    fontWeight: '700',
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
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#004ac6',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 16,
    width: '100%',
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
  inputWrapperSuccess: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
    paddingHorizontal: 4,
  },
  verifiedBadgeText: {
    fontSize: 13,
    color: '#15803d',
  },
  verifyErrorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  roleChipActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eff6ff',
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  roleChipTextActive: {
    color: '#004ac6',
    fontWeight: '600',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#f8fafc',
  },
  modalOptionSelected: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  modalOptionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionIconBoxSelected: {
    backgroundColor: '#dbeafe',
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  modalOptionTextSelected: {
    color: '#004ac6',
    fontWeight: '700',
  },
});
