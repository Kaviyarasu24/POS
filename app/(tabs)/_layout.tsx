import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette } from '@/constants/theme';
import { store } from '@/constants/store';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ─── Fix 2: Auth guard with immediate mount check ────────────────────────
  // The root _layout.tsx handles the reactive (notify-driven) redirect for all
  // screens. This useEffect adds an *immediate* check on mount so the tab UI
  // never flashes for a split second before the first notify fires.
  useEffect(() => {
    // Immediate check: if the token is already gone when the tabs mount, bail
    // straight to /login without waiting for the next store notification.
    if (!store.currentUser?.token) {
      router.replace('/login');
      return;
    }
    // Reactive check: keep watching for mid-session expiry / logout events.
    const checkAuth = () => {
      if (!store.currentUser?.token) {
        router.replace('/login');
      }
    };
    const unsubscribe = store.subscribe(checkAuth);
    return unsubscribe;
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Palette.primary,
        tabBarInactiveTintColor: Palette.textTertiary,
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          backgroundColor: Palette.surface,
          borderTopWidth: 1,
          borderTopColor: Palette.surfaceMuted,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="dashboard" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="billing"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="point-of-sale" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="inventory" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="reorder" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
