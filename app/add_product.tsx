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
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { store } from '@/constants/store';

const CATEGORIES = ['Grocery', 'Snacks', 'Beverages', 'Dairy', 'Other'];

interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
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
  const showLabelOnTop = isFocused || value.length > 0;

  return (
    <View style={styles.inputContainer}>
      {iconLeft && (
        <Text style={styles.iconLeftText}>{iconLeft}</Text>
      )}
      <TextInput
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
        style={[
          styles.inputLabel,
          showLabelOnTop ? styles.inputLabelTop : styles.inputLabelCenter,
          iconLeft && !showLabelOnTop && { left: 32 },
          isFocused && { color: '#004ac6' },
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
    </View>
  );
}

export default function AddProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [taxRate, setTaxRate] = useState('8');
  const [initialStock, setInitialStock] = useState('');
  const [lowStock, setLowStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  // Dropdown state for category selection
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Load existing product if in edit mode
  useEffect(() => {
    if (isEdit && id) {
      const product = store.getProductById(id);
      if (product) {
        setName(product.name);
        setSku(product.sku);
        setCategory(product.category);
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

    const stockNum = parseInt(initialStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setError('Stock level must be a valid non-negative integer.');
      return;
    }

    const lowStockAlertNum = lowStock.trim() ? parseInt(lowStock, 10) : 5;
    if (isNaN(lowStockAlertNum) || lowStockAlertNum < 0) {
      setError('Low stock alert must be a valid non-negative integer.');
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

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Header App Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color="#004ac6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Product' : 'Add Product'}
        </Text>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="more-vert" size={24} color="#434655" />
        </TouchableOpacity>
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

          {/* Pricing Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Pricing</Text>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <FloatingInput
                  label="Cost Price"
                  value={costPrice}
                  onChangeText={setCostPrice}
                  keyboardType="numeric"
                  iconLeft="₹"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FloatingInput
                  label="Selling Price *"
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="numeric"
                  iconLeft="₹"
                />
              </View>
            </View>

            <FloatingInput
              label="GST / Tax Rate (%)"
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="numeric"
              iconRight="percent"
            />
          </View>

          {/* Inventory Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeader}>Inventory</Text>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <FloatingInput
                  label="Initial Stock *"
                  value={initialStock}
                  onChangeText={setInitialStock}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <FloatingInput
                  label="Low Stock Alert"
                  value={lowStock}
                  onChangeText={setLowStock}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button Fixed Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
          <MaterialIcons name="save" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>Save Product</Text>
        </TouchableOpacity>
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
    paddingBottom: 96,
    gap: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ba1a1a',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 16,
  },
  imageUploadArea: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c3c6d7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf8ff',
  },
  uploadText: {
    fontSize: 13,
    color: '#737686',
    fontWeight: '500',
    marginTop: 8,
  },
  inputContainer: {
    position: 'relative',
    height: 56,
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  input: {
    fontSize: 15,
    color: '#131b2e',
    height: '100%',
    paddingTop: 12,
  },
  inputLabel: {
    position: 'absolute',
    left: 16,
    fontSize: 15,
    color: '#737686',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
  },
  inputLabelCenter: {
    top: 16,
  },
  inputLabelTop: {
    top: -10,
    fontSize: 11,
    fontWeight: '500',
  },
  iconLeftText: {
    position: 'absolute',
    left: 16,
    fontSize: 16,
    color: '#434655',
    top: 24, // aligns with text
  },
  iconRightButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  selectTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    paddingTop: 12,
  },
  selectText: {
    fontSize: 15,
    color: '#131b2e',
  },
  categoryDropdown: {
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 4,
    overflow: 'hidden',
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f3ff',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#131b2e',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(195,198,215,0.2)',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    height: 48,
    borderRadius: 24,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
