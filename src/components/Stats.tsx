import React from 'react';
import type { TaskStats } from '../types/task';

interface StatsProps {
  stats: TaskStats;
}

export const Stats: React.FC<StatsProps> = React.memo(({ stats }) => {
  const { total, completed, pending, percentComplete } = stats;
  const isAllComplete = total > 0 && pending === 0;

  return (
    <section
      className="stats-container"
      aria-label="Task Statistics"
      data-testid="stats-section"
    >
      <dl className="stats-grid">
        <div className="stat-card stat-card--total">
          <dt className="stat-label">Total</dt>
          <dd className="stat-value" data-testid="stat-total">{total}</dd>
        </div>

        <div className={`stat-card stat-card--completed ${isAllComplete ? 'stat-card--all-done' : ''}`}>
          <dt className="stat-label">Completed</dt>
          <dd className="stat-value" data-testid="stat-completed">{completed}</dd>
        </div>

        <div className="stat-card stat-card--pending">
          <dt className="stat-label">Pending</dt>
          <dd className="stat-value" data-testid="stat-pending">{pending}</dd>
        </div>
      </dl>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-title">Completion Rate</span>
          <span className="progress-percent">{percentComplete}%</span>
        </div>
        <div
          className="progress-bar-track"
          role="progressbar"
          aria-valuenow={percentComplete}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Task progress: ${percentComplete}% completed`}
          data-testid="progress-bar"
        >
          <div
            className={`progress-bar-fill ${isAllComplete ? 'progress-bar-fill--complete' : ''}`}
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    </section>
  );
});

Stats.displayName = 'Stats';
