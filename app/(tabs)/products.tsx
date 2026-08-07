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
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
  category: string;
  unit?: string; // e.g. "lb", "ea"
  image?: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Organic Red Apples',
    price: 2.99,
    stock: 142,
    sku: 'APP-1001',
    category: 'Grocery',
    unit: 'lb',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7Yv43gGyBrKPnc0srxcs5O03zMXz-kw6ik4_yGC9vLV0HpZ-DtXrmoqJoZ-RVFG83qRIFt1v8J5pcGPem1sa0aBpIAkuBFtLldhxByyecMfmiFpVduKdE0EEGiDt8ujZaKP_8Y2Wrn24FG4W7_ybunWjQx6wxkOkfQ3w61Mn2jjVLLuCJosYlkzfue6upEIqLJHudITp58a71o2d_cNpwwWkAblqsDdAPwFtn_Q0hTDNYkoGOQuT9Vg',
  },
  {
    id: '2',
    name: 'Premium Dark Chocolate',
    price: 4.50,
    stock: 56,
    sku: 'CHC-8092',
    category: 'Snacks',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcjJoa_Zd04PJFBlQNgfFIaDRlfTxM2JpcwdEqdGmx0RVcEp4OZRx1nNZRDblw3DpbJSDbSde8QpAeDIVunwmBIeIkQB2RX5vCRUst99bnd7EvjX31OB0V8-IYXkHZ1pjrjBog3EcE4z0gS3quC8ZLdfE_dtWlzKj3qWzDqsFVN2nGtBHm3qOhlLgAABZZrWIEFa044t_7pSjp_qSyAfRJCIUO3Khq_Cvjegnz31bPqQp5b0Q_sFQOVA',
  },
  {
    id: '3',
    name: 'Sparkling Spring Water',
    price: 1.25,
    stock: 8,
    sku: 'BEV-2201',
    category: 'Beverages',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBznE2CZzBvkdpUgXw3R5l-fH_KSpOwInC0SmgXoOwDitZLjvqbHyOsezACGSROCb7jbnbJy5KViR7dcFf_3nloXK705mflV0iGb1_FpfWc4N3A6_2tQVl1E8UX9CKUojYAIZxOe1f5dOGhUIAPGJo0ggcgd7D7hhpFmHWaaeYhU0cMNuQCQPFmD7DBBI-ojIIuhFiuQw5Wl-xDA04_viCwIqCbCqfTgG4UHInY0n19mEL-ADWLbg9Cyw',
  },
  {
    id: '4',
    name: 'Artisan Sourdough Loaf',
    price: 5.00,
    stock: 0,
    sku: 'BAK-0045',
    category: 'Grocery',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-I0YlupUZeAa1MceqEGvWcr6StURpq5EZrBS63mYwhe-xKfcxpdTD2FSPt9u4-1StjeQRsFn5BQUdr_eMxsJI2t2V8a9ld6UGyMqTF0QPN-jhKZZginZnPfggx_ialJi7KZJWXlYZrIpCjuh2CLhE-miTP9AqxPs85dL7eghROJ3eDDuuMzpsF_ZukBAt3nCnHVTpLHmyom6-HanHNMZAMJAcl5t-26uOGJgLI64MCl3abMa7FxiLAg',
  },
  {
    id: '5',
    name: 'Organic Bananas Bunch',
    price: 1.99,
    stock: 85,
    sku: 'FRU-9921',
    category: 'Grocery',
    unit: 'ea',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzwe9ikzT25B_qRuKo0FCxckifDsnHJEGEdyP9DuKwtFxPW2baYpTEVcjGvECg6sdRdHnPUykFm3cFrh8gh2CW_jdwh9Okx2GX0-CfJC48-FbsvMJH1Db5gGYuR6KcnMxW6zH4IK7M49vd3fOnf3TRY58TGpQVJ-pa-nEbjlN_gza5HtKDYtUtL4jz-TZkytZSVACGdO2KLvlGnTCVT2GuF-QsrzE2N_OBHbcxUludBVK6kuT41DsVkw',
  },
];

