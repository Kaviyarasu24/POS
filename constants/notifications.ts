import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Present low-stock alerts as a banner even while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Structural type kept local so this module doesn't import from store.ts
// (which imports this file — importing back would create a cycle).
type StockItem = { id: string; name: string; stock: number; lowStockAlert: number };

const LOW_STOCK_CHANNEL = 'low-stock';

// Cache the permission handshake so we only run it once per app session.
let permissionReady: Promise<boolean> | null = null;

// Product ids already alerted this session, so a repeated catalog sync doesn't
// re-notify. An item that gets restocked above its threshold is removed here so
// it can alert again if it later runs low.
const notified = new Set<string>();

async function ensurePermission(): Promise<boolean> {
  // expo-notifications local notifications are Android/iOS only.
  if (Platform.OS === 'web') return false;
  if (!permissionReady) {
    permissionReady = (async () => {
      try {
        // Android 13+ needs a channel to exist before the prompt will appear.
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(LOW_STOCK_CHANNEL, {
            name: 'Low stock alerts',
            importance: Notifications.AndroidImportance.DEFAULT,
          });
        }
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') return true;
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      } catch (e) {
        console.warn('Notification permission setup failed:', e);
        return false;
      }
    })();
  }
  return permissionReady;
}

/**
 * Fire a single local notification for any products that have *newly* dropped
 * to/below their low-stock threshold. Safe to call after every catalog sync;
 * it dedupes per session and no-ops on web or when permission is denied.
 */
export async function notifyLowStockIfNeeded(products: StockItem[]): Promise<void> {
  try {
    // Anything restocked above its threshold becomes eligible to alert again.
    products.forEach((p) => {
      if (p.stock > p.lowStockAlert) notified.delete(p.id);
    });

    const fresh = products.filter((p) => p.stock <= p.lowStockAlert && !notified.has(p.id));
    if (fresh.length === 0) return;

    const granted = await ensurePermission();
    if (!granted) return;

    fresh.forEach((p) => notified.add(p.id));

    const title =
      fresh.length === 1 ? `Low stock: ${fresh[0].name}` : `${fresh.length} items low on stock`;
    const names = fresh
      .slice(0, 5)
      .map((p) => (p.stock <= 0 ? `${p.name} — out of stock` : `${p.name} — ${p.stock} left`));
    const body = names.join('\n') + (fresh.length > 5 ? `\n+${fresh.length - 5} more` : '');

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // present immediately
    });
  } catch (e) {
    console.warn('Low-stock notification failed:', e);
  }
}
