import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { store, Product } from '@/constants/store';

const FILTERS = ['All', 'Grocery', 'Snacks', 'Beverages', 'Dairy'];
const SORT_MODES = ['Name (A-Z)', 'Price (Low-High)', 'Price (High-Low)'];

export default function ProductsScreen() {
  const router = useRouter();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortIndex, setSortIndex] = useState(0); // Index in SORT_MODES
  const [loadingMore, setLoadingMore] = useState(false);

  // Subscribe to store updates
  useEffect(() => {
    setProducts(store.getProducts());
    const unsubscribe = store.subscribe(() => {
      setProducts(store.getProducts());
    });
    return unsubscribe;
  }, []);

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

  // Simulate loading more products
  const handleLoadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setLoadingMore(false);
    }, 1200);
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
          const isLowStock = item.stock > 0 && item.stock <= item.lowStockAlert;

          return (
            <TouchableOpacity
              style={styles.productItemCard}
              onPress={() => router.push(`/add_product?id=${item.id}`)}
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
            </TouchableOpacity>
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
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add_product')}>
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
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
});
