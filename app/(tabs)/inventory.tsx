import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { store, Product } from '@/constants/store';

const FILTERS = ['All Stock', 'Low Stock', 'Out of Stock'];

export default function InventoryScreen() {
  const router = useRouter();

  // State
  const [inventory, setInventory] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All Stock');

  // Subscribe to store updates
  useEffect(() => {
    setInventory(store.getProducts());
    const unsubscribe = store.subscribe(() => {
      setInventory(store.getProducts());
    });
    return unsubscribe;
  }, []);

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
        return item.stock > 0 && item.stock <= item.lowStockAlert;
      }
      if (selectedFilter === 'Out of Stock') {
        return item.stock === 0;
      }
      return true; // All Stock
    });
  }, [inventory, selectedFilter]);

  // Actions
  const handleRestock = (itemId: string) => {
    store.restockProduct(itemId, 20);
    alert('Restocked 20 units successfully.');
  };

  const handleReorder = (itemId: string) => {
    store.restockProduct(itemId, 50);
    alert('Reordered 50 units successfully.');
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
                  ₹{metrics.totalValue.toLocaleString(undefined, {
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
          const isLowStock = item.stock > 0 && item.stock <= item.lowStockAlert;

          return (
            <TouchableOpacity
              style={[
                styles.itemCard,
                isOutOfStock && styles.itemCardOutOfStock,
                isLowStock && styles.itemCardLowStock,
              ]}
              onPress={() => router.push(`/add_product?id=${item.id}`)}
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
                      ₹{item.price.toFixed(2)}<Text style={{ fontSize: 11, fontWeight: '500', color: '#64748b' }}>/{item.unit || 'pc'}</Text>
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
                        <Text style={styles.badgeTextWarning}>{item.stock} {item.unit || 'pcs'} left</Text>
                      </View>
                    ) : (
                      <View style={[styles.badge, styles.badgeSuccess]}>
                        <MaterialIcons name="check-circle" size={12} color="#166534" />
                        <Text style={styles.badgeTextSuccess}>{item.stock} {item.unit || 'pcs'}</Text>
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
            </TouchableOpacity>
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
        onPress={() => router.push('/add_product')}
      >
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
});
