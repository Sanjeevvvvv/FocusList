import React, { useState, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import type { Priority } from '../types/task';
import { DEFAULT_PRIORITY } from '../constants/tasks';

export interface TaskFormHandle {
  focusInput: () => void;
}

interface TaskFormProps {
  onAddTask: (title: string, priority: Priority) => boolean;
}

export const TaskForm = forwardRef<TaskFormHandle, TaskFormProps>(
  ({ onAddTask }, ref) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },
    }));

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      if (errorMessage) {
        setErrorMessage(null);
      }
    }, [errorMessage]);

    const handlePriorityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      setPriority(e.target.value as Priority);
    }, []);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
          setErrorMessage('Task title cannot be empty.');
          inputRef.current?.focus();
          return;
        }

        const success = onAddTask(trimmedTitle, priority);
        if (success) {
          setTitle('');
          setPriority(DEFAULT_PRIORITY);
          setErrorMessage(null);
        }
      },
      [title, priority, onAddTask]
    );

    const hasError = Boolean(errorMessage);

    return (
      <form
        className="task-form"
        onSubmit={handleSubmit}
        noValidate
        data-testid="task-form"
      >
        <div className="task-form-row">
          <div className="input-group">
            <label htmlFor="task-title-input" className="input-label">
              Task Title
            </label>
            <div className="input-wrapper">
              <input
                ref={inputRef}
                id="task-title-input"
                data-testid="task-input"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="What do you want to accomplish? (Press / to focus)"
                className={`text-input ${hasError ? 'text-input--invalid' : ''}`}
                aria-invalid={hasError}
                aria-describedby={hasError ? 'task-title-error' : undefined}
                autoComplete="off"
                maxLength={200}
              />
            </div>
          </div>

          <div className="priority-group">
            <label htmlFor="task-priority-select" className="input-label">
              Priority
            </label>
            <div className="select-wrapper">
              <select
                id="task-priority-select"
                data-testid="task-priority-select"
                value={priority}
                onChange={handlePriorityChange}
                className={`priority-select priority-select--${priority}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="submit-group">
            <button
              type="submit"
              data-testid="add-task-btn"
              className="btn btn--primary submit-btn"
            >
              <svg
                className="btn-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {hasError && (
          <div
            id="task-title-error"
            data-testid="task-form-error"
            className="form-error-msg"
            role="alert"
          >
            <svg
              className="error-icon"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}
      </form>
    );
  }
);

TaskForm.displayName = 'TaskForm';
