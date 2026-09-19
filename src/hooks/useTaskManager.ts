import { useState, useCallback } from 'react';
import type { Task, Priority } from '../types/task';
import { useLocalStorage } from './useLocalStorage';
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
  const [tasks, setTasks] = useLocalStorage<Task[]>(
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

  const [announcement, setAnnouncement] = useState<string>('');

  const stats = computeStats(tasks);

  const addTask = useCallback(
    (title: string, priority: Priority): boolean => {
      const trimmed = title.trim();
      if (!trimmed) return false;

      const action = makeAddAction(trimmed, priority, generateId);
      setTasks((prev) => tasksReducer(prev, action));
      setAnnouncement(`Task "${trimmed}" added with ${priority} priority.`);
      return true;
    },
    [setTasks]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        if (target) {
          setAnnouncement(
            `Task "${target.title}" marked as ${target.completed ? 'incomplete' : 'completed'}.`
          );
        }
        return tasksReducer(prev, { type: 'TOGGLE', payload: { id } });
      });
    },
    [setTasks]
  );

  const editTask = useCallback(
    (id: string, newTitle: string): boolean => {
      const trimmed = newTitle.trim();
      if (!trimmed) return false;

      setTasks((prev) => tasksReducer(prev, { type: 'EDIT', payload: { id, title: trimmed } }));
      setAnnouncement(`Task updated to "${trimmed}".`);
      return true;
    },
    [setTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const target = prev.find((t) => t.id === id);
        setAnnouncement(`Task "${target?.title ?? 'Task'}" deleted.`);
        return tasksReducer(prev, { type: 'DELETE', payload: { id } });
      });
    },
    [setTasks]
  );

  const clearCompleted = useCallback(() => {
    setTasks((prev) => {
      const completedCount = prev.filter((t) => t.completed).length;
      if (completedCount === 0) return prev;
      setAnnouncement(`Cleared ${completedCount} completed tasks.`);
      return tasksReducer(prev, { type: 'CLEAR_COMPLETED' });
    });
  }, [setTasks]);

  const importTasks = useCallback(
    (incoming: Task[]) => {
      if (isTaskArray(incoming)) {
        setTasks((prev) => tasksReducer(prev, { type: 'IMPORT', payload: incoming }));
        setAnnouncement(`Imported ${incoming.length} tasks successfully.`);
        return true;
      }
      return false;
    },
    [setTasks]
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
