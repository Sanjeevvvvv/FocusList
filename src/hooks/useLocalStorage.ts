import { useState, useEffect, useCallback } from 'react';

/**
 * Resilient localStorage hook with lazy initializer, schema fallback, and error boundary handling.
 * Gracefully handles private browsing restrictions, quota exceeded errors, and corrupted JSON.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T),
  validator?: (data: unknown) => data is T
): [T, (value: T | ((prev: T) => T)) => void] {
  const resolveInitial = useCallback((): T => {
    return initialValue instanceof Function ? initialValue() : initialValue;
  }, [initialValue]);

  // Read initial stored value safely
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue instanceof Function ? initialValue() : initialValue;
      }
      const parsed: unknown = JSON.parse(item);
      if (validator) {
        return validator(parsed) ? parsed : (initialValue instanceof Function ? initialValue() : initialValue);
      }
      return parsed as T;
    } catch {
      // Storage access blocked or invalid JSON; fallback gracefully
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  // State updater that handles functional updates and persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((current) => {
        try {
          const nextValue = value instanceof Function ? value(current) : value;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(nextValue));
          }
          return nextValue;
        } catch {
          // In case quota is exceeded or storage is disabled, return nextValue in memory
          return value instanceof Function ? value(current) : value;
        }
      });
    },
    [key]
  );

  // Synchronize state if another tab modifies the same localStorage key
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const parsed: unknown = JSON.parse(e.newValue);
          if (validator) {
            if (validator(parsed)) {
              setStoredValue(parsed);
            }
          } else {
            setStoredValue(parsed as T);
          }
        } catch {
          // Ignore invalid external storage updates
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, validator, resolveInitial]);

  return [storedValue, setValue];
}
