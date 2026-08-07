import { Platform } from 'react-native';

// For local physical device testing, replace this with your computer's local IP address (e.g. 'http://192.168.1.3:8000')
export const API_BASE_URL = Platform.select({
  ios: 'http://127.0.0.1:8000',
  android: 'http://10.0.2.2:8000',
  default: 'http://127.0.0.1:8000',
});
