import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { store, Product } from '@/constants/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORIES = ['All Items', 'Beverages', 'Snacks', 'Electronics', 'Apparel'];

export default function BillingScreen() {
  const router = useRouter();

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountModalVisible, setDiscountModalVisible] = useState(false);
  const [discountInput, setDiscountInput] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [chargeSuccess, setChargeSuccess] = useState(false);

  // Subscribe to store updates
  useEffect(() => {
    setProducts(store.getProducts());
    const unsubscribe = store.subscribe(() => {
      setProducts(store.getProducts());
    });
    return unsubscribe;
  }, []);

  // Animation for Bottom Sheet
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Open/Close Bottom Sheet Animation
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: cartOpen ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [cartOpen, slideAnim]);

  // Calculations
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discountAmount = subtotal * (discountPercent / 100);
    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = taxableSubtotal * 0.08;
    const total = taxableSubtotal + tax;
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return {
      subtotal,
      discountAmount,
      tax,
      total,
      totalItems,
    };
  }, [cart, discountPercent]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All Items' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Helper dictionary of product quantities in cart
  const cartQuantities = useMemo(() => {
    const quantities: Record<string, number> = {};
    cart.forEach((item) => {
      quantities[item.product.id] = item.quantity;
    });
    return quantities;
  }, [cart]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Product is out of stock.');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Cannot add more. Only ${product.stock} units available in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > product.stock) {
              alert(`Cannot add more. Only ${product.stock} units available in stock.`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleApplyDiscount = () => {
    const val = parseFloat(discountInput);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setDiscountPercent(val);
    } else {
      setDiscountPercent(0);
    }
    setDiscountModalVisible(false);
  };

  const handleCharge = () => {
    if (cart.length === 0) return;

    // Deduct stock levels in shared store
    cart.forEach((item) => {
      store.checkoutProduct(item.product.id, item.quantity);
    });

    setChargeSuccess(true);
  };

  const handleResetCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setDiscountInput('');
    setCartOpen(false);
    setChargeSuccess(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="menu" size={24} color="#004ac6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartPOS</Text>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="notifications" size={24} color="#434655" />
        </TouchableOpacity>
      </View>

      {/* Main Grid View */}
      <View style={styles.mainContent}>
        {/* Search and Action Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchWrapper}>
            <MaterialIcons name="search" size={20} color="#737686" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, SKU..."
              placeholderTextColor="#737686"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push('/scanner')}
          >
            <MaterialIcons name="qr-code-scanner" size={20} color="#ffffff" />
            <Text style={styles.scanButtonText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    active && styles.categoryChipActive,
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      active && styles.categoryChipTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Grid */}
        <FlatList
          data={filteredProducts}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          renderItem={({ item }) => {
            const qty = cartQuantities[item.id] || 0;
            const inCart = qty > 0;
            const isOutOfStock = item.stock === 0;

            return (
              <View
                style={[
                  styles.productCard,
                  inCart && styles.productCardActive,
                  isOutOfStock && styles.productCardOutOfStock,
                ]}
              >
                {/* Badge for items in cart */}
                {inCart && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{qty}</Text>
                  </View>
                )}

                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <MaterialIcons name="inventory" size={32} color="#c3c6d7" />
                  </View>
                )}

                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.productFooter}>
                    <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>

                    {isOutOfStock ? (
                      <View style={styles.outOfStockLabel}>
                        <Text style={styles.outOfStockText}>SOLD OUT</Text>
                      </View>
                    ) : inCart ? (
                      <View style={styles.cardQtyControls}>
                        <TouchableOpacity
                          style={styles.cardQtyBtn}
                          onPress={() => updateQuantity(item.id, -1)}
                        >
                          <MaterialIcons name="remove" size={14} color="#434655" />
                        </TouchableOpacity>
                        <Text style={styles.cardQtyText}>{qty}</Text>
                        <TouchableOpacity
                          style={styles.cardQtyBtn}
                          onPress={() => updateQuantity(item.id, 1)}
                        >
                          <MaterialIcons name="add" size={14} color="#434655" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.addBtnCircle}
                        onPress={() => addToCart(item)}
                      >
                        <MaterialIcons name="add" size={18} color="#004ac6" />
                      </TouchableOpacity>
                    )}
                  </View>
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
        />
      </View>

      {/* Floating Cart Button (Mobile only, visible if cart is not empty) */}
      {cartTotals.totalItems > 0 && !cartOpen && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setCartOpen(true)}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#ffffff" />
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>{cartTotals.totalItems}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom Sheet Cart Overlay */}
      {cartOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setCartOpen(false)}
        />
      )}

      <Animated.View
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Drag Handle */}
        <TouchableOpacity
          style={styles.dragHandleContainer}
          onPress={() => setCartOpen(false)}
        >
          <View style={styles.dragHandle} />
        </TouchableOpacity>

        {/* Cart Header */}
        <View style={styles.cartHeader}>
          <View style={styles.cartHeaderTitleContainer}>
            <MaterialIcons name="shopping-cart" size={22} color="#004ac6" />
            <Text style={styles.cartHeaderTitle}>Current Order</Text>
          </View>
          <View style={styles.cartCountBadge}>
            <Text style={styles.cartCountText}>{cartTotals.totalItems} Items</Text>
          </View>
        </View>

        {/* Cart Item List */}
        <ScrollView style={styles.cartItemList}>
          {cart.map((item) => (
            <View key={item.product.id} style={styles.cartItem}>
              {item.product.image ? (
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.cartItemImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.cartItemImage, { alignItems: 'center', justifyContent: 'center' }]}>
                  <MaterialIcons name="inventory" size={20} color="#737686" />
                </View>
              )}
              <View style={styles.cartItemDetails}>
                <View style={styles.cartItemRow}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product.id)}
                    style={styles.deleteBtn}
                  >
                    <MaterialIcons name="close" size={18} color="#737686" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cartItemFooter}>
                  <Text style={styles.cartItemPrice}>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                  <View style={styles.cartItemQtyControls}>
                    <TouchableOpacity
                      style={styles.cartQtyBtn}
                      onPress={() => updateQuantity(item.product.id, -1)}
                    >
                      <MaterialIcons name="remove" size={16} color="#434655" />
                    </TouchableOpacity>
                    <Text style={styles.cartQtyTextVal}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.cartQtyBtn}
                      onPress={() => updateQuantity(item.product.id, 1)}
                    >
                      <MaterialIcons name="add" size={16} color="#434655" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {cart.length === 0 && (
            <View style={styles.emptyCart}>
              <MaterialIcons name="shopping-basket" size={48} color="#c3c6d7" />
              <Text style={styles.emptyCartText}>Your order is empty</Text>
            </View>
          )}
        </ScrollView>

        {/* Footer Summary & Checkout */}
        <View style={styles.cartFooter}>
          {/* Add Discount */}
          <TouchableOpacity
            style={styles.discountButton}
            onPress={() => {
              setDiscountInput(discountPercent > 0 ? discountPercent.toString() : '');
              setDiscountModalVisible(true);
            }}
          >
            <View style={styles.discountLeft}>
              <MaterialIcons name="sell" size={18} color="#004ac6" />
              <Text style={styles.discountText}>
                {discountPercent > 0
                  ? `Discount Applied: ${discountPercent}%`
                  : 'Add Discount'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color="#737686" />
          </TouchableOpacity>

          {/* Pricing Details */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${cartTotals.subtotal.toFixed(2)}</Text>
          </View>

          {discountPercent > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount ({discountPercent}%)</Text>
              <Text style={[styles.summaryValue, styles.discountAppliedText]}>
                -${cartTotals.discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8%)</Text>
            <Text style={styles.summaryValue}>${cartTotals.tax.toFixed(2)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${cartTotals.total.toFixed(2)}</Text>
          </View>

          {/* Charge Button */}
          <TouchableOpacity
            style={[
              styles.chargeButton,
              cart.length === 0 && styles.chargeButtonDisabled,
            ]}
            disabled={cart.length === 0}
            onPress={handleCharge}
          >
            <Text style={styles.chargeButtonText}>Charge</Text>
            <Text style={styles.chargeButtonAmount}>
              ${cartTotals.total.toFixed(2)}
            </Text>
            <MaterialIcons name="arrow-forward" size={18} color="#ffffff" style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Discount modal */}
      <Modal
        visible={discountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDiscountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Apply Discount</Text>
            <Text style={styles.modalDescription}>
              Enter a percentage discount (0-100) to apply to the subtotal.
            </Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 10"
              value={discountInput}
              onChangeText={setDiscountInput}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setDiscountModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleApplyDiscount}
              >
                <Text style={styles.modalConfirmText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Payment Success Modal */}
      <Modal
        visible={chargeSuccess}
        transparent
        animationType="fade"
        onRequestClose={handleResetCart}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successContainer}>
            <View style={styles.successIconWrapper}>
              <MaterialIcons name="check-circle" size={64} color="#006329" />
            </View>
            <Text style={styles.successTitle}>Transaction Complete!</Text>
            <Text style={styles.successDescription}>
              Payment of <Text style={styles.successAmount}>${cartTotals.total.toFixed(2)}</Text>{' '}
              was charged successfully.
            </Text>
            <TouchableOpacity
              style={styles.successBtn}
              onPress={handleResetCart}
            >
              <Text style={styles.successBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
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
  mainContent: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.1)',
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#f2f3ff',
    borderRadius: 22,
    paddingHorizontal: 12,
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
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#2563eb',
    borderRadius: 22,
    paddingHorizontal: 16,
    gap: 6,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.2)',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#f2f3ff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
  },
  categoryChipActive: {
    backgroundColor: '#d0e1fb',
    borderColor: '#004ac6',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#434655',
  },
  categoryChipTextActive: {
    color: '#003ea8',
    fontWeight: '600',
  },
  gridContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productCard: {
    flex: 0.485,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.2)',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productCardActive: {
    borderColor: 'rgba(0,74,198,0.3)',
    backgroundColor: '#f9faff',
  },
  productCardOutOfStock: {
    opacity: 0.6,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2563eb',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f2f3ff',
  },
  productImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f2f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productDetails: {
    padding: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#131b2e',
    marginBottom: 6,
    height: 36,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#004ac6',
  },
  outOfStockLabel: {
    backgroundColor: '#ffdad6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#ba1a1a',
    fontSize: 10,
    fontWeight: '700',
  },
  addBtnCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f2f3ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaedff',
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
  },
  cardQtyBtn: {
    padding: 2,
  },
  cardQtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#131b2e',
    marginHorizontal: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 14,
    color: '#737686',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
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
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 30,
  },
  fabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ba1a1a',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  fabBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 40,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.75,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 24,
    zIndex: 50,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#c3c6d7',
    borderRadius: 2.5,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.2)',
  },
  cartHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131b2e',
  },
  cartCountBadge: {
    backgroundColor: '#d0e1fb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cartCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#003ea8',
  },
  cartItemList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.1)',
    alignItems: 'center',
  },
  cartItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#f2f3ff',
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#131b2e',
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    padding: 2,
  },
  cartItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004ac6',
  },
  cartItemQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f3ff',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.2)',
  },
  cartQtyBtn: {
    padding: 4,
  },
  cartQtyTextVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#131b2e',
    marginHorizontal: 8,
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyCartText: {
    fontSize: 14,
    color: '#737686',
    marginTop: 10,
  },
  cartFooter: {
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(195,198,215,0.2)',
    backgroundColor: '#ffffff',
  },
  discountButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#faf8ff',
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#c3c6d7',
    marginBottom: 12,
  },
  discountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#131b2e',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#434655',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#131b2e',
  },
  discountAppliedText: {
    color: '#ba1a1a',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(195,198,215,0.2)',
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#131b2e',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004ac6',
  },
  chargeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    gap: 8,
  },
  chargeButtonDisabled: {
    backgroundColor: '#c3c6d7',
  },
  chargeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  chargeButtonAmount: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  arrowIcon: {
    marginLeft: 4,
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
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    color: '#434655',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#131b2e',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#434655',
  },
  modalConfirmBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  successContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  successIconWrapper: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131b2e',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#434655',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successAmount: {
    fontWeight: '700',
    color: '#004ac6',
  },
  successBtn: {
    backgroundColor: '#006329',
    height: 44,
    width: '100%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
