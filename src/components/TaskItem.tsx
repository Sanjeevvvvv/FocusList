import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Task } from '../types/task';
import { PRIORITY_LABELS } from '../constants/tasks';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string, newTitle: string) => boolean;
  onDeleteTask: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = React.memo(
  ({ task, onToggleComplete, onEditTask, onDeleteTask }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editError, setEditError] = useState<string | null>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setEditTitle(task.title);
    }, [task.title]);

    useEffect(() => {
      if (isEditing && editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, [isEditing]);

    const handleStartEdit = useCallback(() => {
      setEditTitle(task.title);
      setEditError(null);
      setIsEditing(true);
    }, [task.title]);

    const handleCancelEdit = useCallback(() => {
      setEditTitle(task.title);
      setEditError(null);
      setIsEditing(false);
    }, [task.title]);

    const handleCommitEdit = useCallback(() => {
      const trimmed = editTitle.trim();
      if (!trimmed) {
        setEditError('Title cannot be empty');
        editInputRef.current?.focus();
        return;
      }

      if (trimmed === task.title) {
        setIsEditing(false);
        setEditError(null);
        return;
      }

      const success = onEditTask(task.id, trimmed);
      if (success) {
        setIsEditing(false);
        setEditError(null);
      } else {
        setEditError('Invalid title');
        editInputRef.current?.focus();
      }
    }, [editTitle, task.title, task.id, onEditTask]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCommitEdit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelEdit();
        }
      },
      [handleCommitEdit, handleCancelEdit]
    );

    const handleCheckboxChange = useCallback(() => {
      onToggleComplete(task.id);
    }, [task.id, onToggleComplete]);

    const handleDelete = useCallback(() => {
      onDeleteTask(task.id);
    }, [task.id, onDeleteTask]);

    const priorityLabel = PRIORITY_LABELS[task.priority] ?? 'Medium';

    return (
      <li
        data-testid="task-item"
        className={`task-item task-item--priority-${task.priority} ${
          task.completed ? 'task-item--completed' : ''
        }`}
      >
        <div className="task-item-main">
          {/* Accessible Checkbox */}
          <label className="checkbox-container" htmlFor={`checkbox-${task.id}`}>
            <input
              id={`checkbox-${task.id}`}
              data-testid="task-checkbox"
              type="checkbox"
              checked={task.completed}
              onChange={handleCheckboxChange}
              className="checkbox-input sr-only"
              aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
            />
            <span className="checkbox-custom" aria-hidden="true">
              <svg
                className="checkbox-check-icon"
                viewBox="0 0 12 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1.5 6 4.5 9 10.5 1" />
              </svg>
            </span>
          </label>

          {/* Title or Inline Edit */}
          <div className="task-content">
            {isEditing ? (
              <div className="inline-edit-wrapper">
                <input
                  ref={editInputRef}
                  data-testid="task-edit-input"
                  type="text"
                  value={editTitle}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    if (editError) setEditError(null);
                  }}
                  onBlur={handleCommitEdit}
                  onKeyDown={handleKeyDown}
                  className={`inline-edit-input ${editError ? 'inline-edit-input--error' : ''}`}
                  aria-label="Edit task title"
                  aria-invalid={Boolean(editError)}
                  maxLength={200}
                />
                {editError && (
                  <span className="inline-edit-error" role="alert">
                    {editError}
                  </span>
                )}
                <span className="inline-edit-tip">
                  Press <kbd>Enter</kbd> to save, <kbd>Esc</kbd> to cancel
                </span>
              </div>
            ) : (
              <span
                data-testid="task-title"
                className="task-title"
                onDoubleClick={handleStartEdit}
                title="Double click to edit title"
              >
                {task.title}
              </span>
            )}
          </div>

          {/* Priority Badge */}
          <div className="task-meta">
            <span
              data-testid="task-priority-badge"
              className={`priority-badge priority-badge--${task.priority}`}
              aria-label={`${priorityLabel} Priority`}
            >
              {priorityLabel}
            </span>
          </div>

          {/* Actions */}
          <div className="task-actions" role="toolbar" aria-label="Task actions">
            {!isEditing && (
              <button
                type="button"
                data-testid="task-edit-btn"
                onClick={handleStartEdit}
                className="btn-icon-action btn-icon-action--edit"
                aria-label={`Edit task "${task.title}"`}
                title="Edit task (or double click)"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}

            <button
              type="button"
              data-testid="task-delete-btn"
              onClick={handleDelete}
              className="btn-icon-action btn-icon-action--delete"
              aria-label={`Delete task "${task.title}"`}
              title="Delete task"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </li>
    );
  }
);

TaskItem.displayName = 'TaskItem';
