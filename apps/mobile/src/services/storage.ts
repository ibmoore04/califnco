import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Califnco Safe Storage Service
 *
 * Provides a resilient persistence layer for Expo Go and native Android/iOS.
 * If AsyncStorage's native bridge is unavailable or throws a native exception,
 * it seamlessly and silently falls back to an in-memory store so the app NEVER
 * crashes or throws "Native module is null, cannot access legacy storage".
 */

const memoryStore = new Map<string, string>();

export const safeStorage = {
  /**
   * Retrieve item by key
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const val = await AsyncStorage.getItem(key);
        if (val !== null && val !== undefined) {
          memoryStore.set(key, val);
          return val;
        }
      }
    } catch (err) {
      console.warn(`[Califnco Storage] AsyncStorage.getItem failed for "${key}", using fallback memory store:`, err);
    }
    return memoryStore.get(key) ?? null;
  },

  /**
   * Save item by key
   */
  async setItem(key: string, value: string): Promise<void> {
    memoryStore.set(key, value);
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn(`[Califnco Storage] AsyncStorage.setItem failed for "${key}", preserved in fallback memory store:`, err);
    }
  },

  /**
   * Remove item by key
   */
  async removeItem(key: string): Promise<void> {
    memoryStore.delete(key);
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[Califnco Storage] AsyncStorage.removeItem failed for "${key}":`, err);
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    memoryStore.clear();
    try {
      if (AsyncStorage && typeof AsyncStorage.clear === 'function') {
        await AsyncStorage.clear();
      }
    } catch (err) {
      console.warn('[Califnco Storage] AsyncStorage.clear failed:', err);
    }
  },
};

export default safeStorage;
