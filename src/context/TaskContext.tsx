import type { ReactNode } from 'react';
import { useTaskManager } from '../hooks/useTaskManager';
import { TaskContext } from './taskContextInstance';

/**
 * Provides task state and mutation actions to the component tree.
 * Owns exactly one instance of useTaskManager (and therefore one
 * reducer + one localStorage-backed source of truth) — every consumer
 * reads/dispatches through this context instead of receiving tasks via
 * deep prop drilling.
 */
export function TaskProvider({ children }: { children: ReactNode }) {
  const value = useTaskManager();
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}
