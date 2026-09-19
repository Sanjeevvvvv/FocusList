import React from 'react';

export const CompletionBadge: React.FC = () => (
  <div className="status-pill status-pill--complete" role="status">
    <span className="celebrate-emoji" aria-hidden="true">
      🎉
    </span>
    <span>All Done!</span>
  </div>
);
