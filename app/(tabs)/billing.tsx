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
  Alert,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { store, Product, GeneratedBill } from '@/constants/store';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CartItem {
  product: Product;
  quantity: number;
}

const CATEGORIES = ['All Items', 'Beverages', 'Snacks', 'Electronics', 'Apparel', 'Grocery'];
const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash', icon: 'payments' },
  { id: 'UPI', label: 'UPI / QR', icon: 'qr-code-scanner' },
  { id: 'CARD', label: 'Card', icon: 'credit-card' },
];

const formatNum = (val: any) => {
  const n = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(n) ? '0.00' : n.toFixed(2);
};

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

  // Payment & Bill Generator States
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);

  // Generated Bill State
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<GeneratedBill | null>(null);

  // Subscribe to store updates
  useEffect(() => {
    setProducts(store.getProducts());

    const checkScanned = () => {
      if (store.scannedItems && store.scannedItems.length > 0) {
        setCart((prevCart) => {
          const newCart = [...prevCart];
          store.scannedItems.forEach((scanned) => {
            const product = store.getProductById(scanned.productId);
            if (product) {
              const existingIdx = newCart.findIndex((item) => item.product.id === scanned.productId);
              if (existingIdx > -1) {
                newCart[existingIdx].quantity += scanned.quantity;
              } else {
                newCart.push({ product, quantity: scanned.quantity });
              }
            }
          });
          return newCart;
        });
        store.scannedItems = [];
      }
    };

    checkScanned();

    const unsubscribe = store.subscribe(() => {
      setProducts(store.getProducts());
      checkScanned();
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
      Alert.alert('Out of Stock', `${product.name} is currently out of stock.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          Alert.alert('Limit Reached', `Only ${product.stock} units available in stock.`);
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
              Alert.alert('Limit Reached', `Only ${product.stock} units available in stock.`);
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

  // Open Payment Details Modal
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setPaymentModalVisible(true);
  };

  // Process Checkout & Generate Bill
  const handleProcessCheckout = async () => {
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      const bill = await store.checkoutOrder(
        cartTotals.subtotal,
        cartTotals.discountAmount,
        cartTotals.tax,
        cartTotals.total,
        cart.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        selectedPaymentMethod
      );

      setGeneratedBill(bill);
      setPaymentModalVisible(false);
      setCartOpen(false);
      setBillModalVisible(true);
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Unable to process checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetForNewSale = () => {
    setCart([]);
    setCartOpen(false);
    setDiscountPercent(0);
    setDiscountInput('');
    setPaymentModalVisible(false);
    setBillModalVisible(false);
    setGeneratedBill(null);
  };

  const handleShareBill = async () => {
    if (!generatedBill) return;
    try {
      const itemsText = generatedBill.items
        .map((i) => `• ${i.product_name} x${i.quantity} = ₹${formatNum((parseFloat(i.price as any) || 0) * i.quantity)}`)
        .join('\n');

      const billText = `🧾 *${generatedBill.shop_name} - Bill Receipt*\n` +
        `Invoice: ${generatedBill.invoice_number}\n` +
        `Date: ${new Date(generatedBill.created_at).toLocaleString()}\n` +
        `Billed By: ${generatedBill.cashier_name || 'Cashier'}\n` +
        `Payment: ${generatedBill.payment_method}\n` +
        `------------------------\n` +
        `${itemsText}\n` +
        `------------------------\n` +
        `Subtotal: ₹${formatNum(generatedBill.subtotal)}\n` +
        `Tax: ₹${formatNum(generatedBill.tax)}\n` +
        ((parseFloat(generatedBill.discount as any) || 0) > 0 ? `Discount: -₹${formatNum(generatedBill.discount)}\n` : '') +
        `*Total: ₹${formatNum(generatedBill.total)}*\n\n` +
        `Thank you for shopping with us!`;

      await Share.share({
        message: billText,
        title: `Bill ${generatedBill.invoice_number}`,
      });
    } catch (error: any) {
      console.warn('Share error:', error.message);
    }
  };

  const handlePrintBill = () => {
    Alert.alert('Print Receipt', `Receipt #${generatedBill?.invoice_number} sent to printer!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>SmartPOS</Text>
          <View style={styles.storeBadge}>
            <Text style={styles.storeBadgeText}>
              {store.currentUser?.shopName || 'Store'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.cashierNameText}>
            👤 {store.currentUser?.userName || 'Owner'}
          </Text>
        </View>
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
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={18} color="#737686" />
              </TouchableOpacity>
            )}
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

        {/* Product Catalog Grid */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const qtyInCart = cartQuantities[item.id] || 0;
            const isOutOfStock = item.stock <= 0;

            return (
              <TouchableOpacity
                style={[
                  styles.productCard,
                  isOutOfStock && styles.productCardDisabled,
                ]}
                activeOpacity={0.7}
                onPress={() => addToCart(item)}
                disabled={isOutOfStock}
              >
                <View style={styles.imageWrapper}>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.productImage}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <MaterialIcons name="shopping-bag" size={32} color="#8e90a0" />
                    </View>
                  )}
                  {qtyInCart > 0 && (
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityBadgeText}>{qtyInCart}</Text>
                    </View>
                  )}
                  {isOutOfStock && (
                    <View style={styles.outOfStockBadge}>
                      <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                  )}
                </View>

                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.productSku}>{item.sku}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
                    <Text style={styles.productStock}>Stock: {item.stock}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color="#c3c6d7" />
              <Text style={styles.emptyStateText}>No products found</Text>
            </View>
          }
        />
      </View>

      {/* Floating Cart Bar (Collapsed State) */}
      {!cartOpen && cart.length > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCartBar}
            activeOpacity={0.9}
            onPress={() => setCartOpen(true)}
          >
            <View style={styles.floatingCartLeft}>
              <View style={styles.cartCountPill}>
                <Text style={styles.cartCountPillText}>{cartTotals.totalItems}</Text>
              </View>
              <Text style={styles.floatingCartLabel}>View Cart</Text>
            </View>
            <View style={styles.floatingCartRight}>
              <Text style={styles.floatingCartTotal}>
                ₹{cartTotals.total.toFixed(2)}
              </Text>
              <MaterialIcons name="keyboard-arrow-up" size={24} color="#ffffff" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Backdrop when cart is open */}
      {cartOpen && (
        <TouchableOpacity
          style={styles.cartBackdrop}
          activeOpacity={1}
          onPress={() => setCartOpen(false)}
        />
      )}

      {/* Slide-up Cart Bottom Sheet */}
      {cartOpen && (
        <Animated.View
          style={[
            styles.cartBottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Sheet Handle / Header */}
          <View style={styles.cartHeader}>
            <View style={styles.cartHeaderTop}>
              <View style={styles.sheetHandle} />
            </View>
            <View style={styles.cartHeaderContent}>
              <View>
                <Text style={styles.cartTitle}>Current Order</Text>
                <Text style={styles.cartSubtitle}>
                  {cartTotals.totalItems} {cartTotals.totalItems === 1 ? 'item' : 'items'}
                </Text>
              </View>
              <View style={styles.cartHeaderActions}>
                <TouchableOpacity
                  style={styles.clearCartBtn}
                  onPress={() => setCart([])}
                >
                  <Text style={styles.clearCartText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeCartBtn}
                  onPress={() => setCartOpen(false)}
                >
                  <MaterialIcons name="close" size={20} color="#434655" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Cart Item List */}
          <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
            {cart.map((item) => (
              <View key={item.product.id} style={styles.cartItemRow}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    ₹{item.product.price.toFixed(2)} each
                  </Text>
                </View>

                <View style={styles.cartItemActions}>
                  <View style={styles.qtyControl}>
                    <TouchableOpacity
                      style={styles.cartQtyBtn}
                      onPress={() => updateQuantity(item.product.id, -1)}
                    >
                      <MaterialIcons name="remove" size={16} color="#004ac6" />
                    </TouchableOpacity>
                    <Text style={styles.cartQtyTextVal}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.cartQtyBtn}
                      onPress={() => updateQuantity(item.product.id, 1)}
                    >
                      <MaterialIcons name="add" size={16} color="#004ac6" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cartItemTotal}>
                    ₹{(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
            {cart.length === 0 && (
              <View style={styles.emptyCart}>
                <MaterialIcons name="remove-shopping-cart" size={40} color="#c3c6d7" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            )}
          </ScrollView>

          {/* Cart Calculations & Charge Bar */}
          <View style={styles.cartFooter}>
            {/* Discount Trigger */}
            <TouchableOpacity
              style={styles.discountButton}
              onPress={() => setDiscountModalVisible(true)}
            >
              <View style={styles.discountLeft}>
                <MaterialIcons name="local-offer" size={16} color="#004ac6" />
                <Text style={styles.discountText}>
                  {discountPercent > 0
                    ? `Discount applied: ${discountPercent}%`
                    : 'Apply Discount'}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={18} color="#737686" />
            </TouchableOpacity>

            {/* Breakdown */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{cartTotals.subtotal.toFixed(2)}</Text>
            </View>

            {discountPercent > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount ({discountPercent}%)</Text>
                <Text style={[styles.summaryValue, styles.discountAppliedText]}>
                  -₹{cartTotals.discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (8%)</Text>
              <Text style={styles.summaryValue}>₹{cartTotals.tax.toFixed(2)}</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{cartTotals.total.toFixed(2)}</Text>
            </View>

            {/* Charge Button */}
            <TouchableOpacity
              style={[
                styles.chargeButton,
                cart.length === 0 && styles.chargeButtonDisabled,
              ]}
              disabled={cart.length === 0}
              onPress={handleOpenPayment}
            >
              <MaterialIcons name="point-of-sale" size={20} color="#ffffff" />
              <Text style={styles.chargeButtonText}>Proceed to Payment</Text>
              <Text style={styles.chargeButtonAmount}>
                ₹{cartTotals.total.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Discount Modal */}
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

      {/* Payment & Customer Details Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.paymentModalContainer}
          >
            <View style={styles.paymentModalHeader}>
              <View>
                <Text style={styles.paymentModalTitle}>Complete Payment</Text>
                <Text style={styles.paymentModalSubtitle}>
                  Select payment mode and customer info
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPaymentModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={20} color="#737686" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Payment Method Selector */}
              <Text style={styles.sectionLabel}>Select Payment Mode</Text>
              <View style={styles.paymentMethodsRow}>
                {PAYMENT_METHODS.map((method) => {
                  const selected = selectedPaymentMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.paymentMethodCard,
                        selected && styles.paymentMethodCardSelected,
                      ]}
                      onPress={() => setSelectedPaymentMethod(method.id)}
                    >
                      <MaterialIcons
                        name={method.icon as any}
                        size={22}
                        color={selected ? '#004ac6' : '#737686'}
                      />
                      <Text
                        style={[
                          styles.paymentMethodText,
                          selected && styles.paymentMethodTextSelected,
                        ]}
                      >
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Total Payable Display */}
              <View style={styles.payableBox}>
                <Text style={styles.payableBoxLabel}>Total Amount to Charge</Text>
                <Text style={styles.payableBoxAmount}>₹{cartTotals.total.toFixed(2)}</Text>
              </View>
            </ScrollView>

            {/* Confirm & Generate Bill Button */}
            <TouchableOpacity
              style={[
                styles.confirmPaymentBtn,
                isProcessing && styles.chargeButtonDisabled,
              ]}
              disabled={isProcessing}
              onPress={handleProcessCheckout}
            >
              <MaterialIcons name="receipt-long" size={20} color="#ffffff" />
              <Text style={styles.confirmPaymentText}>
                {isProcessing ? 'Generating Bill...' : 'Confirm & Generate Bill'}
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Bill / Invoice Receipt Modal */}
      <Modal
        visible={billModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleResetForNewSale}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.billModalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Receipt Header */}
              <View style={styles.receiptHeader}>
                <View style={styles.receiptCheckIcon}>
                  <MaterialIcons name="check" size={20} color="#ffffff" />
                </View>
                <Text style={styles.receiptShopName}>
                  {generatedBill?.shop_name || 'SmartPOS Supermart'}
                </Text>
                {generatedBill?.shop_address && (
                  <Text style={styles.receiptShopSub}>{generatedBill.shop_address}</Text>
                )}
                {generatedBill?.shop_phone && (
                  <Text style={styles.receiptShopSub}>Tel: {generatedBill.shop_phone}</Text>
                )}
              </View>

              <View style={styles.receiptDivider} />

              {/* Invoice Metadata */}
              <View style={styles.receiptMetaGrid}>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaKey}>Invoice No:</Text>
                  <Text style={[styles.receiptMetaVal, styles.invoiceNoHighlight]}>
                    {generatedBill?.invoice_number}
                  </Text>
                </View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaKey}>Date & Time:</Text>
                  <Text style={styles.receiptMetaVal}>
                    {generatedBill ? new Date(generatedBill.created_at).toLocaleString() : ''}
                  </Text>
                </View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaKey}>Cashier:</Text>
                  <Text style={styles.receiptMetaVal}>
                    {generatedBill?.cashier_name || 'Owner'}
                  </Text>
                </View>
                <View style={styles.receiptMetaRow}>
                  <Text style={styles.receiptMetaKey}>Payment Mode:</Text>
                  <Text style={styles.receiptMetaVal}>
                    {generatedBill?.payment_method}
                  </Text>
                </View>
              </View>

              <View style={styles.receiptDivider} />

              {/* Line Items Table */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCol, styles.tableColItem]}>Item</Text>
                <Text style={[styles.tableCol, styles.tableColQty]}>Qty</Text>
                <Text style={[styles.tableCol, styles.tableColRate]}>Rate</Text>
                <Text style={[styles.tableCol, styles.tableColAmt]}>Total</Text>
              </View>

              {generatedBill?.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableColText, styles.tableColItem]} numberOfLines={1}>
                    {item.product_name}
                  </Text>
                  <Text style={[styles.tableColText, styles.tableColQty]}>{item.quantity}</Text>
                  <Text style={[styles.tableColText, styles.tableColRate]}>₹{formatNum(item.price)}</Text>
                  <Text style={[styles.tableColText, styles.tableColAmt]}>
                    ₹{formatNum((parseFloat(item.price as any) || 0) * item.quantity)}
                  </Text>
                </View>
              ))}

              <View style={styles.receiptDivider} />

              {/* Financial Breakdown */}
              <View style={styles.billSummaryBox}>
                <View style={styles.billSummaryRow}>
                  <Text style={styles.billSummaryLabel}>Subtotal</Text>
                  <Text style={styles.billSummaryVal}>₹{formatNum(generatedBill?.subtotal)}</Text>
                </View>
                {((parseFloat(generatedBill?.discount as any) || 0) > 0) && (
                  <View style={styles.billSummaryRow}>
                    <Text style={styles.billSummaryLabel}>Discount</Text>
                    <Text style={[styles.billSummaryVal, styles.discountAppliedText]}>
                      -₹{formatNum(generatedBill?.discount)}
                    </Text>
                  </View>
                )}
                <View style={styles.billSummaryRow}>
                  <Text style={styles.billSummaryLabel}>Tax (8%)</Text>
                  <Text style={styles.billSummaryVal}>₹{formatNum(generatedBill?.tax)}</Text>
                </View>
                <View style={[styles.billSummaryRow, styles.billGrandTotalRow]}>
                  <Text style={styles.billGrandTotalLabel}>Grand Total</Text>
                  <Text style={styles.billGrandTotalVal}>₹{formatNum(generatedBill?.total)}</Text>
                </View>
              </View>

              <Text style={styles.receiptFooterNote}>
                *** Thank You for Shopping! Please Visit Again ***
              </Text>
            </ScrollView>

            {/* Bill Actions: Print, Share, New Sale */}
            <View style={styles.receiptActions}>
              <TouchableOpacity style={styles.receiptPrintBtn} onPress={handlePrintBill}>
                <MaterialIcons name="print" size={18} color="#004ac6" />
                <Text style={styles.receiptPrintText}>Print</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.receiptShareBtn} onPress={handleShareBill}>
                <MaterialIcons name="share" size={18} color="#006329" />
                <Text style={styles.receiptShareText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.receiptNewSaleBtn} onPress={handleResetForNewSale}>
                <MaterialIcons name="add-shopping-cart" size={18} color="#ffffff" />
                <Text style={styles.receiptNewSaleText}>New Sale</Text>
              </TouchableOpacity>
            </View>
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
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.2)',
    backgroundColor: '#ffffff',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004ac6',
  },
  storeBadge: {
    backgroundColor: '#e6edff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  storeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#004ac6',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cashierNameText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#434655',
    backgroundColor: '#f3f3fa',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
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
    backgroundColor: '#f3f3fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#131b2e',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004ac6',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 10,
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
    borderBottomColor: 'rgba(195,198,215,0.15)',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f3f3fa',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#004ac6',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#434655',
  },
  categoryChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  productList: {
    padding: 12,
    paddingBottom: 90,
  },
  productCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  productCardDisabled: {
    opacity: 0.5,
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    backgroundColor: '#f3f3fa',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#004ac6',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  quantityBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(186, 26, 26, 0.85)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 2,
  },
  productSku: {
    fontSize: 11,
    color: '#737686',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#004ac6',
  },
  productStock: {
    fontSize: 11,
    color: '#737686',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#737686',
    marginTop: 12,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  floatingCartBar: {
    backgroundColor: '#004ac6',
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartCountPill: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cartCountPillText: {
    color: '#004ac6',
    fontSize: 13,
    fontWeight: '700',
  },
  floatingCartLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingCartTotal: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  cartBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 90,
  },
  cartBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.78,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 99,
  },
  cartHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.2)',
  },
  cartHeaderTop: {
    alignItems: 'center',
    marginBottom: 6,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#c3c6d7',
    borderRadius: 2,
  },
  cartHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#131b2e',
  },
  cartSubtitle: {
    fontSize: 12,
    color: '#737686',
  },
  cartHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearCartBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearCartText: {
    fontSize: 13,
    color: '#ba1a1a',
    fontWeight: '600',
  },
  closeCartBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#f3f3fa',
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cartItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(195,198,215,0.15)',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#737686',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3fa',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  cartQtyBtn: {
    padding: 6,
  },
  cartQtyTextVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#131b2e',
    marginHorizontal: 8,
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#131b2e',
    minWidth: 65,
    textAlign: 'right',
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    fontSize: 14,
    color: '#737686',
    marginTop: 8,
  },
  cartFooter: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
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
    marginBottom: 10,
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
    marginBottom: 5,
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
    fontWeight: '700',
    color: '#131b2e',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#004ac6',
  },
  chargeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#004ac6',
    borderRadius: 10,
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
    fontWeight: '800',
  },

  // Modals Overlay & Containers
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131b2e',
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 13,
    color: '#434655',
    marginBottom: 14,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#c3c6d7',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#131b2e',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#434655',
  },
  modalConfirmBtn: {
    backgroundColor: '#004ac6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Payment Details Modal
  paymentModalContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: 16,
    padding: 20,
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  paymentModalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#131b2e',
  },
  paymentModalSubtitle: {
    fontSize: 12,
    color: '#737686',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#f3f3fa',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 8,
    marginTop: 6,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  paymentMethodCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f3f3fa',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  paymentMethodCardSelected: {
    backgroundColor: '#e6edff',
    borderColor: '#004ac6',
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#737686',
  },
  paymentMethodTextSelected: {
    color: '#004ac6',
  },
  payableBox: {
    backgroundColor: '#f8f9ff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbe4ff',
    alignItems: 'center',
    marginBottom: 14,
  },
  payableBoxLabel: {
    fontSize: 12,
    color: '#434655',
    marginBottom: 2,
  },
  payableBoxAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#004ac6',
  },
  cashTenderContainer: {
    backgroundColor: '#fafffa',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c3ecd1',
    marginBottom: 14,
  },
  changeDueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  changeDueLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#006329',
  },
  changeDueValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#006329',
  },
  confirmPaymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006329',
    height: 50,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  confirmPaymentText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Bill Receipt Modal
  billModalContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: 400,
    maxHeight: '92%',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  receiptHeader: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  receiptCheckIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#006329',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  receiptShopName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#131b2e',
    textAlign: 'center',
  },
  receiptShopSub: {
    fontSize: 11,
    color: '#737686',
    textAlign: 'center',
    marginTop: 1,
  },
  receiptShopGst: {
    fontSize: 11,
    fontWeight: '600',
    color: '#434655',
    textAlign: 'center',
    marginTop: 2,
  },
  receiptDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#c3c6d7',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  receiptMetaGrid: {
    gap: 3,
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptMetaKey: {
    fontSize: 11,
    color: '#737686',
  },
  receiptMetaVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#131b2e',
  },
  invoiceNoHighlight: {
    color: '#004ac6',
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f3fa',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableCol: {
    fontSize: 11,
    fontWeight: '700',
    color: '#434655',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(195,198,215,0.2)',
  },
  tableColText: {
    fontSize: 11,
    color: '#131b2e',
  },
  tableColItem: {
    flex: 2.2,
  },
  tableColQty: {
    flex: 0.7,
    textAlign: 'center',
  },
  tableColRate: {
    flex: 1.1,
    textAlign: 'right',
  },
  tableColAmt: {
    flex: 1.2,
    textAlign: 'right',
    fontWeight: '600',
  },
  billSummaryBox: {
    paddingVertical: 4,
    gap: 4,
  },
  billSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billSummaryLabel: {
    fontSize: 12,
    color: '#434655',
  },
  billSummaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#131b2e',
  },
  billGrandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#131b2e',
    paddingTop: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  billGrandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#131b2e',
  },
  billGrandTotalVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#004ac6',
  },
  receiptFooterNote: {
    fontSize: 10,
    color: '#737686',
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  receiptActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  receiptPrintBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6edff',
    height: 42,
    borderRadius: 8,
    gap: 6,
  },
  receiptPrintText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#004ac6',
  },
  receiptShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e6faee',
    height: 42,
    borderRadius: 8,
    gap: 6,
  },
  receiptShareText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#006329',
  },
  receiptNewSaleBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004ac6',
    height: 42,
    borderRadius: 8,
    gap: 6,
  },
  receiptNewSaleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
