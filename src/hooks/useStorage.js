import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';

export function useStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadStoredValue() {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null) {
          setStoredValue(JSON.parse(value));
        } else {
          // Check localStorage as fallback/migration
          const localVal = localStorage.getItem(key);
          if (localVal !== null) {
            setStoredValue(JSON.parse(localVal));
            await Preferences.set({ key, value: localVal });
          }
        }
      } catch (error) {
        console.error(`Error reading key "${key}" from Preferences:`, error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadStoredValue();
  }, [key]);

  const setValue = useCallback((value) => {
    setStoredValue((currentValue) => {
      const valueToStore = typeof value === 'function' ? value(currentValue) : value;

      // Save asynchronously to Preferences
      Preferences.set({ key, value: JSON.stringify(valueToStore) })
        .catch(err => console.error(`Error writing key "${key}" to Preferences:`, err));

      // Also write to localStorage for fallback
      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (e) {
        console.error("Error saving to localStorage fallback:", e);
      }

      return valueToStore;
    });
  }, [key]);

  return [storedValue, setValue, isLoaded];
}

// Synchronous loading for dashboard fallback
export function getSyncStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}
