import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { store } from '@/constants/store';
import { PRODUCT_CATEGORIES } from '@/constants/config';

const CATEGORIES = PRODUCT_CATEGORIES;

const UNIT_OPTIONS = [
  { label: 'Piece (pcs)', value: 'pcs', type: 'count', icon: 'check-box-outline-blank' },
  { label: 'Kilogram (kg)', value: 'kg', type: 'weight', icon: 'scale' },
  { label: 'Gram (g)', value: 'g', type: 'weight', icon: 'scale' },
  { label: 'Packet (pkt)', value: 'pack', type: 'count', icon: 'inventory' },
  { label: 'Box (box)', value: 'box', type: 'count', icon: 'all-inbox' },
  { label: 'Litre (L)', value: 'l', type: 'volume', icon: 'water-drop' },
  { label: 'MilliLitre (ml)', value: 'ml', type: 'volume', icon: 'opacity' },
];

interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  iconLeft?: string;
  iconRight?: string;
  onIconRightPress?: () => void;
  editable?: boolean;
}

function FloatingInput({
  label,
  value,
  onChangeText,
  keyboardType = 'default',
  iconLeft,
  iconRight,
  onIconRightPress,
  editable = true,
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = React.useRef<TextInput>(null);
  const showLabelOnTop = isFocused || (value !== undefined && value !== null && value.length > 0);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
      style={[
        styles.inputContainer,
        isFocused && { borderColor: '#004ac6', backgroundColor: '#ffffff' },
      ]}
    >
      {iconLeft && (
        <Text pointerEvents="none" style={styles.iconLeftText}>{iconLeft}</Text>
      )}
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          iconLeft && { paddingLeft: 32 },
          iconRight && { paddingRight: 40 },
          !editable && { color: '#737686' },
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=""
        editable={editable}
      />
      <Text
        pointerEvents="none"
        style={[
          styles.inputLabel,
          showLabelOnTop ? styles.inputLabelTop : styles.inputLabelCenter,
          iconLeft && !showLabelOnTop && { left: 32 },
          isFocused && { color: '#004ac6', fontWeight: '700' },
        ]}
      >
        {label}
      </Text>
      {iconRight && (
        <TouchableOpacity
          style={styles.iconRightButton}
          onPress={onIconRightPress}
          disabled={!onIconRightPress}
        >
          <MaterialIcons name={iconRight as any} size={20} color="#434655" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function AddProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const insets = useSafeAreaInsets();

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [taxRate, setTaxRate] = useState('8');
  const [initialStock, setInitialStock] = useState('');
  const [lowStock, setLowStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  // Dropdown state for category selection
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Determine whether current unit is weight/decimal-based
  const isWeightOrVolume = ['kg', 'g', 'l', 'ml'].includes(unit);

  // Load existing product if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const product = store.getProductById(id);
      if (product) {
        setName(product.name);
        setSku(product.sku);
        setCategory(product.category);
        setUnit(product.unit || 'pcs');
        setCostPrice(product.costPrice.toString());
        setSellingPrice(product.price.toString());
        setTaxRate(product.taxRate.toString());
        setInitialStock(product.stock.toString());
        setLowStock(product.lowStockAlert.toString());
        setImageUrl(product.image || '');
      }
    }
  }, [isEdit, id]);

  const handleSaveProduct = () => {
    setError('');

    if (!name.trim() || !sku.trim() || !category || !sellingPrice.trim() || !initialStock.trim()) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    const priceNum = parseFloat(sellingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid selling price greater than ₹0.');
      return;
    }

    const costNum = costPrice.trim() ? parseFloat(costPrice) : 0;
    if (isNaN(costNum) || costNum < 0) {
      setError('Cost price must be a valid non-negative number.');
      return;
    }

    const stockNum = parseFloat(initialStock);
    if (isNaN(stockNum) || stockNum < 0) {
      setError(`Stock level must be a valid non-negative ${isWeightOrVolume ? 'number' : 'integer'}.`);
      return;
    }

    const lowStockAlertNum = lowStock.trim() ? parseFloat(lowStock) : (isWeightOrVolume ? 2.0 : 5);
    if (isNaN(lowStockAlertNum) || lowStockAlertNum < 0) {
      setError('Low stock alert must be a valid non-negative number.');
      return;
    }

    const taxRateNum = taxRate.trim() ? parseFloat(taxRate) : 8;
    if (isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 100) {
      setError('Please enter a valid tax rate percentage (0-100).');
      return;
    }

    // Check SKU uniqueness if adding, or if editing and SKU has changed
    const currentProducts = store.getProducts();
    const skuExists = currentProducts.some(
      (item) => item.sku.toLowerCase() === sku.trim().toLowerCase() && item.id !== id
    );

    if (skuExists) {
      setError('Product SKU already exists in catalog.');
      return;
    }

    const finalImage = imageUrl.trim()
      ? imageUrl.trim()
      : `https://loremflickr.com/320/320/${encodeURIComponent(name.trim().toLowerCase())}`;

    if (isEdit && id) {
      store.updateProduct(id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        unit,
        costPrice: costNum,
        price: priceNum,
        taxRate: taxRateNum,
        stock: stockNum,
        lowStockAlert: lowStockAlertNum,
        image: finalImage,
      });
      alert('Product updated successfully.');
    } else {
      store.addProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category,
        unit,
        costPrice: costNum,
        price: priceNum,
        taxRate: taxRateNum,
        stock: stockNum,
        lowStockAlert: lowStockAlertNum,
        image: finalImage,
      });
      alert('Product added successfully.');
    }

    router.back();
  };

  const handleDeleteProduct = () => {
    if (!id) return;

    const performDelete = async () => {
      try {
        await store.deleteProduct(id);
        alert('Product deleted successfully.');
        router.back();
      } catch (err) {
        alert('Failed to delete product.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top']}>
      {/* Top Header App Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color="#004ac6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </Text>
        {isEdit ? (
          <TouchableOpacity style={styles.headerIconButton} onPress={handleDeleteProduct}>
            <MaterialIcons name="delete" size={24} color="#ba1a1a" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color="#ba1a1a" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Product Image Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Product Image</Text>
            <TouchableOpacity style={styles.imageUploadArea} onPress={() => alert('Camera roll features are under development.')}>
              <MaterialIcons name="add-photo-alternate" size={32} color="#737686" />
              <Text style={styles.uploadText}>Tap to upload image</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 12 }}>
              <FloatingInput
                label="Or paste image URL"
                value={imageUrl}
                onChangeText={setImageUrl}
              />
            </View>
          </View>

          {/* Basic Info Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Basic Info</Text>

            <FloatingInput
              label="Product Name *"
              value={name}
              onChangeText={setName}
            />

            <FloatingInput
              label="SKU / Barcode *"
              value={sku}
              onChangeText={setSku}
              iconRight="barcode-reader"
              onIconRightPress={() => router.push('/scanner')}
            />

            {/* Custom Category Dropdown Trigger */}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={styles.selectTrigger}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={[styles.selectText, !category && { color: '#737686' }]}>
                  {category || 'Select Category *'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#434655" />
              </TouchableOpacity>
              <Text style={[styles.inputLabel, styles.inputLabelTop, { color: '#004ac6' }]}>
                Category *
              </Text>
            </View>

            {/* Category Dropdown List */}
            {showCategoryDropdown && (
              <View style={styles.categoryDropdown}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.categoryOption}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text style={styles.categoryOptionText}>{cat}</Text>
                    {category === cat && (
                      <MaterialIcons name="check" size={18} color="#004ac6" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Pricing & Unit Measurement Section */}
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.sectionHeader}>Pricing & Unit Type</Text>
              <View style={styles.unitTypeBadge}>
                <MaterialIcons
                  name={isWeightOrVolume ? 'scale' : 'check-box-outline-blank'}
                  size={14}
                  color="#004ac6"
                />
                <Text style={styles.unitTypeBadgeText}>
                  {isWeightOrVolume ? 'Sold by Weight / Volume' : 'Sold by Piece'}
                </Text>
              </View>
            </View>

            {/* Measurement Unit Selector Chips */}
            <Text style={styles.subLabel}>Select Measurement Unit *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitChipsContainer}>
              {UNIT_OPTIONS.map((opt) => {
                const isSelected = unit === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.unitChip, isSelected && styles.unitChipSelected]}
                    onPress={() => setUnit(opt.value)}
                  >
                    <MaterialIcons
                      name={opt.icon as any}
                      size={16}
                      color={isSelected ? '#ffffff' : '#434655'}
                    />
                    <Text style={[styles.unitChipText, isSelected && styles.unitChipTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={[styles.rowInputs, { marginTop: 16 }]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <FloatingInput
                  label={`Cost Price (per ${unit})`}
                  value={costPrice}
                  onChangeText={setCostPrice}
                  keyboardType="decimal-pad"
                  iconLeft="₹"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FloatingInput
                  label={`Selling Price (per ${unit}) *`}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="decimal-pad"
                  iconLeft="₹"
                />
              </View>
            </View>

            <FloatingInput
              label="GST / Tax Rate (%)"
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="decimal-pad"
              iconRight="percent"
            />
          </View>

          {/* Inventory Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Inventory</Text>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <FloatingInput
                  label={`Initial Stock (${unit}) *`}
                  value={initialStock}
                  onChangeText={setInitialStock}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FloatingInput
                  label={`Low Stock Alert (${unit})`}
                  value={lowStock}
                  onChangeText={setLowStock}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {isEdit && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#ba1a1a', flex: 1 }]}
              onPress={handleDeleteProduct}
            >
              <MaterialIcons name="delete" size={20} color="#ffffff" />
              <Text style={styles.saveButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveButton, { flex: isEdit ? 2 : 1 }]}
            onPress={handleSaveProduct}
          >
            <MaterialIcons name="save" size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>
              {isEdit ? 'Save Changes' : 'Save Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.2)',
    backgroundColor: '#ffffff',
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 9999,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131b2e',
  },
  formScroll: {
    padding: 16,
    paddingBottom: 140,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ba1a1a',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c3c6d7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131b2e',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#434655',
    marginBottom: 8,
  },
  unitTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unitTypeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004ac6',
  },
  unitChipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  unitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  unitChipSelected: {
    backgroundColor: '#004ac6',
    borderColor: '#004ac6',
  },
  unitChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  unitChipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  imageUploadArea: {
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#c3c6d7',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf8ff',
  },
  uploadText: {
    fontSize: 13,
    color: '#737686',
    marginTop: 6,
    fontWeight: '500',
  },
  inputContainer: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3c6d7',
    marginBottom: 16,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#faf8ff',
  },
  input: {
    height: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 16,
    color: '#131b2e',
  },
  inputLabel: {
    position: 'absolute',
    left: 16,
    color: '#737686',
    fontWeight: '500',
  },
  inputLabelCenter: {
    top: 18,
    fontSize: 16,
  },
  inputLabelTop: {
    top: 6,
    fontSize: 11,
  },
  iconLeftText: {
    position: 'absolute',
    left: 14,
    top: 22,
    fontSize: 16,
    color: '#434655',
    fontWeight: '600',
  },
  iconRightButton: {
    position: 'absolute',
    right: 14,
    top: 16,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    height: '100%',
  },
  selectText: {
    fontSize: 16,
    color: '#131b2e',
  },
  categoryDropdown: {
    marginTop: -8,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3c6d7',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  categoryOptionText: {
    fontSize: 15,
    color: '#131b2e',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(195,198,215,0.2)',
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#004ac6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
