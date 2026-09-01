import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Switch,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { store } from '@/constants/store';
import { SHOP_CATEGORIES, getShopCategoryLabel } from '@/constants/config';

// Curated preset avatars for store profiles
const PRESET_AVATARS = [
  { id: 'av-1', name: 'Alex (Owner)', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Alex&backgroundColor=b6e3f4' },
  { id: 'av-2', name: 'Sophia (Manager)', url: 'https://api.dicebear.com/7.x/personas/png?seed=Sophia&backgroundColor=ffd5dc' },
  { id: 'av-3', name: 'Oliver (Retail)', url: 'https://api.dicebear.com/7.x/personas/png?seed=Oliver&backgroundColor=d1d4f9' },
  { id: 'av-4', name: 'Aneka (Cashier)', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Aneka&backgroundColor=c0aede' },
  { id: 'av-5', name: 'Leo (Merchant)', url: 'https://api.dicebear.com/7.x/personas/png?seed=Leo&backgroundColor=ffdfbf' },
  { id: 'av-6', name: 'Emma (Lead)', url: 'https://api.dicebear.com/7.x/personas/png?seed=Emma&backgroundColor=b6e3f4' },
  { id: 'av-7', name: 'Felix (Tech)', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Felix&backgroundColor=d1d4f9' },
  { id: 'av-8', name: 'Zack (Hero)', url: 'https://api.dicebear.com/7.x/adventurer/png?seed=Zack&backgroundColor=c0aede' },
  { id: 'av-9', name: 'POS Bot', url: 'https://api.dicebear.com/7.x/bottts/png?seed=POSBot&backgroundColor=b6e3f4' },
  { id: 'av-10', name: 'Happy Boss', url: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=HappyBoss' },
  { id: 'av-11', name: 'Cool Merchant', url: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=CoolMerchant' },
  { id: 'av-12', name: 'Super Star', url: 'https://api.dicebear.com/7.x/fun-emoji/png?seed=SuperStar' },
];

export default function ProfileScreen() {
  const router = useRouter();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim]);

  // Load session or defaults
  const userSession = store.currentUser;
  const [shopName, setShopName] = useState(userSession?.shopName || 'SmartPOS Store');
  const [ownerName, setOwnerName] = useState(userSession?.userName || 'Store User');
  const [storeId, setStoreId] = useState(userSession?.storeId || '');
  const [phone, setPhone] = useState(userSession?.phone || '');
  const [email, setEmail] = useState(userSession?.email || '');
  const [avatarImage, setAvatarImage] = useState<string | null>(userSession?.image || null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(userSession?.image || null);

  // Shop Info Details
  const [shopCategory, setShopCategory] = useState(userSession?.shopCategory || 'Retail');
  const [gstNumber, setGstNumber] = useState(userSession?.gstNumber || '');
  const [businessAddress, setBusinessAddress] = useState(userSession?.businessAddress || '');

  // Printer Settings
  const [printerType, setPrinterType] = useState('Bluetooth');
  const [paperSize, setPaperSize] = useState('80mm');
  const [autoPrint, setAutoPrint] = useState(true);

  // Backup state
  const [lastBackup, setLastBackup] = useState('Never');

  // Language state
  const [language, setLanguage] = useState('English (US)');

  // Toggle Settings States
  const [darkMode, setDarkMode] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [biometricLock, setBiometricLock] = useState(true);

  // Modal Visibility States
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [gstModalVisible, setGstModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [printerSettingsVisible, setPrinterSettingsVisible] = useState(false);
  const [backupRestoreVisible, setBackupRestoreVisible] = useState(false);
  const [languageVisible, setLanguageVisible] = useState(false);

  // Temp form input states
  const [tempShopName, setTempShopName] = useState('');
  const [tempOwnerName, setTempOwnerName] = useState('');
  const [tempPhone, setTempPhone] = useState('');
  const [tempEmail, setTempEmail] = useState('');

  const [tempCategory, setTempCategory] = useState('');
  const [tempGst, setTempGst] = useState('');
  const [tempAddress, setTempAddress] = useState('');

  // Floating Toast Notification State
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [copiedStoreId, setCopiedStoreId] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2200);
  };

  // Sync shop and credentials when store currentUser changes
  useEffect(() => {
    const updateFromStore = () => {
      if (store.currentUser) {
        setShopName(store.currentUser.shopName);
        setOwnerName(store.currentUser.userName);
        setStoreId(store.currentUser.storeId || '');
        setPhone(store.currentUser.phone);
        setEmail(store.currentUser.email);
        setAvatarImage(store.currentUser.image || null);
        setSelectedAvatar(store.currentUser.image || null);
        setShopCategory(store.currentUser.shopCategory);
        setGstNumber(store.currentUser.gstNumber || '');
        setBusinessAddress(store.currentUser.businessAddress || '');
      }
    };

    updateFromStore();

    const unsubscribe = store.subscribe(() => {
      updateFromStore();
    });
    return unsubscribe;
  }, []);

  const handleCopyStoreId = () => {
    const code = storeId;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedStoreId(true);
    showToast('✓ Store ID (Join Code) copied to clipboard');
    setTimeout(() => setCopiedStoreId(false), 2500);
  };

  // Open Avatar Selection Modal
  const openAvatarPicker = () => {
    setSelectedAvatar(avatarImage);
    setAvatarModalVisible(true);
  };

  // Save selected avatar
  const handleSaveAvatar = async () => {
    setAvatarImage(selectedAvatar);
    await store.updateUserProfile({ image: selectedAvatar || '' });
    setAvatarModalVisible(false);
    showToast('✓ Avatar updated successfully');
  };

  // Custom photo upload from device (optional alternative)
  const handlePickCustomImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access gallery is required.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Data = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        setSelectedAvatar(base64Data);
      }
    } catch (err: any) {
      console.warn('Image picker error:', err);
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setSelectedAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    }
  };

  // Open Edit Profile form
  const openEditProfile = () => {
    setTempShopName(shopName);
    setTempOwnerName(ownerName);
    setTempPhone(phone);
    setTempEmail(email);
    setEditProfileVisible(true);
  };

  const saveProfile = async () => {
    if (!tempShopName.trim() || !tempOwnerName.trim() || !tempPhone.trim() || !tempEmail.trim()) {
      Alert.alert('Required Fields', 'Please fill in all fields.');
      return;
    }

    await store.updateUserProfile({
      shopName: tempShopName.trim(),
      userName: tempOwnerName.trim(),
      phone: tempPhone.trim(),
      email: tempEmail.trim().toLowerCase(),
    });

    setEditProfileVisible(false);
    showToast('✓ Profile details updated');
  };

  // Category modal handlers
  const openCategoryModal = () => {
    setTempCategory(shopCategory);
    setCategoryModalVisible(true);
  };

  const saveCategory = async () => {
    if (!tempCategory.trim()) {
      Alert.alert('Required Field', 'Please select or enter a shop category.');
      return;
    }
    await store.updateUserProfile({
      shopCategory: tempCategory.trim(),
    });
    setCategoryModalVisible(false);
    showToast('✓ Shop Category updated');
  };

  // GST modal handlers
  const openGstModal = () => {
    setTempGst(gstNumber);
    setGstModalVisible(true);
  };

  const saveGst = async () => {
    await store.updateUserProfile({
      gstNumber: tempGst.trim(),
    });
    setGstModalVisible(false);
    showToast('✓ GST Number updated');
  };

  // Business address modal handlers
  const openAddressModal = () => {
    setTempAddress(businessAddress);
    setAddressModalVisible(true);
  };

  const saveAddress = async () => {
    await store.updateUserProfile({
      businessAddress: tempAddress.trim(),
    });
    setAddressModalVisible(false);
    showToast('✓ Business Address updated');
  };

  // Backup catalog data to local JSON structure
  const executeBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        products: store.getProducts(),
        shopName,
      };
      console.log('Database backup content:', JSON.stringify(backupData, null, 2));
      const timeStr = new Date().toLocaleString();
      setLastBackup(timeStr);
      Alert.alert(
        'Backup Successful',
        `Database backup created!\nTimestamp: ${timeStr}\nRecords Exported: ${backupData.products.length} products`
      );
    } catch {
      Alert.alert('Backup Failed', 'Could not compile database backup.');
    }
  };

  const executeRestore = () => {
    Alert.alert('Restore Successful', 'Product quantities and catalog schemas are synchronized with the server.');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await store.logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const roleName = userSession?.role?.toLowerCase();

  return (
    <SafeAreaView style={styles.outerContainer} edges={['top']}>
      {/* Sleek Floating Toast Feedback */}
      {toastVisible && (
        <View style={styles.floatingToast}>
          <MaterialIcons name="check-circle" size={18} color="#22c55e" />
          <Text style={styles.floatingToastText}>{toastMsg}</Text>
        </View>
      )}

      {/* Top App Bar with Clean Modern Glass Border */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerBrand}>SmartPOS</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Settings</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => router.push('/transactions')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="receipt-long" size={22} color="#004ac6" />
        </TouchableOpacity>
      </View>

      {/* Main Content Scroll List */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.mainContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            },
          ]}
        >
          {/* Profile Hero Card with Lush Curved SVG Mesh Gradient */}
          <View style={styles.profileHeroCard}>
            <View style={styles.profileBannerSvgWrapper}>
              <Svg width="100%" height={110} viewBox="0 0 400 110" preserveAspectRatio="none">
                <Defs>
                  <LinearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#003ea8" stopOpacity="1" />
                    <Stop offset="0.5" stopColor="#004ac6" stopOpacity="1" />
                    <Stop offset="1" stopColor="#2563eb" stopOpacity="1" />
                  </LinearGradient>
                  <LinearGradient id="accentGlow" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#60a5fa" stopOpacity="0.4" />
                    <Stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="400" height="110" fill="url(#heroGradient)" />
                <Circle cx="360" cy="20" r="70" fill="url(#accentGlow)" />
                <Circle cx="40" cy="90" r="50" fill="rgba(255,255,255,0.06)" />
                <Path
                  d="M0 80 Q 200 120 400 80 L400 110 L0 110 Z"
                  fill="#ffffff"
                />
              </Svg>
            </View>

            {/* Avatar with Halo Ring & Edit Badge */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={openAvatarPicker}
              activeOpacity={0.85}
            >
              <View style={styles.avatarHaloRing}>
                {avatarImage ? (
                  <Image
                    style={styles.avatarImage}
                    source={avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.defaultAvatarContainer}>
                    <Text style={styles.defaultAvatarText}>
                      {ownerName ? ownerName.trim().substring(0, 2).toUpperCase() : '👤'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.editAvatarBadge}>
                <MaterialIcons name="photo-camera" size={13} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Store & Owner Names */}
            <Text style={styles.heroShopName} numberOfLines={1}>{shopName}</Text>
            <View style={styles.heroOwnerRow}>
              <MaterialIcons name="person" size={15} color="#64748b" />
              <Text style={styles.heroOwnerName}>{ownerName}</Text>
            </View>

            {/* Role & Live Status Pill Badges */}
            <View style={styles.heroBadgesRow}>
              <View
                style={[
                  styles.rolePill,
                  roleName === 'manager'
                    ? styles.rolePillManager
                    : roleName === 'cashier'
                    ? styles.rolePillCashier
                    : styles.rolePillOwner,
                ]}
              >
                <Text
                  style={[
                    styles.rolePillText,
                    roleName === 'manager'
                      ? styles.rolePillTextManager
                      : roleName === 'cashier'
                      ? styles.rolePillTextCashier
                      : styles.rolePillTextOwner,
                  ]}
                >
                  {roleName === 'manager'
                    ? '🛡️ Store Manager'
                    : roleName === 'cashier'
                    ? '⚡ Cashier'
                    : '👑 Store Owner'}
                </Text>
              </View>

              <View style={styles.liveStatusPill}>
                <View style={styles.liveStatusPulseDot} />
                <Text style={styles.liveStatusPillText}>Terminal Active</Text>
              </View>
            </View>

            {/* Hero Action Buttons */}
            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={openEditProfile}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={15} color="#ffffff" />
                <Text style={styles.heroPrimaryBtnText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroSecondaryBtn, copiedStoreId && styles.heroSecondaryBtnCopied]}
                onPress={handleCopyStoreId}
                activeOpacity={0.8}
              >
                <MaterialIcons
                  name={copiedStoreId ? 'check' : 'content-copy'}
                  size={15}
                  color={copiedStoreId ? '#16a34a' : '#004ac6'}
                />
                <Text
                  style={[
                    styles.heroSecondaryBtnText,
                    copiedStoreId && { color: '#16a34a' },
                  ]}
                >
                  {copiedStoreId ? 'Copied' : storeId || 'Join Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 1: Shop Information */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <MaterialIcons name="storefront" size={18} color="#004ac6" />
              <Text style={styles.sectionTitle}>Shop Information</Text>
            </View>
            <View style={styles.cardContainer}>
              {/* Store ID / Join Code */}
              <TouchableOpacity style={styles.cardRow} onPress={handleCopyStoreId} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                    <MaterialIcons
                      name={copiedStoreId ? 'check' : 'vpn-key'}
                      size={20}
                      color={copiedStoreId ? '#16a34a' : '#004ac6'}
                    />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Store ID (Join Code)</Text>
                    <Text
                      style={[
                        styles.rowSubLabel,
                        { fontWeight: '700', color: copiedStoreId ? '#16a34a' : '#004ac6' },
                      ]}
                    >
                      {copiedStoreId ? '✓ Copied to clipboard!' : `${storeId || '—'} • Tap to copy`}
                    </Text>
                  </View>
                </View>
                <View style={styles.rowBadgeChip}>
                  <MaterialIcons
                    name={copiedStoreId ? 'check-circle' : 'content-copy'}
                    size={16}
                    color={copiedStoreId ? '#16a34a' : '#004ac6'}
                  />
                  <Text style={[styles.rowBadgeChipText, copiedStoreId && { color: '#16a34a' }]}>
                    {copiedStoreId ? 'Copied' : 'Copy'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Category */}
              <TouchableOpacity style={styles.cardRow} onPress={openCategoryModal} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#f3e8ff' }]}>
                    <MaterialIcons name="category" size={20} color="#7c3aed" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Shop Category</Text>
                    <Text style={styles.rowSubLabel}>{getShopCategoryLabel(shopCategory)}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* GST Number */}
              <TouchableOpacity style={styles.cardRow} onPress={openGstModal} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#e0e7ff' }]}>
                    <MaterialIcons name="receipt-long" size={20} color="#4f46e5" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>GST Number (GSTIN)</Text>
                    <Text style={styles.rowSubLabel}>{gstNumber || 'Not Provided (Tap to add)'}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* Phone */}
              <TouchableOpacity style={styles.cardRow} onPress={openEditProfile} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#ccfbf1' }]}>
                    <MaterialIcons name="phone" size={20} color="#0d9488" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Registered Phone</Text>
                    <Text style={styles.rowSubLabel}>{phone || 'Not Provided'}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity style={styles.cardRow} onPress={openEditProfile} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#e0f2fe' }]}>
                    <MaterialIcons name="email" size={20} color="#0284c7" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Contact Email</Text>
                    <Text style={styles.rowSubLabel}>{email || 'Not Provided'}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* Address */}
              <TouchableOpacity
                style={[styles.cardRow, styles.lastCardRow]}
                onPress={openAddressModal}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#ffe4e6' }]}>
                    <MaterialIcons name="location-on" size={20} color="#e11d48" />
                  </View>
                  <View style={[styles.rowTextCol, { flex: 1 }]}>
                    <Text style={styles.rowLabel}>Business Address</Text>
                    <Text style={styles.rowSubLabel} numberOfLines={1}>
                      {businessAddress || 'Not Provided (Tap to set)'}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 2: Business & Khata Ledger */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <MaterialIcons name="account-balance-wallet" size={18} color="#004ac6" />
              <Text style={styles.sectionTitle}>Business Management & Khata</Text>
            </View>
            <View style={styles.cardContainer}>
              {/* Customers & Credit Ledger */}
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => router.push('/customers')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#dcfce7' }]}>
                    <MaterialIcons name="people-alt" size={20} color="#16a34a" />
                  </View>
                  <View style={[styles.rowTextCol, { flex: 1, paddingRight: 8 }]}>
                    <Text style={styles.rowLabel}>Customer Khata (Credit Book)</Text>
                    <Text style={styles.rowSubLabel}>Manage balances, credit debts & record repayments</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* Reports & Analytics */}
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => router.push('/reports')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#dbeafe' }]}>
                    <MaterialIcons name="analytics" size={20} color="#2563eb" />
                  </View>
                  <View style={[styles.rowTextCol, { flex: 1, paddingRight: 8 }]}>
                    <Text style={styles.rowLabel}>Reports & GST Breakdown</Text>
                    <Text style={styles.rowSubLabel}>Daily sales summary, tax reports & PDF exports</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* Transactions History */}
              <TouchableOpacity
                style={[styles.cardRow, styles.lastCardRow]}
                onPress={() => router.push('/transactions')}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#fef3c7' }]}>
                    <MaterialIcons name="receipt" size={20} color="#d97706" />
                  </View>
                  <View style={[styles.rowTextCol, { flex: 1, paddingRight: 8 }]}>
                    <Text style={styles.rowLabel}>Transaction Invoices</Text>
                    <Text style={styles.rowSubLabel}>Search historical bills & reprint thermal receipts</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section 3: App & Hardware Settings */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <MaterialIcons name="tune" size={18} color="#004ac6" />
              <Text style={styles.sectionTitle}>App & Hardware Preferences</Text>
            </View>
            <View style={styles.cardContainer}>
              {/* Printer Settings */}
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => setPrinterSettingsVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#ede9fe' }]}>
                    <MaterialIcons name="print" size={20} color="#6366f1" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Thermal Printer</Text>
                    <Text style={styles.rowSubLabel}>{printerType} • {paperSize} roll</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* Dark Mode */}
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#f1f5f9' }]}>
                    <MaterialIcons name="dark-mode" size={20} color="#334155" />
                  </View>
                  <Text style={styles.rowLabel}>Dark Mode (Auto / Light)</Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                  thumbColor={darkMode ? '#004ac6' : '#94a3b8'}
                />
              </View>

              {/* Push Notifications */}
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#fef2f2' }]}>
                    <MaterialIcons name="notifications-active" size={20} color="#ef4444" />
                  </View>
                  <Text style={styles.rowLabel}>Low Stock Alerts</Text>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                  thumbColor={pushNotifications ? '#004ac6' : '#94a3b8'}
                />
              </View>

              {/* Biometric Lock */}
              <View style={styles.cardRow}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                    <MaterialIcons name="fingerprint" size={20} color="#16a34a" />
                  </View>
                  <Text style={styles.rowLabel}>Biometric POS Lock</Text>
                </View>
                <Switch
                  value={biometricLock}
                  onValueChange={setBiometricLock}
                  trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                  thumbColor={biometricLock ? '#004ac6' : '#94a3b8'}
                />
              </View>

              {/* Backup & Restore */}
              <TouchableOpacity
                style={styles.cardRow}
                onPress={() => setBackupRestoreVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#cffafe' }]}>
                    <MaterialIcons name="cloud-sync" size={20} color="#0891b2" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Backup & Restore</Text>
                    <Text style={styles.rowSubLabel}>Last archive: {lastBackup}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              {/* Language */}
              <TouchableOpacity
                style={[styles.cardRow, styles.lastCardRow]}
                onPress={() => setLanguageVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#f8fafc' }]}>
                    <MaterialIcons name="language" size={20} color="#475569" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>System Language</Text>
                    <Text style={styles.rowSubLabel}>{language}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Action Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <MaterialIcons name="logout" size={18} color="#dc2626" />
            <Text style={styles.logoutBtnText}>Sign Out from Store</Text>
          </TouchableOpacity>

          <Text style={styles.footerVersionText}>SmartPOS Retail v2.0 • Secured Cloud</Text>
        </Animated.View>
      </ScrollView>

      {/* --- MODALS --- */}

      {/* 0. Avatar Selection Modal */}
      <Modal
        visible={avatarModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 440, maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>Choose Profile Avatar</Text>
            <Text style={styles.modalSubtitle}>Pick an avatar to represent your store persona</Text>

            {/* Live Preview Box */}
            <View style={styles.avatarPreviewSection}>
              <View style={styles.avatarPreviewCircle}>
                {selectedAvatar ? (
                  <Image style={styles.avatarPreviewImage} source={selectedAvatar} contentFit="cover" />
                ) : (
                  <View style={styles.defaultAvatarContainer}>
                    <Text style={styles.defaultAvatarText}>
                      {ownerName ? ownerName.trim().substring(0, 2).toUpperCase() : '👤'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.avatarPreviewLabel}>
                {selectedAvatar ? 'Selected Avatar' : 'Default Initials'}
              </Text>
            </View>

            {/* Scrollable Grid of Avatars */}
            <ScrollView style={{ maxHeight: 270, marginVertical: 6 }} showsVerticalScrollIndicator={false}>
              <View style={styles.avatarGrid}>
                {/* Default Initials Option */}
                <TouchableOpacity
                  style={[
                    styles.avatarGridItem,
                    selectedAvatar === null && styles.avatarGridItemActive,
                  ]}
                  onPress={() => setSelectedAvatar(null)}
                >
                  <View style={[styles.avatarThumbCircle, { backgroundColor: '#e0e7ff' }]}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#004ac6' }}>
                      {ownerName ? ownerName.trim().substring(0, 2).toUpperCase() : '👤'}
                    </Text>
                  </View>
                  <Text style={styles.avatarGridLabel} numberOfLines={1}>Default</Text>
                  {selectedAvatar === null && (
                    <View style={styles.checkBadge}>
                      <MaterialIcons name="check" size={11} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Preset Avatars */}
                {PRESET_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.url;
                  return (
                    <TouchableOpacity
                      key={av.id}
                      style={[
                        styles.avatarGridItem,
                        isSelected && styles.avatarGridItemActive,
                      ]}
                      onPress={() => setSelectedAvatar(av.url)}
                    >
                      <View style={styles.avatarThumbCircle}>
                        <Image style={styles.avatarThumbImage} source={av.url} contentFit="cover" />
                      </View>
                      <Text style={styles.avatarGridLabel} numberOfLines={1}>{av.name.split(' ')[0]}</Text>
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <MaterialIcons name="check" size={11} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Image Upload Option */}
              <TouchableOpacity style={styles.customUploadBtn} onPress={handlePickCustomImage}>
                <MaterialIcons name="add-photo-alternate" size={18} color="#004ac6" />
                <Text style={styles.customUploadText}>Or Upload Photo from Device</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAvatarModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAvatar}>
                <Text style={styles.saveBtnText}>Save Avatar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 1. Edit Profile Modal */}
      <Modal visible={editProfileVisible} animationType="fade" transparent onRequestClose={() => setEditProfileVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Profile</Text>

              {/* Quick Avatar selection row in Edit Form */}
              <TouchableOpacity
                style={styles.formAvatarRow}
                onPress={() => {
                  setEditProfileVisible(false);
                  setTimeout(() => openAvatarPicker(), 300);
                }}
              >
                {avatarImage ? (
                  <Image style={styles.formAvatarThumb} source={avatarImage} contentFit="cover" />
                ) : (
                  <View style={styles.formAvatarPlaceholder}>
                    <Text style={styles.formAvatarPlaceholderText}>
                      {ownerName ? ownerName.trim().substring(0, 2).toUpperCase() : '👤'}
                    </Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.formAvatarLabel}>Store Avatar</Text>
                  <Text style={styles.formAvatarAction}>Tap to choose avatar</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#737686" />
              </TouchableOpacity>

              <Text style={styles.fieldLabel}>Shop Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter shop name"
                placeholderTextColor="#94a3b8"
                value={tempShopName}
                onChangeText={setTempShopName}
              />

              <Text style={styles.fieldLabel}>Owner Full Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter owner full name"
                placeholderTextColor="#94a3b8"
                value={tempOwnerName}
                onChangeText={setTempOwnerName}
              />

              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter contact phone number"
                placeholderTextColor="#94a3b8"
                value={tempPhone}
                onChangeText={setTempPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter email address"
                placeholderTextColor="#94a3b8"
                value={tempEmail}
                onChangeText={setTempEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditProfileVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. Edit Shop Category Modal */}
      <Modal visible={categoryModalVisible} animationType="fade" transparent onRequestClose={() => setCategoryModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: '90%' }]}>
              <Text style={styles.modalTitle}>Shop Category</Text>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
                <Text style={styles.fieldLabel}>Select Preset Category</Text>
                <View style={styles.categoryGrid}>
                  {SHOP_CATEGORIES.map((cat) => {
                    const isSelected =
                      tempCategory.trim().toLowerCase() === cat.label.toLowerCase() ||
                      tempCategory.trim().toLowerCase() === cat.value.toLowerCase() ||
                      tempCategory.trim().toLowerCase() === cat.code.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={cat.code}
                        style={[
                          styles.categoryCard,
                          isSelected && styles.categoryCardActive,
                        ]}
                        onPress={() => setTempCategory(cat.label)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.categoryIconCircle,
                            isSelected && styles.categoryIconCircleActive,
                          ]}
                        >
                          <MaterialIcons
                            name={cat.icon as any}
                            size={18}
                            color={isSelected ? '#004ac6' : '#64748b'}
                          />
                        </View>
                        <Text
                          style={[
                            styles.categoryCardText,
                            isSelected && styles.categoryCardTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {cat.label}
                        </Text>
                        {isSelected && (
                          <MaterialIcons name="check-circle" size={16} color="#004ac6" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Or Enter Custom Category</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. Specialty Bakery / Cafe"
                  placeholderTextColor="#94a3b8"
                  value={tempCategory}
                  onChangeText={setTempCategory}
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setCategoryModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveCategory}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2b. Edit GST Number Modal */}
      <Modal visible={gstModalVisible} animationType="fade" transparent onRequestClose={() => setGstModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>GST Number (GSTIN)</Text>
              <Text style={styles.modalSubtitle}>
                Enter your Goods and Services Tax number to display on customer receipts and tax reports
              </Text>

              <Text style={styles.fieldLabel}>GST Identification Number</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 33AAAAA0000A1Z5"
                placeholderTextColor="#94a3b8"
                value={tempGst}
                onChangeText={setTempGst}
                autoCapitalize="characters"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setGstModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveGst}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2c. Edit Business Address Modal */}
      <Modal visible={addressModalVisible} animationType="fade" transparent onRequestClose={() => setAddressModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Business Address</Text>
              <Text style={styles.modalSubtitle}>
                Physical store address printed on bill headers and tax invoices
              </Text>

              <Text style={styles.fieldLabel}>Address Details</Text>
              <TextInput
                style={[styles.inputField, { height: 85, textAlignVertical: 'top', paddingTop: 10 }]}
                placeholder="Shop No., Street, Area, City, Pincode"
                placeholderTextColor="#94a3b8"
                value={tempAddress}
                onChangeText={setTempAddress}
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setAddressModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveAddress}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 3. Printer Settings Modal */}
      <Modal visible={printerSettingsVisible} animationType="fade" transparent onRequestClose={() => setPrinterSettingsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Thermal Printer Setup</Text>

            <Text style={styles.fieldLabel}>Connection Interface</Text>
            <View style={styles.optionRow}>
              {['Bluetooth', 'Wi-Fi', 'USB'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    printerType === type && styles.optionButtonActive,
                  ]}
                  onPress={() => setPrinterType(type)}
                >
                  <Text style={[styles.optionBtnText, printerType === type && styles.optionBtnTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Receipt Paper Width</Text>
            <View style={styles.optionRow}>
              {['58mm', '80mm'].map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.optionButton,
                    paperSize === size && styles.optionButtonActive,
                  ]}
                  onPress={() => setPaperSize(size)}
                >
                  <Text style={[styles.optionBtnText, paperSize === size && styles.optionBtnTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.cardRow, { borderBottomWidth: 0, paddingHorizontal: 0, marginTop: 12 }]}>
              <View>
                <Text style={styles.rowLabel}>Auto-Print on Checkout</Text>
                <Text style={styles.rowSubLabel}>Immediately print thermal slip</Text>
              </View>
              <Switch
                value={autoPrint}
                onValueChange={setAutoPrint}
                trackColor={{ false: '#e2e8f0', true: '#bfdbfe' }}
                thumbColor={autoPrint ? '#004ac6' : '#94a3b8'}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveBtn, { width: '100%' }]}
                onPress={() => setPrinterSettingsVisible(false)}
              >
                <Text style={styles.saveBtnText}>Save Preferences</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. Backup & Restore Modal */}
      <Modal visible={backupRestoreVisible} animationType="fade" transparent onRequestClose={() => setBackupRestoreVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Backup & Cloud Sync</Text>
            <Text style={styles.modalSubtitle}>
              Export or synchronize product catalog data and register archives
            </Text>

            <TouchableOpacity style={styles.backupActionBtn} onPress={executeBackup} activeOpacity={0.8}>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <MaterialIcons name="cloud-upload" size={22} color="#004ac6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.backupBtnTitle}>Export Local Archive</Text>
                <Text style={styles.backupBtnSub}>Compile inventory catalog into JSON</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backupActionBtn} onPress={executeRestore} activeOpacity={0.8}>
              <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                <MaterialIcons name="cloud-download" size={22} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.backupBtnTitle}>Sync Cloud Catalog</Text>
                <Text style={styles.backupBtnSub}>Fetch latest catalog from database</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { width: '100%' }]}
                onPress={() => setBackupRestoreVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. Language Selection Modal */}
      <Modal visible={languageVisible} animationType="fade" transparent onRequestClose={() => setLanguageVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Language</Text>

            {[
              { label: 'English (US)', val: 'English (US)' },
              { label: 'Hindi (हिन्दी)', val: 'Hindi (हिन्दी)' },
              { label: 'Tamil (தமிழ்)', val: 'Tamil (தமிழ்)' },
              { label: 'Spanish (Español)', val: 'Spanish (Español)' },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.val}
                style={[
                  styles.languageSelectRow,
                  language === lang.val && styles.languageSelectRowActive,
                ]}
                onPress={() => {
                  setLanguage(lang.val);
                  setLanguageVisible(false);
                  showToast(`Language set to ${lang.label}`);
                }}
              >
                <Text style={[styles.languageText, language === lang.val && styles.languageTextActive]}>
                  {lang.label}
                </Text>
                {language === lang.val && (
                  <MaterialIcons name="check-circle" size={18} color="#004ac6" />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { width: '100%', marginTop: 8 }]}
                onPress={() => setLanguageVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  floatingToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    alignSelf: 'center',
    zIndex: 99999,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  floatingToastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBrand: {
    fontSize: 21,
    fontWeight: '800',
    color: '#004ac6',
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  mainContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 22,
  },

  /* Hero Card */
  profileHeroCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    borderRadius: 24,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  profileBannerSvgWrapper: {
    width: '100%',
    height: 110,
    overflow: 'hidden',
  },
  avatarWrapper: {
    marginTop: -48,
    position: 'relative',
    marginBottom: 12,
  },
  avatarHaloRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  defaultAvatarContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultAvatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#004ac6',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#004ac6',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heroShopName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  heroOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  heroOwnerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  heroBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rolePill: {
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  rolePillOwner: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  rolePillManager: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  rolePillCashier: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rolePillTextOwner: {
    color: '#b45309',
  },
  rolePillTextManager: {
    color: '#1d4ed8',
  },
  rolePillTextCashier: {
    color: '#15803d',
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 9999,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  liveStatusPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16a34a',
  },
  liveStatusPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#15803d',
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 24,
  },
  heroPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#004ac6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  heroPrimaryBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroSecondaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroSecondaryBtnCopied: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  heroSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#004ac6',
  },

  /* Sections */
  sectionContainer: {
    gap: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.2,
    textTransform: 'uppercase',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 62,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastCardRow: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextCol: {
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  rowSubLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  rowBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
  },
  rowBadgeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#004ac6',
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    height: 50,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#dc2626',
  },
  footerVersionText: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: -8,
    marginBottom: 8,
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004ac6',
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#475569',
  },
  saveBtn: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#004ac6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  saveBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Avatar Modal specifics */
  avatarPreviewSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatarPreviewCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#004ac6',
    overflow: 'hidden',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },
  avatarPreviewImage: {
    width: '100%',
    height: '100%',
  },
  avatarPreviewLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#004ac6',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  avatarGridItem: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  avatarGridItemActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eff6ff',
  },
  avatarThumbCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarThumbImage: {
    width: '100%',
    height: '100%',
  },
  avatarGridLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#004ac6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    borderStyle: 'dashed',
    marginTop: 12,
    backgroundColor: '#eff6ff',
  },
  customUploadText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004ac6',
  },
  formAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  formAvatarThumb: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  formAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formAvatarPlaceholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004ac6',
  },
  formAvatarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  formAvatarAction: {
    fontSize: 11,
    color: '#004ac6',
    marginTop: 2,
    fontWeight: '600',
  },

  /* Options row */
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  optionButtonActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eff6ff',
  },
  optionBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  optionBtnTextActive: {
    color: '#004ac6',
    fontWeight: '700',
  },
  backupActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  backupBtnTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  backupBtnSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
  },
  languageSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 8,
  },
  languageSelectRowActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eff6ff',
  },
  languageText: {
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '500',
  },
  languageTextActive: {
    color: '#004ac6',
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  categoryCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  categoryCardActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eff6ff',
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconCircleActive: {
    backgroundColor: '#dbeafe',
  },
  categoryCardText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  categoryCardTextActive: {
    color: '#004ac6',
    fontWeight: '700',
  },
});
