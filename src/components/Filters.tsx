import React, { useCallback } from 'react';
import type { FilterStatus, FilterPriority } from '../types/task';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants/tasks';

interface FiltersProps {
  searchQuery: string;
  status: FilterStatus;
  priority: FilterPriority;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: FilterStatus) => void;
  onPriorityChange: (priority: FilterPriority) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
  totalTasksCount: number;
  statusCounts: {
    all: number;
    active: number;
    completed: number;
  };
}

export const Filters: React.FC<FiltersProps> = React.memo(
  ({
    searchQuery,
    status,
    priority,
    onSearchChange,
    onStatusChange,
    onPriorityChange,
    onResetFilters,
    totalFilteredCount,
    totalTasksCount,
    statusCounts,
  }) => {
    const isFiltered = searchQuery.trim().length > 0 || status !== 'all' || priority !== 'all';

    const handleSearchInput = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearchChange(e.target.value);
      },
      [onSearchChange]
    );

    const handleClearSearch = useCallback(() => {
      onSearchChange('');
    }, [onSearchChange]);

    const handlePrioritySelect = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        onPriorityChange(e.target.value as FilterPriority);
      },
      [onPriorityChange]
    );

    return (
      <section
        className="filters-section"
        aria-label="Task Filters and Search"
        data-testid="filters-section"
      >
        <div className="filters-row">
          {/* Search bar */}
          <div className="search-box">
            <label htmlFor="task-search-input" className="sr-only">
              Search tasks by title
            </label>
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                id="task-search-input"
                data-testid="search-input"
                type="search"
                value={searchQuery}
                onChange={handleSearchInput}
                placeholder="Search tasks..."
                className="search-input"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  data-testid="search-clear-btn"
                  onClick={handleClearSearch}
                  className="search-clear-btn"
                  aria-label="Clear search input"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Segmented Buttons */}
          <div className="filter-group" role="group" aria-label="Filter tasks by completion status">
            <span className="filter-group-label" id="status-filter-label">Status:</span>
            <div className="segmented-control" aria-labelledby="status-filter-label">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = status === opt.value;
                const count = statusCounts[opt.value];
                return (
                  <button
                    key={opt.value}
                    type="button"
                    data-testid={`filter-status-${opt.value}`}
                    onClick={() => onStatusChange(opt.value)}
                    className={`segmented-btn ${isActive ? 'segmented-btn--active' : ''}`}
                    aria-pressed={isActive}
                  >
                    <span>{opt.label}</span>
                    <span className="segmented-count">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="priority-filter-group">
            <label htmlFor="priority-filter-select" className="filter-group-label">
              Priority:
            </label>
            <div className="select-wrapper select-wrapper--compact">
              <select
                id="priority-filter-select"
                data-testid="filter-priority-select"
                value={priority}
                onChange={handlePrioritySelect}
                className="priority-filter-select"
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter State summary & Reset */}
        <div className="filters-summary">
          <span className="results-count" aria-live="polite">
            Showing <strong>{totalFilteredCount}</strong> of <strong>{totalTasksCount}</strong> tasks
          </span>
          {isFiltered && (
            <button
              type="button"
              data-testid="reset-filters-btn"
              onClick={onResetFilters}
              className="btn btn--text reset-filters-btn"
              aria-label="Reset all search queries and active filters"
            >
              Reset Filters
            </button>
          )}
        </div>
      </section>
    );
  }
);

Filters.displayName = 'Filters';
