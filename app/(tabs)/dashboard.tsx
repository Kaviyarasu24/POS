import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.outerContainer}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton}>
          <MaterialIcons name="menu" size={24} color="#004ac6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SmartPOS</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push('/scanner')}
          >
            <MaterialIcons name="qr-code-scanner" size={24} color="#004ac6" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIconButton, styles.notificationBtn]}>
            <MaterialIcons name="notifications" size={24} color="#004ac6" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContainer}>
          {/* Summary Bento Grid */}
          <View style={styles.bentoGrid}>
            <View style={[styles.bentoCard, styles.salesCard]}>
              <Text style={styles.bentoLabel}>Today's Sales</Text>
              <Text style={styles.salesValue}>$4,289.50</Text>
              <View style={styles.trendContainer}>
                <MaterialIcons name="trending-up" size={16} color="#006329" />
                <Text style={styles.trendText}>+12.5% vs yesterday</Text>
              </View>
            </View>

            <View style={styles.bentoRow}>
              <View style={[styles.bentoCard, styles.halfCard]}>
                <Text style={styles.bentoLabel}>Orders</Text>
                <Text style={styles.bentoValue}>142</Text>
              </View>
              <View style={[styles.bentoCard, styles.halfCard]}>
                <Text style={styles.bentoLabel}>Profit</Text>
                <Text style={styles.bentoValue}>$1,104</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionLabel}>Quick Actions</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.actionsScroll}
            >
              <TouchableOpacity style={[styles.actionButton, styles.primaryActionButton]}>
                <MaterialIcons name="point-of-sale" size={24} color="#ffffff" style={styles.actionIcon} />
                <Text style={styles.primaryActionText}>New Sale</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="add-box" size={24} color="#131b2e" style={styles.actionIcon} />
                <Text style={styles.actionText}>Add Product</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <MaterialIcons name="inventory" size={24} color="#131b2e" style={styles.actionIcon} />
                <Text style={styles.actionText}>Stock Entry</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Low Stock Alerts Card */}
          <View style={styles.alertsCard}>
            <View style={styles.alertsHeader}>
              <View style={styles.alertsTitleContainer}>
                <MaterialIcons name="warning" size={20} color="#ba1a1a" />
                <Text style={styles.alertsTitle}>Low Stock Alerts</Text>
              </View>
              <View style={styles.alertsBadge}>
                <Text style={styles.alertsBadgeText}>3 Items</Text>
              </View>
            </View>

            <View style={styles.alertList}>
              <View style={styles.alertItem}>
                <Text style={styles.alertItemName}>Artisan Coffee Beans</Text>
                <Text style={styles.alertItemQty}>2 left</Text>
              </View>
              <View style={styles.alertItem}>
                <Text style={styles.alertItemName}>Organic Oat Milk</Text>
                <Text style={styles.alertItemQty}>5 left</Text>
              </View>
              <View style={[styles.alertItem, styles.lastAlertItem]}>
                <Text style={styles.alertItemName}>Reusable Cups</Text>
                <Text style={styles.alertItemQty}>8 left</Text>
              </View>
            </View>
          </View>

          {/* Revenue Trend Card */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Revenue Trend</Text>
            <View style={styles.chartContainer}>
              <Svg width="100%" height="100%" viewBox="0 0 350 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <Defs>
                  <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#2563eb" stopOpacity="0.25" />
                    <Stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                {/* Area under the line */}
                <Path
                  d="M 0 68 L 58.3 62 L 116.7 54 L 175 64 L 233.3 48 L 291.7 26 L 350 28 L 350 120 L 0 120 Z"
                  fill="url(#chartGrad)"
                />
                {/* Line Path */}
                <Path
                  d="M 0 68 L 58.3 62 L 116.7 54 L 175 64 L 233.3 48 L 291.7 26 L 350 28"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                />
              </Svg>
            </View>
            <View style={styles.chartLabelsRow}>
              <Text style={styles.chartLabel}>Mon</Text>
              <Text style={styles.chartLabel}>Tue</Text>
              <Text style={styles.chartLabel}>Wed</Text>
              <Text style={styles.chartLabel}>Thu</Text>
              <Text style={styles.chartLabel}>Fri</Text>
              <Text style={styles.chartLabel}>Sat</Text>
              <Text style={styles.chartLabel}>Sun</Text>
            </View>
          </View>

          {/* Recent Transactions Section */}
          <View style={styles.transactionsCard}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.transactionsTitle}>Recent Transactions</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllLink}>See All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transactionList}>
              <View style={styles.transactionItem}>
                <View style={styles.transactionIconContainer}>
                  <MaterialIcons name="receipt-long" size={20} color="#434655" />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionOrder}>Order #4921</Text>
                  <Text style={styles.transactionTime}>10:42 AM • 3 items</Text>
                </View>
                <Text style={styles.transactionAmount}>$24.50</Text>
              </View>

              <View style={styles.transactionItem}>
                <View style={styles.transactionIconContainer}>
                  <MaterialIcons name="receipt-long" size={20} color="#434655" />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionOrder}>Order #4920</Text>
                  <Text style={styles.transactionTime}>10:15 AM • 1 item</Text>
                </View>
                <Text style={styles.transactionAmount}>$4.50</Text>
              </View>

              <View style={[styles.transactionItem, styles.lastTransactionItem]}>
                <View style={styles.transactionIconContainer}>
                  <MaterialIcons name="receipt-long" size={20} color="#434655" />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionOrder}>Order #4919</Text>
                  <Text style={styles.transactionTime}>09:58 AM • 5 items</Text>
                </View>
                <Text style={styles.transactionAmount}>$42.00</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#faf8ff',
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  header: {
    height: 64,
    backgroundColor: 'rgba(250, 248, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f3ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  notificationBtn: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: '#ba1a1a',
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004ac6',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 130, // Safe padding so all content remains visible and clear of the FAB
  },
  mainContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: 16, // Consistent spacing matching bentoGrid gap (16px)
  },
  bentoGrid: {
    width: '100%',
    gap: 16,
  },
  bentoCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 12,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  salesCard: {
    width: '100%',
  },
  bentoLabel: {
    fontSize: 14,
    color: '#434655',
    marginBottom: 4,
    fontWeight: '500',
  },
  salesValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#004ac6',
    letterSpacing: -0.5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  trendText: {
    fontSize: 14,
    color: '#006329',
    fontWeight: '500',
    marginLeft: 4,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  halfCard: {
    flex: 1,
  },
  bentoValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#131b2e',
  },
  actionsSection: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#434655',
    fontWeight: '500',
    marginBottom: 8,
    paddingLeft: 4,
  },
  actionsScroll: {
    gap: 16,
    paddingBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eaedff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.5)',
    paddingHorizontal: 16,
  },
  primaryActionButton: {
    backgroundColor: '#004ac6',
    borderColor: '#004ac6',
    shadowColor: 'rgba(37,99,235,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
  actionIcon: {
    marginRight: 6,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
  },
  alertsCard: {
    width: '100%',
    backgroundColor: 'rgba(250,218,214,0.3)',
    borderWidth: 1,
    borderColor: '#ffdad6',
    borderRadius: 12,
    padding: 16,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  alertsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ba1a1a',
  },
  alertsBadge: {
    backgroundColor: '#ba1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  alertsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  alertList: {
    width: '100%',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,218,214,0.5)',
    paddingVertical: 8,
  },
  lastAlertItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  alertItemName: {
    fontSize: 16,
    color: '#131b2e',
  },
  alertItemQty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ba1a1a',
  },
  chartCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 12,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131b2e',
    marginBottom: 16,
  },
  chartContainer: {
    width: '100%',
    height: 120,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  chartLabel: {
    fontSize: 12,
    color: '#737686',
  },
  transactionsCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(195,198,215,0.3)',
    borderRadius: 12,
    padding: 16,
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131b2e',
  },
  seeAllLink: {
    fontSize: 14,
    color: '#004ac6',
    fontWeight: '600',
  },
  transactionList: {
    width: '100%',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f3ff',
  },
  lastTransactionItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dae2fd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionOrder: {
    fontSize: 14,
    fontWeight: '600',
    color: '#131b2e',
  },
  transactionTime: {
    fontSize: 12,
    color: '#434655',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#131b2e',
  },
  fab: {
    position: 'absolute',
    bottom: 24, // Positioned 24px above bottom navigation bar
    right: 24,  // 24px margin from right screen edge
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#004ac6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(37,99,235,0.4)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
    zIndex: 999,
  },
});
