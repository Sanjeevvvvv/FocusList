import React, { lazy, Suspense } from 'react';

const CompletionBadge = lazy(() => import('./CompletionBadge').then(({ CompletionBadge }) => ({ default: CompletionBadge })));

interface HeaderProps {
  totalTasks: number;
  completedTasks: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(
  ({ totalTasks, completedTasks, theme, onToggleTheme }) => {
    const isAllComplete = totalTasks > 0 && completedTasks === totalTasks;

    return (
      <header className="app-header" data-testid="app-header">
        <div className="header-brand">
          <div className="logo-badge" aria-hidden="true">
            <svg
              className="logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className="header-titles">
            <h1 className="app-title">FocusList</h1>
            <p className="app-subtitle">Distraction-free, keyboard-first task manager</p>
          </div>
        </div>

        <div className="header-meta">
          <button
            type="button"
            data-testid="theme-toggle-btn"
            onClick={onToggleTheme}
            className="theme-toggle-btn"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="theme-icon">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="theme-icon">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <div className="shortcut-pill" title="Press / anywhere to focus task input">
            <kbd className="kbd">/</kbd>
            <span>to add task</span>
          </div>

          {isAllComplete && (
            <Suspense fallback={null}>
              <CompletionBadge />
            </Suspense>
          )}
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';
