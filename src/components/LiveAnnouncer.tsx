import React from 'react';

interface LiveAnnouncerProps {
  message: string;
}

/**
 * Visually hidden ARIA live region to announce important user actions
 * to screen readers without cluttering visual layout.
 */
export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = React.memo(({ message }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
});

LiveAnnouncer.displayName = 'LiveAnnouncer';