const FILTERS = ['All', 'Grocery', 'Snacks', 'Beverages', 'Dairy'];
const SORT_MODES = ['Name (A-Z)', 'Price (Low-High)', 'Price (High-Low)'];

export default function ProductsScreen() {
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortIndex, setSortIndex] = useState(0); // Index in SORT_MODES
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState(FILTERS[1]); // Grocery
  const [formUnit, setFormUnit] = useState('');
  const [formError, setFormError] = useState('');

  // Sorting mode label
  const sortMode = SORT_MODES[sortIndex];

  // Filtering & Sorting products logic
  const processedProducts = useMemo(() => {
    // 1. Filter
    let result = products.filter((product) => {
      const matchesCategory =
        selectedFilter === 'All' || product.category === selectedFilter;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    // 2. Sort
    result.sort((a, b) => {
      if (sortMode === 'Name (A-Z)') {
        return a.name.localeCompare(b.name);
      }
      if (sortMode === 'Price (Low-High)') {
        return a.price - b.price;
      }
      if (sortMode === 'Price (High-Low)') {
        return b.price - a.price;
      }
      return 0;
    });

    return result;
  }, [products, selectedFilter, searchQuery, sortMode]);

  // Actions
  const handleToggleSort = () => {
    setSortIndex((prev) => (prev + 1) % SORT_MODES.length);
  };

  const handleAddProduct = () => {
    setFormError('');
    if (!formName.trim() || !formSku.trim() || !formPrice.trim() || !formStock.trim()) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const skuExists = products.some(
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

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formName.trim(),
      sku: formSku.trim().toUpperCase(),
      price: priceNum,
      stock: stockNum,
      category: formCategory,
      unit: formUnit.trim() ? formUnit.trim() : undefined,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Reset Form & Close
    setFormName('');
    setFormSku('');
    setFormPrice('');
    setFormStock('');
    setFormCategory(FILTERS[1]);
    setFormUnit('');
    setAddModalVisible(false);
  };

  // Simulate loading more products
  const handleLoadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setLoadingMore(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="menu" size={24} color="#434655" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartPOS</Text>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="notifications" size={24} color="#434655" />
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <FlatList
        data={processedProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        stickyHeaderIndices={[0]}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          /* Search & Filter Sticky Bar */
          <View style={styles.toolbarWrapper}>
            {/* Search Input */}
            <View style={styles.searchWrapper}>
              <MaterialIcons name="search" size={20} color="#737686" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products, SKUs..."
                placeholderTextColor="#737686"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={() => router.push('/scanner')}
              >
                <MaterialIcons name="qr-code-scanner" size={20} color="#434655" />
              </TouchableOpacity>
            </View>

            {/* Filter and Sort Row */}
            <View style={styles.filterSortRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {FILTERS.map((filter) => {
                  const active = selectedFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[styles.filterChip, active && styles.filterChipActive]}
                      onPress={() => setSelectedFilter(filter)}
                    >
                      <Text
                        style={[styles.filterChipText, active && styles.filterChipTextActive]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Sort trigger */}
              <TouchableOpacity style={styles.sortButton} onPress={handleToggleSort}>
                <MaterialIcons name="sort" size={16} color="#131b2e" />
                <Text style={styles.sortButtonText}>{sortMode.split(' ')[0]}</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isOutOfStock = item.stock === 0;
          const isLowStock = item.stock > 0 && item.stock <= 8;

          return (
            <View style={styles.productItemCard}>
              <View style={styles.productThumbnailWrapper}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={[styles.productThumbnail, isOutOfStock && styles.grayscaleImage]}
                    contentFit="cover"
                  />
                ) : (
                  <MaterialIcons name="inventory" size={24} color="#c3c6d7" />
                )}
              </View>

              <View style={styles.productDetails}>
                <Text style={[styles.productName, isOutOfStock && styles.textSecondary]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.productSku}>SKU: {item.sku}</Text>
              </View>

              <View style={styles.productMeta}>
                <Text style={[styles.productPrice, isOutOfStock && styles.textSecondary]}>
                  ${item.price.toFixed(2)}
                  {item.unit ? <Text style={styles.unitText}>/{item.unit}</Text> : null}
                </Text>

                {/* Stock status badge */}
                {isOutOfStock ? (
                  <View style={[styles.badge, styles.badgeError]}>
                    <View style={[styles.badgeDot, styles.dotError]} />
                    <Text style={styles.badgeTextError}>Out of Stock</Text>
                  </View>
                ) : isLowStock ? (
                  <View style={[styles.badge, styles.badgeWarning]}>
                    <View style={[styles.badgeDot, styles.dotWarning]} />
                    <Text style={styles.badgeTextWarning}>{item.stock} Low Stock</Text>
                  </View>
                ) : (
                  <View style={[styles.badge, styles.badgeSuccess]}>
                    <View style={[styles.badgeDot, styles.dotSuccess]} />
                    <Text style={styles.badgeTextSuccess}>{item.stock} In Stock</Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color="#c3c6d7" />
            <Text style={styles.emptyText}>No products found matching your filters.</Text>
          </View>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loaderFooter}>
              <ActivityIndicator size="small" color="#004ac6" />
            </View>
          ) : null
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
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
              <Text style={styles.modalTitle}>Add Product to Catalog</Text>
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
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Organic Red Apples"
                  placeholderTextColor="#737686"
                  value={formName}
                  onChangeText={setFormName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>SKU Code *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. APP-1001"
                  placeholderTextColor="#737686"
                  autoCapitalize="characters"
                  value={formSku}
                  onChangeText={setFormSku}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.inputLabel}>Unit Price ($) *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 2.99"
                    placeholderTextColor="#737686"
                    keyboardType="numeric"
                    value={formPrice}
                    onChangeText={setFormPrice}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Unit (optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. lb, ea, pack"
                    placeholderTextColor="#737686"
                    value={formUnit}
                    onChangeText={setFormUnit}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Initial Stock Level *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 100"
                  placeholderTextColor="#737686"
                  keyboardType="numeric"
                  value={formStock}
                  onChangeText={setFormStock}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryDropdown}>
                  {FILTERS.slice(1).map((cat) => {
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
    paddingBottom: 90,
  },
  toolbarWrapper: {
    backgroundColor: '#faf8ff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.1)',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c3c6d7',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#131b2e',
    paddingVertical: 0,
  },
  scanBtn: {
    padding: 4,
  },
  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c3c6d7',
  },
  filterChipActive: {
    backgroundColor: '#d0e1fb',
    borderColor: '#004ac6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#434655',
  },
  filterChipTextActive: {
    color: '#003ea8',
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e7ff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 32,
    gap: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#131b2e',
  },
  productItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  productThumbnailWrapper: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f2f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  productThumbnail: {
    width: '100%',
    height: '100%',
  },
  grayscaleImage: {
    opacity: 0.7,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#737686',
  },
  productMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131b2e',
    marginBottom: 4,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#434655',
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
    backgroundColor: '#fff8e6',
  },
  badgeError: {
    backgroundColor: '#ffdad6',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotSuccess: {
    backgroundColor: '#166534',
  },
  dotWarning: {
    backgroundColor: '#d97706',
  },
  dotError: {
    backgroundColor: '#ba1a1a',
  },
  badgeTextSuccess: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '500',
  },
  badgeTextWarning: {
    fontSize: 11,
    color: '#d97706',
    fontWeight: '500',
  },
  badgeTextError: {
    fontSize: 11,
    color: '#ba1a1a',
    fontWeight: '500',
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
  loaderFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#004ac6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
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
