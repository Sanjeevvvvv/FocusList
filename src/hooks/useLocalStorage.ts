import { useState, useEffect, useCallback } from 'react';

export function readLocalStorageValue<T>(
  key: string,
  initialValue: T | (() => T),
  validator?: (data: unknown) => data is T
): T {
  const resolveInitial = () => (initialValue instanceof Function ? initialValue() : initialValue);

  if (typeof window === 'undefined') return resolveInitial();

  try {
    const item = window.localStorage.getItem(key);
    if (!item) return resolveInitial();

    const parsed: unknown = JSON.parse(item);
    if (validator) return validator(parsed) ? parsed : resolveInitial();
    return parsed as T;
  } catch {
    return resolveInitial();
  }
}

export function writeLocalStorageValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage access can fail in private browsing or after quota is exceeded.
  }
}

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
  const [storedValue, setStoredValue] = useState<T>(() =>
    readLocalStorageValue(key, initialValue, validator)
  );

  // State updater that handles functional updates and persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((current) => {
        const nextValue = value instanceof Function ? value(current) : value;
        writeLocalStorageValue(key, nextValue);
        return nextValue;
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
