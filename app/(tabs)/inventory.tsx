import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';

interface InventoryItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  image?: string;
  category: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Ceramic Mug - White',
    price: 12.50,
    stock: 85,
    sku: 'CM-WHT-01',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9KiJJFLdtXIuktYytEkYM3xXV8x2lvL44II5sQy3tP1d7xeO7EYxJG4AP191SscYy-TKSdEA-12EtjnlyZ80Wh6P9Rtfzy8ZbtdUlPDN4QOMDMZwAlMH4mp3lTnRX-8TTtH8-R50JyHWauiet6yd_Cvt6n8_L_g4dB2NDNRlmB3yYnaUEmhdEqfw60hl1UNp0zOXZpAeq4kVmq0MGay9Nemmc6pDbniASsR3kIWSniYEDPvS3tA3cZw',
    category: 'Apparel',
  },
  {
    id: '2',
    name: 'Artisan Coffee Blend',
    price: 18.00,
    stock: 4,
    sku: 'CF-ART-BLND',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeFTsU2bPSfNr6kHlm3oI4xsZz2z3s_qnkK96FQu5gv3J9T1DRLB7IaysglaGkyly7OS9PnlZd1uJhpAXqu9RU4KdcHJFOUsnSCcJLbDDYoDD1fa9Tl-1zNIilSdsmwc7joMSTkcc7HlcQSFoVr1rWmHuWgjf-WZ0d5owgVMakvVKeFJfbEVFs9hpDIHuag7jHGoltHNCEU9FDZHjCRxhI-nUZiZHi2uOc0sSupUfx_UEhiCXOBNAY0w',
    category: 'Beverages',
  },
  {
    id: '3',
    name: 'Glass Water Bottle',
    price: 22.00,
    stock: 0,
    sku: 'WB-GLS-00',
    category: 'Beverages',
  },
  {
    id: '4',
    name: 'Canvas Tote Bag',
    price: 15.00,
    stock: 42,
    sku: 'TB-CNV-BG',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDix1ip4h-mc4UKx82IVkbhW3pmICYCYPF6WA0lmULzTaxq_3AyF96AkSxfqk6rOpHKv5AkuDD3SnFYHLzQIE8kmyFf8Fwv2SgxGDBLE8tWYsIsRziazJJ42D0d-XGm9juAYZHbs2M7kRhzVtlku_PQpFN4SsxH_xrhrszcv6JuTtPmDMoLdhy5PbaQ6D65X9xh3Jm9uT5wM5LfT4cfF4a3zdwOU-WrgXG8x4DwGqnxWpOsVYJme6sOKw',
    category: 'Apparel',
  },
  {
    id: '5',
    name: 'Wireless Charging Pad',
    price: 29.99,
    stock: 2,
    sku: 'WCP-15W-01',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbzsFnwR1dDaMlIjVr8PZrvOepuQ2tEP2tupZm9_9-UVDyG0efyl15hGAIHx9ODQ3lkjoaxMlSuGgv-XlE7AAiB0KtKwyuctg31J1cj_Xespl40g-l2KZza7KdtR8JmL6C0pvAUVaOxn8hXxa_mSk7ltlEqSc-uE17SHD25SfqZLZk5uRrBFPPbx8zf4MWbViV851HZKm65wgExHo1jgkDsVv8_x1cH7_8CcitPc_7CmElu5y-3TrkWA',
    category: 'Electronics',
  },
  {
    id: '6',
    name: 'Dark Chocolate Bar 70%',
    price: 4.25,
    stock: 15,
    sku: 'DC-70PCT-01',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMMQ_JALQOualfMi9HvbD-FVV4U27MIbDwduaRidsD67fUt5t4Jsfj1HDZmZ46U9upmAPxyQLJ7VSBh2GJ1SZpO8gcEL9BLJD1UZao4bLnuc9xvWb1TDUhDxTRgYBzDa8iMbXvWqZYEHvO9KR9WUlvTnAncrUEqNwv11EJ_HbcG6SeTDO-A5VVIo-e5QzH2WviZPbcKWPxUHsSFidwF_jsCWUG26KDwaJbMUVWqyMuAkKVAzCXJFTjBQ',
    category: 'Snacks',
  },
];

