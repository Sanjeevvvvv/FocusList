import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with default value if storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('updates state and persists to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test_key', 'initial'));
    act(() => {
      result.current[1]('updated');
    });
    expect(result.current[0]).toBe('updated');
    expect(window.localStorage.getItem('test_key')).toBe(JSON.stringify('updated'));
  });

  it('supports functional state updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem('counter')).toBe('1');
  });

  it('falls back to initial value when stored data is malformed', () => {
    window.localStorage.setItem('corrupt_key', '{not-json');
    const { result } = renderHook(() => useLocalStorage('corrupt_key', 'safe_fallback'));
    expect(result.current[0]).toBe('safe_fallback');
  });

  it('validates data using validator function if provided', () => {
    window.localStorage.setItem('valid_key', JSON.stringify({ count: 'not-a-number' }));
    const validator = (data: unknown): data is { count: number } =>
      typeof data === 'object' && data !== null && typeof (data as { count: unknown }).count === 'number';

    const { result } = renderHook(() =>
      useLocalStorage('valid_key', { count: 0 }, validator)
    );
    expect(result.current[0]).toEqual({ count: 0 });
  });
});
