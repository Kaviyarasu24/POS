import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [coffeeQty, setCoffeeQty] = useState(1);
  const [dripperQty, setDripperQty] = useState(1);

  // Animation for the scanning laser line
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 240,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const totalItems = (coffeeQty > 0 ? coffeeQty : 0) + (dripperQty > 0 ? dripperQty : 0);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    // Basic scanner simulation trigger
    alert(`Scanned Barcode: ${data}`);
  };

  const renderCameraView = () => {
    // If permission is not granted or we are on Web/Simulator, render simulated camera background
    if (!permission?.granted || Platform.OS === 'web') {
      return (
        <View style={styles.simulatedCameraContainer}>
          <Image
            source="https://lh3.googleusercontent.com/aida-public/AB6AXuAPOUvDOKaK81hCABlsg5y5SlL9vARP47Xr_jxEh3--ahaORPeZgVkKc349TJX6OW65d1-1QB2qvTmk0963wx2vQbt3RkODToh8SofzzhlRXCll94Ywu3tA6wYpMTB5vVLNRW0saHupr53HsWGrnXPMda3lXsL9tQqkF5_F036yxxxlBi53D4m8j1w3jaZlrGJqnzxtw7nIOnXZH6uUUfRs8tR9XhxR65JTUHMO0H-X8JtEzpYBlcjleA"
            style={styles.simulatedImage}
            contentFit="cover"
          />
          {!permission?.granted && Platform.OS !== 'web' && (
            <TouchableOpacity style={styles.permissionRequestBtn} onPress={requestPermission}>
              <Text style={styles.permissionRequestText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'upc_a'],
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Viewfinder background */}
      <View style={styles.viewfinderContainer}>
        {renderCameraView()}

        {/* Viewfinder Target Framing */}
        <View style={styles.overlayContainer}>
          <View style={styles.targetFrame}>
            {/* Corner Brackets */}
            <View style={[styles.cornerBracket, styles.topLeftCorner]} />
            <View style={[styles.cornerBracket, styles.topRightCorner]} />
            <View style={[styles.cornerBracket, styles.bottomLeftCorner]} />
            <View style={[styles.cornerBracket, styles.bottomRightCorner]} />

            {/* Laser Line */}
            <Animated.View style={[styles.scanLine, { top: scanLineAnim }]} />
          </View>
          <Text style={styles.alignmentLabel}>Align barcode within frame</Text>
        </View>
      </View>

      {/* Top Header App Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          aria-label="Back"
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Item</Text>
        <TouchableOpacity
          aria-label="Flashlight toggle"
          style={[styles.headerButton, torch && styles.flashlightOn]}
          onPress={() => setTorch(!torch)}
        >
          <MaterialIcons
            name={torch ? 'flashlight-on' : 'flashlight-off'}
            size={24}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Scanned List Drawer Card */}
      <View style={styles.drawerCard}>
        {/* Drag Handle Illustration */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.drawerContent}>
          <Text style={styles.drawerTitle}>Recently Scanned</Text>

          <ScrollView style={styles.scannedList} showsVerticalScrollIndicator={false}>
            {/* Item 1: Coffee Beans */}
            {coffeeQty > 0 && (
              <View style={styles.scannedItem}>
                <View style={styles.itemIconContainer}>
                  <MaterialIcons name="inventory" size={20} color="#434655" />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    Premium Organic Coffee Beans 1lb
                  </Text>
                  <Text style={styles.itemSku}>SKU: 8901234567</Text>
                </View>
                <View style={styles.itemActions}>
                  <Text style={styles.itemPrice}>${(14.99 * coffeeQty).toFixed(2)}</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setCoffeeQty(Math.max(0, coffeeQty - 1))}
                    >
                      <MaterialIcons name="remove" size={14} color="#434655" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{coffeeQty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => setCoffeeQty(coffeeQty + 1)}>
                      <MaterialIcons name="add" size={14} color="#434655" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Item 2: Ceramic Dripper */}
            {dripperQty > 0 && (
              <View style={styles.scannedItem}>
                <View style={styles.itemIconContainer}>
                  <MaterialIcons name="inventory" size={20} color="#434655" />
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    Ceramic Pour-Over Dripper
                  </Text>
                  <Text style={styles.itemSku}>SKU: 8901234568</Text>
                </View>
                <View style={styles.itemActions}>
                  <Text style={styles.itemPrice}>${(22.5 * dripperQty).toFixed(2)}</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setDripperQty(Math.max(0, dripperQty - 1))}
                    >
                      <MaterialIcons name="remove" size={14} color="#434655" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{dripperQty}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => setDripperQty(dripperQty + 1)}
                    >
                      <MaterialIcons name="add" size={14} color="#434655" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => alert('Manual barcode input dialog is under development.')}
            >
              <MaterialIcons name="keyboard" size={20} color="#131b2e" />
              <Text style={styles.secondaryBtnText}>Manual Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
              <MaterialIcons name="check-circle" size={20} color="#ffffff" />
              <Text style={styles.primaryBtnText}>Done ({totalItems})</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  viewfinderContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  simulatedCameraContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulatedImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  permissionRequestBtn: {
    backgroundColor: '#004ac6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 5,
  },
  permissionRequestText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  targetFrame: {
    width: 240,
    height: 240,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    position: 'relative',
  },
  cornerBracket: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#004ac6',
  },
  topLeftCorner: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRightCorner: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeftCorner: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRightCorner: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ba1a1a',
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  alignmentLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashlightOn: {
    backgroundColor: '#004ac6',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  drawerCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(250,248,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    zIndex: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 48,
    height: 6,
    backgroundColor: '#c3c6d7',
    borderRadius: 3,
  },
  drawerContent: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 16,
  },
  scannedList: {
    maxHeight: SCREEN_HEIGHT * 0.25,
    marginBottom: 16,
  },
  scannedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#faf8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#131b2e',
  },
  itemSku: {
    fontSize: 12,
    color: '#434655',
    marginTop: 2,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eaedff',
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#131b2e',
    marginHorizontal: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(195,198,215,0.3)',
    paddingTop: 16,
  },
  secondaryBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#737686',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#004ac6',
    borderRadius: 8,
    shadowColor: 'rgba(37,99,235,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
