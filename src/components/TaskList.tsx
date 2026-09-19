import React from 'react';
import type { Task } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  totalTasksCount: number;
  completedCount: number;
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string, newTitle: string) => boolean;
  onDeleteTask: (id: string) => void;
  onClearCompleted: () => void;
  onResetFilters: () => void;
}

export const TaskList: React.FC<TaskListProps> = React.memo(
  ({
    tasks,
    totalTasksCount,
    completedCount,
    onToggleComplete,
    onEditTask,
    onDeleteTask,
    onClearCompleted,
    onResetFilters,
  }) => {
    // Empty workspace state
    if (totalTasksCount === 0) {
      return (
        <section className="task-list-section" aria-label="Tasks List">
          <div className="empty-state empty-state--workspace" data-testid="empty-state">
            <div className="empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h2 className="empty-state-title">No tasks in your list</h2>
            <p className="empty-state-desc">
              Your focus list is clear! Type a task title above or press <kbd className="kbd">/</kbd> to begin.
            </p>
          </div>
        </section>
      );
    }

    // Filter results empty state
    if (tasks.length === 0) {
      return (
        <section className="task-list-section" aria-label="Tasks List">
          <div className="empty-state empty-state--filtered" data-testid="empty-state-filtered">
            <div className="empty-state-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="empty-state-title">No matching tasks found</h2>
            <p className="empty-state-desc">
              None of your tasks match the active search query or filter combination.
            </p>
            <button
              type="button"
              data-testid="reset-filters-empty-btn"
              onClick={onResetFilters}
              className="btn btn--secondary reset-btn-empty"
            >
              Clear All Filters
            </button>
          </div>
        </section>
      );
    }

    return (
      <section className="task-list-section" aria-label="Tasks List">
        <div className="task-list-header">
          <h2 className="task-list-title">
            Tasks <span className="task-count-badge">{tasks.length}</span>
          </h2>

          {completedCount > 0 && (
            <button
              type="button"
              data-testid="clear-completed-btn"
              onClick={onClearCompleted}
              className="btn btn--text clear-completed-btn"
              aria-label={`Clear ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}`}
            >
              Clear Completed ({completedCount})
            </button>
          )}
        </div>

        <ul className="task-list" role="list" data-testid="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </ul>
      </section>
    );
  }
);

TaskList.displayName = 'TaskList';