const FILTERS = ['All Stock', 'Low Stock', 'Out of Stock'];
const CATEGORIES = ['Beverages', 'Snacks', 'Electronics', 'Apparel', 'Other'];

export default function InventoryScreen() {
  // State
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [selectedFilter, setSelectedFilter] = useState('All Stock');
  const [addModalVisible, setAddModalVisible] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formError, setFormError] = useState('');

  // Calculations
  const metrics = useMemo(() => {
    const totalValue = inventory.reduce((acc, item) => acc + item.price * item.stock, 0);
    const totalCount = inventory.reduce((acc, item) => acc + item.stock, 0);
    return {
      totalValue,
      totalCount,
    };
  }, [inventory]);

  // Filtered list
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      if (selectedFilter === 'Low Stock') {
        return item.stock > 0 && item.stock <= 5;
      }
      if (selectedFilter === 'Out of Stock') {
        return item.stock === 0;
      }
      return true; // All Stock
    });
  }, [inventory, selectedFilter]);

  // Actions
  const handleRestock = (itemId: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, stock: item.stock + 20 } : item
      )
    );
  };

  const handleReorder = (itemId: string) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, stock: item.stock + 50 } : item
      )
    );
  };

  const handleAddProduct = () => {
    setFormError('');
    if (!formName.trim() || !formSku.trim() || !formPrice.trim() || !formStock.trim()) {
      setFormError('Please fill in all fields.');
      return;
    }

    const skuExists = inventory.some(
      (item) => item.sku.toLowerCase() === formSku.trim().toLowerCase()
    );
    if (skuExists) {
      setFormError('Product SKU already exists.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than $0.');
      return;
    }

    const stockNum = parseInt(formStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Please enter a valid non-negative stock quantity.');
      return;
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formName.trim(),
      sku: formSku.trim().toUpperCase(),
      price: priceNum,
      stock: stockNum,
      category: formCategory,
    };

    setInventory((prev) => [newItem, ...prev]);

    // Reset Form & Close
    setFormName('');
    setFormSku('');
    setFormPrice('');
    setFormStock('');
    setFormCategory(CATEGORIES[0]);
    setAddModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="menu" size={24} color="#434655" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartPOS</Text>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="notifications" size={24} color="#434655" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredInventory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        ListHeaderComponent={
          <View>
            <Text style={styles.pageTitle}>Inventory</Text>

            {/* Metrics Bento Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Stock Value</Text>
                <Text style={styles.metricValuePrimary}>
                  ${metrics.totalValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total Items</Text>
                <Text style={styles.metricValue}>
                  {metrics.totalCount.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Tabs Row */}
            <View style={styles.tabsRow}>
              {FILTERS.map((filter) => {
                const active = selectedFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.tabChip, active && styles.tabChipActive]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isOutOfStock = item.stock === 0;
          const isLowStock = item.stock > 0 && item.stock <= 5;

          return (
            <View
              style={[
                styles.itemCard,
                isOutOfStock && styles.itemCardOutOfStock,
                isLowStock && styles.itemCardLowStock,
              ]}
            >
              <View style={styles.cardHeaderRow}>
                {/* Thumbnail */}
                <View style={styles.thumbnailWrapper}>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.thumbnail}
                      contentFit="cover"
                    />
                  ) : (
                    <MaterialIcons name="inventory-2" size={24} color="#737686" />
                  )}
                </View>

                {/* Details */}
                <View style={styles.itemDetails}>
                  <Text
                    style={[styles.itemName, isOutOfStock && styles.textSecondary]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.itemSku}>SKU: {item.sku}</Text>
                  <View style={styles.itemMetaRow}>
                    <Text style={[styles.itemPrice, isOutOfStock && styles.textSecondary]}>
                      ${item.price.toFixed(2)}
                    </Text>

                    {/* Stock status badge */}
                    {isOutOfStock ? (
                      <View style={[styles.badge, styles.badgeError]}>
                        <MaterialIcons name="error" size={12} color="#ba1a1a" />
                        <Text style={styles.badgeTextError}>Out of stock</Text>
                      </View>
                    ) : isLowStock ? (
                      <View style={[styles.badge, styles.badgeWarning]}>
                        <MaterialIcons name="warning" size={12} color="#854d0e" />
                        <Text style={styles.badgeTextWarning}>{item.stock} in stock</Text>
                      </View>
                    ) : (
                      <View style={[styles.badge, styles.badgeSuccess]}>
                        <MaterialIcons name="check-circle" size={12} color="#166534" />
                        <Text style={styles.badgeTextSuccess}>{item.stock} in stock</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Dynamic Restock / Reorder button */}
              {isLowStock && (
                <TouchableOpacity
                  style={styles.actionBtnPrimary}
                  onPress={() => handleRestock(item.id)}
                >
                  <MaterialIcons name="add-shopping-cart" size={16} color="#ffffff" />
                  <Text style={styles.actionBtnPrimaryText}>Restock</Text>
                </TouchableOpacity>
              )}

              {isOutOfStock && (
                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() => handleReorder(item.id)}
                >
                  <MaterialIcons name="sync" size={16} color="#004ac6" />
                  <Text style={styles.actionBtnOutlineText}>Reorder</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color="#c3c6d7" />
            <Text style={styles.emptyText}>No items found in this category.</Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setFormError('');
          setAddModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Product Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Product</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#434655" />
              </TouchableOpacity>
            </View>

            {formError ? (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={16} color="#ba1a1a" />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Premium Coffee Bag"
                  placeholderTextColor="#737686"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SKU Code</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. CF-PREM-BG"
                  placeholderTextColor="#737686"
                  autoCapitalize="characters"
                  value={formSku}
                  onChangeText={setFormSku}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Unit Price ($)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 15.99"
                    placeholderTextColor="#737686"
                    keyboardType="numeric"
                    value={formPrice}
                    onChangeText={setFormPrice}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Initial Stock</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 50"
                    placeholderTextColor="#737686"
                    keyboardType="numeric"
                    value={formStock}
                    onChangeText={setFormStock}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryDropdown}>
                  {CATEGORIES.map((cat) => {
                    const selected = formCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catSelectBtn,
                          selected && styles.catSelectBtnActive,
                        ]}
                        onPress={() => setFormCategory(cat)}
                      >
                        <Text
                          style={[
                            styles.catSelectText,
                            selected && styles.catSelectTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct}>
              <Text style={styles.submitBtnText}>Add Product</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#004ac6',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#131b2e',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f2f3ff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: '#434655',
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#131b2e',
  },
  metricValuePrimary: {
    fontSize: 26,
    fontWeight: '700',
    color: '#004ac6',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: '#eaedff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
  },
  tabChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#004ac6',
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#434655',
  },
  tabChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  itemCardOutOfStock: {
    borderColor: '#ba1a1a',
    opacity: 0.85,
  },
  itemCardLowStock: {
    borderColor: '#fef08a',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailWrapper: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f2f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#131b2e',
  },
  itemSku: {
    fontSize: 12,
    color: '#737686',
    marginTop: 2,
  },
  itemMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#131b2e',
  },
  textSecondary: {
    color: '#737686',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    gap: 4,
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  badgeWarning: {
    backgroundColor: '#fef08a',
  },
  badgeError: {
    backgroundColor: '#ffdad6',
  },
  badgeTextSuccess: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  badgeTextWarning: {
    fontSize: 11,
    color: '#854d0e',
    fontWeight: '600',
  },
  badgeTextError: {
    fontSize: 11,
    color: '#ba1a1a',
    fontWeight: '600',
  },
  actionBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    height: 40,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  actionBtnPrimaryText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#004ac6',
    height: 40,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
    backgroundColor: 'transparent',
  },
  actionBtnOutlineText: {
    color: '#004ac6',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    color: '#737686',
    marginTop: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 380,
    maxHeight: '90%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131b2e',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#ba1a1a',
    fontWeight: '500',
  },
  modalForm: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#131b2e',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  categoryDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  catSelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c3c6d7',
    backgroundColor: '#ffffff',
  },
  catSelectBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eaedff',
  },
  catSelectText: {
    fontSize: 12,
    color: '#434655',
  },
  catSelectTextActive: {
    color: '#004ac6',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
