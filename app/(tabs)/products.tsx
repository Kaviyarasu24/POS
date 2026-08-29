import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { store, Product } from '@/constants/store';
import { PRODUCT_CATEGORIES } from '@/constants/config';

const FILTERS = ['All', ...PRODUCT_CATEGORIES];

interface SortOption {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'name_asc', label: 'Name (A to Z)', shortLabel: 'A to Z', icon: 'sort-by-alpha' },
  { id: 'name_desc', label: 'Name (Z to A)', shortLabel: 'Z to A', icon: 'sort-by-alpha' },
  { id: 'price_asc', label: 'Price (Low to High)', shortLabel: 'Price ↑', icon: 'trending-up' },
  { id: 'price_desc', label: 'Price (High to Low)', shortLabel: 'Price ↓', icon: 'trending-down' },
  { id: 'stock_asc', label: 'Stock (Low to High)', shortLabel: 'Stock ↑', icon: 'inventory-2' },
  { id: 'stock_desc', label: 'Stock (High to Low)', shortLabel: 'Stock ↓', icon: 'inventory' },
];

export default function ProductsScreen() {
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSortId, setSelectedSortId] = useState('name_asc');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Subscribe to store updates
  useEffect(() => {
    setProducts(store.getProducts());
    const unsubscribe = store.subscribe(() => {
      setProducts(store.getProducts());
    });
    return unsubscribe;
  }, []);

  const activeSort = SORT_OPTIONS.find((s) => s.id === selectedSortId) || SORT_OPTIONS[0];

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
      if (selectedSortId === 'name_asc') return a.name.localeCompare(b.name);
      if (selectedSortId === 'name_desc') return b.name.localeCompare(a.name);
      if (selectedSortId === 'price_asc') return a.price - b.price;
      if (selectedSortId === 'price_desc') return b.price - a.price;
      if (selectedSortId === 'stock_asc') return a.stock - b.stock;
      if (selectedSortId === 'stock_desc') return b.stock - a.stock;
      return 0;
    });

    return result;
  }, [products, selectedFilter, searchQuery, selectedSortId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products Catalog</Text>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => router.push('/add_product')}
        >
          <MaterialIcons name="add-circle" size={24} color="#004ac6" />
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <FlatList
        data={processedProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
          /* Search & Filter Sticky Bar */
          <View style={styles.toolbarWrapper}>
            {/* 1. Search Bar */}
            <View style={styles.searchWrapper}>
              <MaterialIcons name="search" size={20} color="#737686" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products by name or SKU..."
                placeholderTextColor="#94a3b8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4, marginRight: 4 }}>
                  <MaterialIcons name="close" size={18} color="#737686" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={() => router.push('/scanner')}
              >
                <MaterialIcons name="qr-code-scanner" size={20} color="#004ac6" />
              </TouchableOpacity>
            </View>

            {/* 2. Full-Width Dedicated Category Pill Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {FILTERS.map((filter) => {
                const active = selectedFilter === filter;
                const count =
                  filter === 'All'
                    ? products.length
                    : products.filter((p) => p.category === filter).length;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterChip, active && styles.filterChipActive]}
                    onPress={() => setSelectedFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.filterChipText, active && styles.filterChipTextActive]}
                    >
                      {filter}
                    </Text>
                    <View style={[styles.filterBadge, active && styles.filterBadgeActive]}>
                      <Text style={[styles.filterBadgeText, active && styles.filterBadgeTextActive]}>
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 3. Sub-bar: Item Count & Dedicated Sort Modal Trigger */}
            <View style={styles.metaRow}>
              <Text style={styles.resultsCount}>
                Showing <Text style={{ fontWeight: '700', color: '#131b2e' }}>{processedProducts.length}</Text> {processedProducts.length === 1 ? 'item' : 'items'}
                {selectedFilter !== 'All' ? ` in ${selectedFilter}` : ''}
              </Text>

              <TouchableOpacity
                style={styles.sortPillButton}
                onPress={() => setSortModalVisible(true)}
                activeOpacity={0.8}
              >
                <MaterialIcons name={activeSort.icon as any} size={14} color="#004ac6" />
                <Text style={styles.sortPillText}>{activeSort.shortLabel}</Text>
                <MaterialIcons name="arrow-drop-down" size={18} color="#004ac6" />
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isOutOfStock = item.stock === 0;
          const isLowStock = item.stock > 0 && item.stock <= item.lowStockAlert;

          return (
            <TouchableOpacity
              style={styles.productItemCard}
              onPress={() => router.push(`/add_product?id=${item.id}`)}
              activeOpacity={0.7}
            >
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
                  ₹{item.price.toFixed(2)}
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
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={48} color="#c3c6d7" />
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedFilter !== 'All'
                ? 'Try clearing your filters or search terms.'
                : 'Your catalog is empty. Tap "+ Add Product" to get started!'}
            </Text>
            {searchQuery || selectedFilter !== 'All' ? (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedFilter('All');
                }}
              >
                <Text style={styles.resetFilterBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add_product')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Sort Options Modal Sheet */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Sort Products</Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <MaterialIcons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.sortList}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = selectedSortId === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.sortOptionRow, isSelected && styles.sortOptionRowActive]}
                    onPress={() => {
                      setSelectedSortId(opt.id);
                      setSortModalVisible(false);
                    }}
                  >
                    <View style={styles.sortOptionLeft}>
                      <MaterialIcons
                        name={opt.icon as any}
                        size={20}
                        color={isSelected ? '#004ac6' : '#64748b'}
                      />
                      <Text
                        style={[
                          styles.sortOptionLabel,
                          isSelected && styles.sortOptionLabelActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <MaterialIcons name="check" size={20} color="#004ac6" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
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
    padding: 6,
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.2)',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#131b2e',
    paddingVertical: 0,
  },
  scanBtn: {
    padding: 4,
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#004ac6',
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#004ac6',
    fontWeight: '700',
  },
  filterBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterBadgeActive: {
    backgroundColor: '#004ac6',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  filterBadgeTextActive: {
    color: '#ffffff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resultsCount: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '500',
  },
  sortPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  sortPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004ac6',
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
    borderColor: 'rgba(195,198,215,0.3)',
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
  productThumbnailWrapper: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
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
    fontSize: 15,
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
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#131b2e',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13.5,
    color: '#737686',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  resetFilterBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  resetFilterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#004ac6',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#131b2e',
  },
  sortList: {
    gap: 6,
  },
  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  sortOptionRowActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortOptionLabel: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  sortOptionLabelActive: {
    color: '#004ac6',
    fontWeight: '700',
  },
});
