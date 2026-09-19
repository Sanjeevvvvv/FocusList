import { useCallback, useEffect, useReducer, useState } from 'react';
import type { Task, Priority } from '../types/task';
import { readLocalStorageValue, writeLocalStorageValue } from './useLocalStorage';
import { PRIMARY_STORAGE_KEY, FALLBACK_STORAGE_KEY, INITIAL_TASKS } from '../constants/tasks';
import { tasksReducer, makeAddAction } from '../state/tasksReducer';
import { computeStats } from '../selectors';

function isTask(item: unknown): item is Task {
  if (typeof item !== 'object' || item === null) return false;
  const record = item as Record<string, unknown>;
  const priority = record['priority'];
  return (
    typeof record['id'] === 'string' &&
    typeof record['title'] === 'string' &&
    typeof record['completed'] === 'boolean' &&
    (priority === 'high' || priority === 'medium' || priority === 'low')
  );
}

export function isTaskArray(data: unknown): data is Task[] {
  if (!Array.isArray(data)) return false;
  return data.every((item: unknown): item is Task => isTask(item));
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Custom hook that owns task state. All mutations are expressed as
 * TaskAction objects and applied through the pure `tasksReducer` — this
 * hook is the only place that wires that reducer to persistence
 * (localStorage) and to React re-renders; the reducer itself has zero
 * knowledge of either.
 */
export function useTaskManager() {
  const initialTasks = readLocalStorageValue<Task[]>(
    PRIMARY_STORAGE_KEY,
    () => {
      if (typeof window !== 'undefined') {
        try {
          const fallback = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
          if (fallback) {
            const parsed: unknown = JSON.parse(fallback);
            if (isTaskArray(parsed)) return parsed;
          }
        } catch {
          // Ignore
        }
      }
      return INITIAL_TASKS;
    },
    isTaskArray
  );
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  useEffect(() => {
    writeLocalStorageValue(PRIMARY_STORAGE_KEY, tasks);
  }, [tasks]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== PRIMARY_STORAGE_KEY || event.newValue === null) return;

      try {
        const parsed: unknown = JSON.parse(event.newValue);
        if (isTaskArray(parsed)) {
          dispatch({ type: 'HYDRATE', payload: parsed });
        }
      } catch {
        // Ignore invalid external storage updates.
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [announcement, setAnnouncement] = useState<string>('');

  const stats = computeStats(tasks);

  const addTask = useCallback(
    (title: string, priority: Priority): boolean => {
      const trimmed = title.trim();
      if (!trimmed) return false;

      const action = makeAddAction(trimmed, priority, generateId);
      dispatch(action);
      setAnnouncement(`Task "${trimmed}" added with ${priority} priority.`);
      return true;
    },
    []
  );

  const toggleComplete = useCallback(
    (id: string) => {
      const target = tasks.find((t) => t.id === id);
      if (target) {
        setAnnouncement(
          `Task "${target.title}" marked as ${target.completed ? 'incomplete' : 'completed'}.`
        );
      }
      dispatch({ type: 'TOGGLE', payload: { id } });
    },
    [tasks]
  );

  const editTask = useCallback(
    (id: string, newTitle: string): boolean => {
      const trimmed = newTitle.trim();
      if (!trimmed) return false;

      dispatch({ type: 'EDIT', payload: { id, title: trimmed } });
      setAnnouncement(`Task updated to "${trimmed}".`);
      return true;
    },
    []
  );

  const deleteTask = useCallback(
    (id: string) => {
      const target = tasks.find((t) => t.id === id);
      setAnnouncement(`Task "${target?.title ?? 'Task'}" deleted.`);
      dispatch({ type: 'DELETE', payload: { id } });
    },
    [tasks]
  );

  const clearCompleted = useCallback(() => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount === 0) return;
    setAnnouncement(`Cleared ${completedCount} completed tasks.`);
    dispatch({ type: 'CLEAR_COMPLETED' });
  }, [tasks]);

  const importTasks = useCallback(
    (incoming: Task[]) => {
      if (isTaskArray(incoming)) {
        dispatch({ type: 'IMPORT', payload: incoming });
        setAnnouncement(`Imported ${incoming.length} tasks successfully.`);
        return true;
      }
      return false;
    },
    []
  );

  return {
    tasks,
    stats,
    announcement,
    setAnnouncement,
    addTask,
    toggleComplete,
    editTask,
    deleteTask,
    clearCompleted,
    importTasks,
  };
}
