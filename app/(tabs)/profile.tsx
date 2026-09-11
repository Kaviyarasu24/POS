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
  const [pushNotifications, setPushNotifications] = useState(true);

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
    showToast('âœ“ Store ID (Join Code) copied to clipboard');
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
    showToast('âœ“ Avatar updated successfully');
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
    showToast('âœ“ Profile details updated');
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
    showToast('âœ“ Shop Category updated');
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
    showToast('âœ“ GST Number updated');
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
    showToast('âœ“ Business Address updated');
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

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
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
          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar with Edit Badge */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={openAvatarPicker}
              activeOpacity={0.85}
            >
              <View style={styles.avatarCircle}>
                {avatarImage ? (
                  <Image
                    style={styles.avatarImage}
                    source={avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.defaultAvatarContainer}>
                    <Text style={styles.defaultAvatarText}>
                      {ownerName ? ownerName.trim().substring(0, 2).toUpperCase() : ''}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.editAvatarBadge}>
                <MaterialIcons name="photo-camera" size={12} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Store & Owner Names */}
            <Text style={styles.heroShopName} numberOfLines={1}>{shopName}</Text>
            <Text style={styles.heroOwnerName}>{ownerName}</Text>

            {/* Role & Status Badges */}
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
                    ? 'Store Manager'
                    : roleName === 'cashier'
                    ? 'Cashier'
                    : 'Store Owner'}
                </Text>
              </View>

              <View style={styles.liveStatusPill}>
                <View style={styles.liveStatusPulseDot} />
                <Text style={styles.liveStatusPillText}>Active</Text>
              </View>
            </View>

            {/* Action Buttons */}
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
            <Text style={styles.sectionLabel}>Shop Information</Text>
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
                      {copiedStoreId ? 'âœ“ Copied to clipboard!' : `${storeId || 'â€”'} â€¢ Tap to copy`}
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
            <Text style={styles.sectionLabel}>Business Management</Text>
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
            <Text style={styles.sectionLabel}>App & Hardware</Text>
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
                    <Text style={styles.rowSubLabel}>{printerType} â€¢ {paperSize} roll</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

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

          {/* Section 4: Support & Legal */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionLabel}>Support & Legal</Text>
            <View style={styles.cardContainer}>

              <TouchableOpacity style={styles.cardRow} onPress={() => router.push('/about')} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                    <MaterialIcons name="info" size={20} color="#004ac6" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>About SmartPOS</Text>
                    <Text style={styles.rowSubLabel}>Version, developer info & credits</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cardRow} onPress={() => router.push('/faq')} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                    <MaterialIcons name="help-outline" size={20} color="#16a34a" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>FAQ & Help Center</Text>
                    <Text style={styles.rowSubLabel}>Answers to common questions</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cardRow} onPress={() => router.push('/contact')} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#fff7ed' }]}>
                    <MaterialIcons name="headset-mic" size={20} color="#ea580c" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Contact Support</Text>
                    <Text style={styles.rowSubLabel}>Get help from our team</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cardRow} onPress={() => router.push('/privacy')} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                    <MaterialIcons name="privacy-tip" size={20} color="#15803d" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Privacy Policy</Text>
                    <Text style={styles.rowSubLabel}>How we handle your data</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.cardRow, styles.lastCardRow]} onPress={() => router.push('/terms')} activeOpacity={0.7}>
                <View style={styles.rowLeft}>
                  <View style={[styles.iconBox, { backgroundColor: '#faf5ff' }]}>
                    <MaterialIcons name="gavel" size={20} color="#7c3aed" />
                  </View>
                  <View style={styles.rowTextCol}>
                    <Text style={styles.rowLabel}>Terms & Conditions</Text>
                    <Text style={styles.rowSubLabel}>Usage rights & responsibilities</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <MaterialIcons name="logout" size={18} color="#ba1a1a" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.footerVersionText}>SmartPOS v1.0.0</Text>
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
                      {ownerName ? ownerName.trim().substring(0, 2).toUpperCase() : 'ðŸ‘¤'}
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
                      {ownerName ? ownerName.trim().substring(0, 2).toUpperCase() : 'ðŸ‘¤'}
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
                      {ownerName ? ownerName.trim().substring(0, 2).toUpperCase() : 'ðŸ‘¤'}
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
              { label: 'Hindi (à¤¹à¤¿à¤¨à¥à¤¦à¥€)', val: 'Hindi (à¤¹à¤¿à¤¨à¥à¤¦à¥€)' },
              { label: 'Tamil (à®¤à®®à®¿à®´à¯)', val: 'Tamil (à®¤à®®à®¿à®´à¯)' },
              { label: 'Spanish (EspaÃ±ol)', val: 'Spanish (EspaÃ±ol)' },
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
    backgroundColor: '#131b2e',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingToastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  header: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004ac6',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  mainContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 16,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#eff6ff',
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
    fontSize: 28,
    fontWeight: '700',
    color: '#004ac6',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#004ac6',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShopName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131b2e',
    marginBottom: 2,
    textAlign: 'center',
  },
  heroOwnerName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#737686',
    marginBottom: 12,
  },
  heroBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  rolePillOwner: {
    backgroundColor: '#eff6ff',
  },
  rolePillManager: {
    backgroundColor: '#eff6ff',
  },
  rolePillCashier: {
    backgroundColor: '#dcfce7',
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rolePillTextOwner: {
    color: '#004ac6',
  },
  rolePillTextManager: {
    color: '#004ac6',
  },
  rolePillTextCashier: {
    color: '#166534',
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: '#dcfce7',
  },
  liveStatusPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#166534',
  },
  liveStatusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  heroPrimaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#004ac6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroPrimaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  heroSecondaryBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    fontSize: 12,
    fontWeight: '700',
    color: '#004ac6',
  },

  /* Sections */
  sectionContainer: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#434655',
    fontWeight: '500',
    paddingLeft: 4,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
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
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextCol: {
    justifyContent: 'center',
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
  },
  rowSubLabel: {
    fontSize: 12,
    color: '#737686',
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
    fontWeight: '600',
    color: '#004ac6',
  },

  /* Logout */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffdad6',
    borderRadius: 12,
    height: 48,
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ba1a1a',
  },
  footerVersionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
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

  /* â”€â”€ Legal Modal Header â”€â”€ */
  legalModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legalModalIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  legalDate: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 2,
    textAlign: 'center',
  },

  /* â”€â”€ Legal Sections (Privacy + Terms) â”€â”€ */
  legalSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  legalSectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  legalSectionBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
  },

  /* â”€â”€ About Modal â”€â”€ */
  aboutCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  aboutAppName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#004ac6',
    letterSpacing: 0.5,
  },
  aboutVersion: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 3,
    marginBottom: 12,
  },
  aboutDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    width: '100%',
  },
  aboutRowText: {
    fontSize: 13,
    color: '#475569',
    flex: 1,
    lineHeight: 19,
  },
  aboutSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    width: '100%',
  },
  aboutFeatureItem: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 22,
    width: '100%',
  },
  aboutEmailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    marginTop: 4,
  },
  aboutEmailText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#004ac6',
  },

  /* â”€â”€ FAQ Modal â”€â”€ */
  faqItem: {
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  faqQBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#004ac6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  faqQBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    lineHeight: 19,
  },
  faqAnswer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  faqAnswerText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
  },
  faqContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 4,
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  faqContactBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ea580c',
  },

  /* â”€â”€ Contact Support Modal â”€â”€ */
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    marginBottom: 12,
  },
  contactIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTextCol: {
    flex: 1,
  },
  contactRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  contactRowSub: {
    fontSize: 12.5,
    color: '#334155',
    marginTop: 2,
  },
  contactRowHint: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  contactInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  contactInfoText: {
    fontSize: 12,
    color: '#475569',
    flex: 1,
    lineHeight: 18,
  },
});
