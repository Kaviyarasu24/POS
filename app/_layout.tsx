import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Android Push notifications (remote notifications) functionality provided by expo-notifications was removed',
]);

export default function RootLayout() {
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
