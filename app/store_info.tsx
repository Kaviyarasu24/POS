import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
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

export default function StoreInfoScreen() {
  const router = useRouter();
  const userSession = store.currentUser;

  // Form State
  const [shopName, setShopName] = useState(userSession?.shopName || '');
  const [userName, setUserName] = useState(userSession?.userName || '');
  const [phone, setPhone] = useState(userSession?.phone || '');
  const [email, setEmail] = useState(userSession?.email || '');
  const [shopCategory, setShopCategory] = useState(userSession?.shopCategory || 'Retail / Apparel');
  const [gstNumber, setGstNumber] = useState(userSession?.gstNumber || '');
  const [businessAddress, setBusinessAddress] = useState(userSession?.businessAddress || '');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(userSession?.image || null);
  const [storeId] = useState(userSession?.storeId || '');

  // UI state
  const [saving, setSaving] = useState(false);
  const [avatarPickerExpanded, setAvatarPickerExpanded] = useState(false);
  const [copiedStoreId, setCopiedStoreId] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (userSession) {
      setShopName(userSession.shopName || '');
      setUserName(userSession.userName || '');
      setPhone(userSession.phone || '');
      setEmail(userSession.email || '');
      setShopCategory(userSession.shopCategory || 'Retail / Apparel');
      setGstNumber(userSession.gstNumber || '');
      setBusinessAddress(userSession.businessAddress || '');
      setSelectedAvatar(userSession.image || null);
    }
  }, [userSession]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCopyStoreId = () => {
    if (!storeId) return;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(storeId);
    }
    setCopiedStoreId(true);
    showToast('Store ID copied to clipboard');
    setTimeout(() => setCopiedStoreId(false), 2500);
  };

  const handlePickCustomImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Permission to access photo gallery is required.');
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
    } catch (err) {
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

  const handleSave = async () => {
    if (!shopName.trim()) {
      Alert.alert('Validation Error', 'Shop Name cannot be empty.');
      return;
    }
    if (!userName.trim()) {
      Alert.alert('Validation Error', 'Owner / Merchant name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await store.updateUserProfile({
        shopName: shopName.trim(),
        userName: userName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        shopCategory: shopCategory.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        businessAddress: businessAddress.trim(),
        image: selectedAvatar || '',
      });

      showToast('Store details saved successfully!');
      setTimeout(() => {
        router.back();
      }, 500);
    } catch (error: any) {
      Alert.alert('Save Failed', error.message || 'Could not update store details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Toast Notification */}
      {toastMsg && (
        <View style={styles.floatingToast}>
          <MaterialIcons name="check-circle" size={18} color="#22c55e" />
          <Text style={styles.floatingToastText}>{toastMsg}</Text>
        </View>
      )}

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop Information</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={[styles.headerSaveBtn, saving && { opacity: 0.6 }]}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#004ac6" />
          ) : (
            <Text style={styles.headerSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar & Branding Header */}
          <View style={styles.avatarCard}>
            <View style={styles.avatarRow}>
              <TouchableOpacity
                style={styles.avatarWrapper}
                onPress={() => setAvatarPickerExpanded(!avatarPickerExpanded)}
                activeOpacity={0.85}
              >
                {selectedAvatar ? (
                  <Image style={styles.avatarImg} source={selectedAvatar} contentFit="cover" />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>
                      {userName ? userName.trim().substring(0, 2).toUpperCase() : 'SP'}
                    </Text>
                  </View>
                )}
                <View style={styles.avatarCameraBadge}>
                  <MaterialIcons name="photo-camera" size={13} color="#ffffff" />
                </View>
              </TouchableOpacity>

              <View style={styles.avatarMetaCol}>
                <Text style={styles.avatarShopTitle} numberOfLines={1}>
                  {shopName || 'Your Store Name'}
                </Text>
                <Text style={styles.avatarOwnerSub}>
                  {userName || 'Owner'} • {getShopCategoryLabel(shopCategory)}
                </Text>
                <TouchableOpacity
                  style={styles.changeAvatarChip}
                  onPress={() => setAvatarPickerExpanded(!avatarPickerExpanded)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={avatarPickerExpanded ? 'keyboard-arrow-up' : 'palette'}
                    size={15}
                    color="#004ac6"
                  />
                  <Text style={styles.changeAvatarChipText}>
                    {avatarPickerExpanded ? 'Close Avatar Picker' : 'Change Avatar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expandable Avatar Selection Grid */}
            {avatarPickerExpanded && (
              <View style={styles.avatarSelectionContainer}>
                <View style={styles.divider} />
                <Text style={styles.presetHeading}>Choose Preset Avatar or Upload Photo</Text>
                <View style={styles.presetGrid}>
                  {/* Default Initials Option */}
                  <TouchableOpacity
                    style={[
                      styles.presetItem,
                      selectedAvatar === null && styles.presetItemActive,
                    ]}
                    onPress={() => setSelectedAvatar(null)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.presetThumbCircle, { backgroundColor: '#e0e7ff' }]}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#004ac6' }}>
                        {userName ? userName.trim().substring(0, 2).toUpperCase() : 'SP'}
                      </Text>
                    </View>
                    <Text style={styles.presetLabel} numberOfLines={1}>Initials</Text>
                    {selectedAvatar === null && (
                      <View style={styles.presetCheckBadge}>
                        <MaterialIcons name="check" size={10} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Curated Presets */}
                  {PRESET_AVATARS.map((av) => {
                    const isSelected = selectedAvatar === av.url;
                    return (
                      <TouchableOpacity
                        key={av.id}
                        style={[
                          styles.presetItem,
                          isSelected && styles.presetItemActive,
                        ]}
                        onPress={() => setSelectedAvatar(av.url)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.presetThumbCircle}>
                          <Image style={styles.presetThumbImg} source={av.url} contentFit="cover" />
                        </View>
                        <Text style={styles.presetLabel} numberOfLines={1}>{av.name.split(' ')[0]}</Text>
                        {isSelected && (
                          <View style={styles.presetCheckBadge}>
                            <MaterialIcons name="check" size={10} color="#ffffff" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Photo Button */}
                <TouchableOpacity
                  style={styles.customUploadBtn}
                  onPress={handlePickCustomImage}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="add-photo-alternate" size={18} color="#004ac6" />
                  <Text style={styles.customUploadText}>Upload Custom Image from Device</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Section: Basic Store Information */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.card}>
            {/* Shop Name */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <MaterialIcons name="storefront" size={16} color="#004ac6" />
                <Text style={styles.fieldLabel}>Shop / Store Name *</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Metro Supermarket"
                placeholderTextColor="#94a3b8"
                value={shopName}
                onChangeText={setShopName}
              />
            </View>

            {/* Owner Full Name */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <MaterialIcons name="person" size={16} color="#004ac6" />
                <Text style={styles.fieldLabel}>Owner / Merchant Full Name *</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. John Doe"
                placeholderTextColor="#94a3b8"
                value={userName}
                onChangeText={setUserName}
              />
            </View>

            {/* Store ID / Join Code (Read-Only) */}
            <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
              <View style={styles.fieldLabelRow}>
                <MaterialIcons name="vpn-key" size={16} color="#004ac6" />
                <Text style={styles.fieldLabel}>Store ID (Staff Join Code)</Text>
              </View>
              <View style={styles.storeIdRow}>
                <Text style={styles.storeIdText}>{storeId || '—'}</Text>
                <TouchableOpacity
                  style={[styles.copyCodeBtn, copiedStoreId && styles.copyCodeBtnCopied]}
                  onPress={handleCopyStoreId}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={copiedStoreId ? 'check' : 'content-copy'}
                    size={14}
                    color={copiedStoreId ? '#15803d' : '#004ac6'}
                  />
                  <Text style={[styles.copyCodeBtnText, copiedStoreId && { color: '#15803d' }]}>
                    {copiedStoreId ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.fieldHint}>
                Cashiers and store staff use this ID during signup to join this store.
              </Text>
            </View>
          </View>

          {/* Section: Business Category */}
          <Text style={styles.sectionTitle}>Business Category</Text>
          <View style={styles.card}>
            <Text style={styles.categoryNote}>
              Select the primary category that describes your retail or business operations:
            </Text>
            <View style={styles.categoryGrid}>
              {SHOP_CATEGORIES.map((cat) => {
                const isSelected =
                  shopCategory.toLowerCase() === cat.label.toLowerCase() ||
                  shopCategory.toLowerCase() === cat.value.toLowerCase() ||
                  shopCategory.toLowerCase() === cat.code.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cat.code}
                    style={[
                      styles.categoryTile,
                      isSelected && styles.categoryTileActive,
                    ]}
                    onPress={() => setShopCategory(cat.label)}
                    activeOpacity={0.75}
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
                        color={isSelected ? '#ffffff' : '#004ac6'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryTileText,
                        isSelected && styles.categoryTileTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {cat.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.categoryCheckBadge}>
                        <MaterialIcons name="check" size={11} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section: Contact Details */}
          <Text style={styles.sectionTitle}>Contact & Tax Details</Text>
          <View style={styles.card}>
            {/* Phone */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <MaterialIcons name="phone" size={16} color="#004ac6" />
                <Text style={styles.fieldLabel}>Registered Phone Number</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. +91 9876543210"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <MaterialIcons name="email" size={16} color="#004ac6" />
                <Text style={styles.fieldLabel}>Contact Email Address</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. contact@mystore.com"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* GST Number */}
            <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
              <View style={styles.fieldLabelRow}>
                <MaterialIcons name="receipt-long" size={16} color="#004ac6" />
                <Text style={styles.fieldLabel}>GSTIN / Tax ID Number</Text>
              </View>
              <TextInput
                style={[styles.textInput, { textTransform: 'uppercase' }]}
                placeholder="e.g. 29ABCDE1234F1Z5"
                placeholderTextColor="#94a3b8"
                value={gstNumber}
                onChangeText={setGstNumber}
                autoCapitalize="characters"
              />
              <Text style={styles.fieldHint}>
                GSTIN will be printed at the top of POS thermal receipts and invoice exports.
              </Text>
            </View>
          </View>

          {/* Section: Store Location & Address */}
          <Text style={styles.sectionTitle}>Physical Store Address</Text>
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <MaterialIcons name="location-on" size={16} color="#004ac6" />
                <Text style={styles.fieldLabel}>Business Location & Full Address</Text>
              </View>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="e.g. No. 42, Market Road, Sector 4, Bangalore, Karnataka - 560001"
                placeholderTextColor="#94a3b8"
                value={businessAddress}
                onChangeText={setBusinessAddress}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <Text style={styles.fieldHint}>
                This address appears on receipt headers, WhatsApp share notes, and billing records.
              </Text>
            </View>
          </View>

          {/* Save Action Button */}
          <TouchableOpacity
            style={[styles.mainSaveBtn, saving && { opacity: 0.75 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#ffffff" />
                <Text style={styles.mainSaveBtnText}>Save Store Details</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    minWidth: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004ac6',
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  floatingToast: {
    position: 'absolute',
    top: 64,
    left: 20,
    right: 20,
    zIndex: 999,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    gap: 10,
  },
  floatingToastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  // Avatar Card
  avatarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#004ac6',
  },
  avatarPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#004ac6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#004ac6',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#004ac6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarMetaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  avatarShopTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  avatarOwnerSub: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  changeAvatarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  changeAvatarChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004ac6',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  avatarSelectionContainer: {
    marginTop: 6,
  },
  presetHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  presetItem: {
    width: 60,
    alignItems: 'center',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  presetItemActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eff6ff',
  },
  presetThumbCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  presetThumbImg: {
    width: '100%',
    height: '100%',
  },
  presetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  presetCheckBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#004ac6',
    borderRadius: 7,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  customUploadText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d',
  },
  // Section Headers
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
    marginLeft: 4,
  },
  // Card Container
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  textArea: {
    minHeight: 74,
    paddingTop: 10,
  },
  fieldHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    marginLeft: 2,
  },
  storeIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  storeIdText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#004ac6',
    letterSpacing: 0.5,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  copyCodeBtnCopied: {
    backgroundColor: '#dcfce7',
  },
  copyCodeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004ac6',
  },
  // Category Grid
  categoryNote: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTile: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    gap: 8,
    position: 'relative',
  },
  categoryTileActive: {
    borderColor: '#004ac6',
    backgroundColor: '#eff6ff',
  },
  categoryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconCircleActive: {
    backgroundColor: '#004ac6',
  },
  categoryTileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  categoryTileTextActive: {
    color: '#004ac6',
    fontWeight: '700',
  },
  categoryCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#004ac6',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Main Save Button
  mainSaveBtn: {
    backgroundColor: '#004ac6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
    marginBottom: 20,
  },
  mainSaveBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
