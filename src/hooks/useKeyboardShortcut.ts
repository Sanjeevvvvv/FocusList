import { useEffect } from 'react';

interface UseKeyboardShortcutOptions {
  key: string;
  onKeyDown: (event: KeyboardEvent) => void;
  ignoreWhenInputFocused?: boolean;
}

/**
 * Hook to bind a global keyboard hotkey safely with input context awareness.
 */
export function useKeyboardShortcut({
  key,
  onKeyDown,
  ignoreWhenInputFocused = true,
}: UseKeyboardShortcutOptions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if focus is inside an interactive input/editable element
      const target = event.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (ignoreWhenInputFocused && isInputFocused) {
        return;
      }

      if (event.key.toLowerCase() === key.toLowerCase() && !event.ctrlKey && !event.metaKey && !event.altKey) {
        onKeyDown(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, onKeyDown, ignoreWhenInputFocused]);
}
