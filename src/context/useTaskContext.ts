import { useContext } from 'react';
import { TaskContext, type TaskManagerValue } from './taskContextInstance';

export function useTaskContext(): TaskManagerValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTaskContext must be used within a <TaskProvider>');
  }
  return ctx;
}
