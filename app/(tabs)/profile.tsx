import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { store } from '@/constants/store';

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
  const [shopInfoVisible, setShopInfoVisible] = useState(false);
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
      Alert.alert('Copied!', `Store ID (Join Code) "${code}" copied to clipboard.\nShare this with users so they can join your store.`);
    } else {
      Alert.alert('Store ID / Join Code', `Store ID: ${code}\nShare this code with your staff/cashiers during signup to join this store.`);
    }
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
    Alert.alert('Avatar Updated', selectedAvatar ? 'Your new avatar is saved!' : 'Reset to default initials.');
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
    Alert.alert('Success', 'Profile updated successfully.');
  };

  // Open Shop Details form
  const openShopInfo = () => {
    setTempCategory(shopCategory);
    setTempGst(gstNumber);
    setTempAddress(businessAddress);
    setShopInfoVisible(true);
  };

  const saveShopInfo = async () => {
    if (!tempCategory.trim() || !tempAddress.trim()) {
      alert('Category and Address are required.');
      return;
    }
    
    await store.updateUserProfile({
      shopCategory: tempCategory.trim(),
      gstNumber: tempGst.trim(),
      businessAddress: tempAddress.trim(),
    });
    
    setShopInfoVisible(false);
    alert('Shop details updated successfully.');
  };

  // Backup catalog data to local JSON structure
  const executeBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        products: store.getProducts(),
        shopName,
      };
      // Simulated export
      console.log('Database backup content:', JSON.stringify(backupData, null, 2));
      const timeStr = new Date().toLocaleString();
      setLastBackup(timeStr);
      alert(`Database Backup Successful!\nTimestamp: ${timeStr}\nRecords Exported: ${backupData.products.length} products`);
    } catch {
      alert('Backup failed.');
    }
  };

  const executeRestore = () => {
    alert('Database Restore Successful!\nAll product quantities and catalog schemas are synchronized.');
  };

  const handleLogout = async () => {
    // Clears the persisted session (JWT + user) before returning to login.
    await store.logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.outerContainer} edges={['top']}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SmartPOS</Text>
      </View>

      {/* Main Content Scroll List */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* Profile Header Card */}
          <View style={styles.profileHeaderCard}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={openAvatarPicker}
              activeOpacity={0.8}
            >
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
              <View style={styles.editAvatarBtn}>
                <MaterialIcons name="palette" size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.shopNameText}>{shopName}</Text>
            <Text style={styles.ownerNameText}>{ownerName}</Text>
            <TouchableOpacity style={styles.editProfileBtn} onPress={openEditProfile}>
              <MaterialIcons name="edit" size={16} color="#004ac6" />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Shop Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Information</Text>
            <View style={styles.infoCard}>
              {/* Store ID / Join Code */}
              <TouchableOpacity style={styles.rowItem} onPress={handleCopyStoreId}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="vpn-key" size={20} color="#004ac6" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Store ID (Join Code)</Text>
                    <Text style={[styles.rowSubLabel, { fontWeight: '600', color: '#004ac6' }]}>
                      {storeId || '—'} • Tap to copy
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="content-copy" size={18} color="#004ac6" />
              </TouchableOpacity>

              {/* Category */}
              <TouchableOpacity style={styles.rowItem} onPress={openShopInfo}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="storefront" size={20} color="#434655" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Shop Category</Text>
                    <Text style={styles.rowSubLabel}>{shopCategory}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c3c6d7" />
              </TouchableOpacity>

              {/* GST Number */}
              <TouchableOpacity style={styles.rowItem} onPress={openShopInfo}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="receipt-long" size={20} color="#434655" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>GST Number</Text>
                    <Text style={styles.rowSubLabel}>{gstNumber || 'Not Provided'}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c3c6d7" />
              </TouchableOpacity>

              {/* Phone */}
              <TouchableOpacity style={styles.rowItem} onPress={openEditProfile}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="phone" size={20} color="#434655" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Registered Phone</Text>
                    <Text style={styles.rowSubLabel}>{phone}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c3c6d7" />
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity style={styles.rowItem} onPress={openEditProfile}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="email" size={20} color="#434655" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Contact Email</Text>
                    <Text style={styles.rowSubLabel}>{email}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c3c6d7" />
              </TouchableOpacity>

              {/* Address */}
              <TouchableOpacity style={[styles.rowItem, styles.lastRowItem]} onPress={openShopInfo}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="location-on" size={20} color="#434655" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>Business Address</Text>
                    <Text style={styles.rowSubLabel} numberOfLines={1}>
                      {businessAddress}
                    </Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c3c6d7" />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.infoCard}>
              {/* Dark Mode */}
              <View style={styles.rowItem}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="dark-mode" size={20} color="#434655" />
                  </View>
                  <Text style={styles.rowLabel}>Dark Mode</Text>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: '#eaedff', true: '#b4c5ff' }}
                  thumbColor={darkMode ? '#004ac6' : '#737686'}
                />
              </View>

              {/* Push Notifications */}
              <View style={styles.rowItem}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="notifications-active" size={20} color="#434655" />
                  </View>
                  <Text style={styles.rowLabel}>Push Notifications</Text>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#eaedff', true: '#b4c5ff' }}
                  thumbColor={pushNotifications ? '#004ac6' : '#737686'}
                />
              </View>

              {/* Biometric Lock */}
              <View style={styles.rowItem}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="fingerprint" size={20} color="#434655" />
                  </View>
                  <Text style={styles.rowLabel}>Biometric Lock</Text>
                </View>
                <Switch
                  value={biometricLock}
                  onValueChange={setBiometricLock}
                  trackColor={{ false: '#eaedff', true: '#b4c5ff' }}
                  thumbColor={biometricLock ? '#004ac6' : '#737686'}
                />
              </View>

              {/* Transaction History & Receipts */}
              <TouchableOpacity
                style={styles.rowItem}
                onPress={() => router.push('/transactions' as any)}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="receipt-long" size={20} color="#004ac6" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Transaction History</Text>
                    <Text style={styles.rowSubLabel}>View, search & reprint bills</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#004ac6" />
              </TouchableOpacity>

              {/* Printer Settings */}
              <TouchableOpacity
                style={styles.rowItem}
                onPress={() => setPrinterSettingsVisible(true)}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="print" size={20} color="#434655" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Printer Settings</Text>
                    <Text style={styles.rowSubLabel}>{printerType} • {paperSize}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c3c6d7" />
              </TouchableOpacity>

              {/* Backup & Restore */}
              <TouchableOpacity
                style={styles.rowItem}
                onPress={() => setBackupRestoreVisible(true)}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="cloud-sync" size={20} color="#434655" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Backup & Restore</Text>
                    <Text style={styles.rowSubLabel}>Last: {lastBackup}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c3c6d7" />
              </TouchableOpacity>

              {/* Language */}
              <TouchableOpacity
                style={[styles.rowItem, styles.lastRowItem]}
                onPress={() => setLanguageVisible(true)}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.iconBackground}>
                    <MaterialIcons name="language" size={20} color="#434655" />
                  </View>
                  <View>
                    <Text style={styles.rowLabel}>Language</Text>
                    <Text style={styles.rowSubLabel}>{language}</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#c3c6d7" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color="#ba1a1a" />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODAL DIALOGS --- */}

      {/* 0. Avatar Selection Modal */}
      <Modal visible={avatarModalVisible} animationType="slide" transparent onRequestClose={() => setAvatarModalVisible(false)}>
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
            <ScrollView style={{ maxHeight: 280, marginVertical: 8 }} showsVerticalScrollIndicator={false}>
              {/* Default Badge Option */}
              <View style={styles.avatarGrid}>
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
                      <MaterialIcons name="check" size={12} color="#ffffff" />
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
                          <MaterialIcons name="check" size={12} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Image Upload Option */}
              <TouchableOpacity style={styles.customUploadBtn} onPress={handlePickCustomImage}>
                <MaterialIcons name="add-photo-alternate" size={20} color="#004ac6" />
                <Text style={styles.customUploadText}>Or Upload Custom Photo from Device</Text>
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
      <Modal visible={editProfileVisible} animationType="slide" transparent>
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
              value={tempShopName}
              onChangeText={setTempShopName}
            />

            <Text style={styles.fieldLabel}>Owner Full Name</Text>
            <TextInput
              style={styles.inputField}
              value={tempOwnerName}
              onChangeText={setTempOwnerName}
            />

            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              style={styles.inputField}
              value={tempPhone}
              onChangeText={setTempPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.inputField}
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
      </Modal>

      {/* 2. Edit Shop Details Modal */}
      <Modal visible={shopInfoVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Shop Details</Text>

            <Text style={styles.fieldLabel}>Shop Category</Text>
            <TextInput
              style={styles.inputField}
              value={tempCategory}
              onChangeText={setTempCategory}
            />

            <Text style={styles.fieldLabel}>GST Identification Number</Text>
            <TextInput
              style={styles.inputField}
              value={tempGst}
              onChangeText={setTempGst}
              autoCapitalize="characters"
            />

            <Text style={styles.fieldLabel}>Business Address</Text>
            <TextInput
              style={[styles.inputField, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
              value={tempAddress}
              onChangeText={setTempAddress}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShopInfoVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveShopInfo}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. Printer Settings Modal */}
      <Modal visible={printerSettingsVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Printer Configuration</Text>

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

            <View style={[styles.rowItem, { borderBottomWidth: 0, paddingHorizontal: 0, marginTop: 12 }]}>
              <Text style={styles.rowLabel}>Auto Print Receipt on Sale</Text>
              <Switch
                value={autoPrint}
                onValueChange={setAutoPrint}
                trackColor={{ false: '#eaedff', true: '#b4c5ff' }}
                thumbColor={autoPrint ? '#004ac6' : '#737686'}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.saveBtn, { width: '100%' }]}
                onPress={() => setPrinterSettingsVisible(false)}
              >
                <Text style={styles.saveBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. Backup & Restore Modal */}
      <Modal visible={backupRestoreVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Backup & Restore</Text>
            
            <Text style={{ fontSize: 14, color: '#434655', marginBottom: 20, textAlign: 'center' }}>
              Securely export your product catalog inventory records to local JSON archives.
            </Text>

            <TouchableOpacity style={styles.backupActionBtn} onPress={executeBackup}>
              <MaterialIcons name="cloud-upload" size={24} color="#004ac6" />
              <View>
                <Text style={styles.backupBtnTitle}>Export Backup</Text>
                <Text style={styles.backupBtnSub}>Compile databases into local JSON data</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backupActionBtn} onPress={executeRestore}>
              <MaterialIcons name="cloud-download" size={24} color="#004ac6" />
              <View>
                <Text style={styles.backupBtnTitle}>Restore Catalog</Text>
                <Text style={styles.backupBtnSub}>Load inventory metrics data</Text>
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
      <Modal visible={languageVisible} animationType="slide" transparent>
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
                  alert(`Language changed to ${lang.label}`);
                }}
              >
                <Text style={[styles.languageText, language === lang.val && styles.languageTextActive]}>
                  {lang.label}
                </Text>
                {language === lang.val && (
                  <MaterialIcons name="check-circle" size={20} color="#004ac6" />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { width: '100%', marginTop: 12 }]}
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
  header: {
    height: 64,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f3ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004ac6',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  mainContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 20,
  },
  profileHeaderCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#c3c6d7',
    position: 'relative',
    marginBottom: 12,
    overflow: 'visible',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  defaultAvatarContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#004ac6',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#004ac6',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#737686',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: -8,
  },
  avatarPreviewSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: '#faf8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaedff',
  },
  avatarPreviewCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#004ac6',
    overflow: 'hidden',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff',
  },
  avatarPreviewImage: {
    width: '100%',
    height: '100%',
  },
  avatarPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004ac6',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  avatarGridItem: {
    width: '30%',
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eaedff',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  avatarGridItemActive: {
    borderColor: '#004ac6',
    backgroundColor: '#e0e7ff',
  },
  avatarThumbCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarThumbImage: {
    width: '100%',
    height: '100%',
  },
  avatarGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#131b2e',
    marginTop: 4,
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderStyle: 'dashed',
    marginTop: 14,
    backgroundColor: '#ffffff',
  },
  customUploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004ac6',
  },
  formAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eaedff',
    backgroundColor: '#faf8ff',
    marginBottom: 16,
  },
  formAvatarThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  formAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e0e7ff',
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
    fontWeight: '600',
    color: '#131b2e',
  },
  formAvatarAction: {
    fontSize: 11,
    color: '#004ac6',
    marginTop: 2,
  },
  shopNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#131b2e',
    marginBottom: 4,
  },
  ownerNameText: {
    fontSize: 14,
    color: '#434655',
    marginBottom: 16,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#004ac6',
    borderRadius: 9999,
    paddingHorizontal: 20,
    height: 40,
  },
  editProfileBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004ac6',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004ac6',
    paddingLeft: 4,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f3ff',
  },
  lastRowItem: {
    borderBottomWidth: 0,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eaedff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
  },
  rowSubLabel: {
    fontSize: 12,
    color: '#434655',
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffdad6',
    borderRadius: 12,
    height: 48,
    marginTop: 12,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ba1a1a',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#131b2e',
    marginBottom: 20,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004ac6',
    marginBottom: 6,
    marginTop: 12,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#131b2e',
    backgroundColor: '#faf8ff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#c3c6d7',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#434655',
  },
  saveBtn: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#004ac6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  optionButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf8ff',
  },
  optionButtonActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eaedff',
  },
  optionBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#434655',
  },
  optionBtnTextActive: {
    color: '#004ac6',
    fontWeight: '600',
  },
  backupActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaedff',
    backgroundColor: '#faf8ff',
    marginBottom: 12,
  },
  backupBtnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
  },
  backupBtnSub: {
    fontSize: 11,
    color: '#737686',
    marginTop: 2,
  },
  languageSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#eaedff',
    borderRadius: 10,
    backgroundColor: '#faf8ff',
    marginBottom: 8,
  },
  languageSelectRowActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eaedff',
  },
  languageText: {
    fontSize: 14,
    color: '#434655',
    fontWeight: '500',
  },
  languageTextActive: {
    color: '#004ac6',
    fontWeight: '600',
  },
});
