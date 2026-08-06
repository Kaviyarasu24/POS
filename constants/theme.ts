/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#004ac6'; // primary
const tintColorDark = '#6366f1';

export const Colors = {
  light: {
    text: '#131b2e', // on-surface
    textSecondary: '#434655', // on-surface-variant
    background: '#faf8ff', // surface / background
    cardBackground: '#ffffff', // surface-container-lowest
    border: '#c3c6d7', // outline-variant
    tint: '#2563eb', // primary-container
    icon: '#434655', // on-surface-variant
    tabIconDefault: '#737686', // outline
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    background: '#0b0f19',
    cardBackground: '#111827',
    border: '#1e293b',
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
