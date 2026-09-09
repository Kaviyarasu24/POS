import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { LogBox } from 'react-native';
import { useEffect } from 'react';
import { store } from '@/constants/store';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Android Push notifications (remote notifications) functionality provided by expo-notifications was removed',
]);

// Public routes that should never trigger a redirect loop.
const PUBLIC_ROUTES = ['index', 'login', 'signup'];

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  // ─── Fix 3: Global auth guard ────────────────────────────────────────────
  // Subscribes at the root level so every screen — including non-tab stack
  // screens (transactions, reports, customers) — is protected. When
  // handleUnauthorized() fires notify() from the store (e.g. a 401 response),
  // this listener immediately routes back to /login.
  useEffect(() => {
    const checkAuth = () => {
      const currentRoute = segments[segments.length - 1] ?? '';
      const isPublic = PUBLIC_ROUTES.includes(currentRoute);
      if (!isPublic && !store.currentUser?.token) {
        router.replace('/login');
      }
    };
    const unsubscribe = store.subscribe(checkAuth);
    return unsubscribe;
  }, [router, segments]);

  // The app is designed for a single light appearance, so we always use the
  // light navigation theme regardless of the OS setting. Locking this here
  // (together with userInterfaceStyle: "light" in app.json) keeps system-provided
  // surfaces — and the status bar icons below — consistent across devices.
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="scanner" options={{ presentation: 'modal' }} />
          <Stack.Screen name="add_product" options={{ presentation: 'modal' }} />
          <Stack.Screen name="transactions" />
          <Stack.Screen name="reports" />
          <Stack.Screen name="customers" />
        </Stack>
        {/* Dark icons for the app's light backgrounds. */}
        <StatusBar style="dark" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
