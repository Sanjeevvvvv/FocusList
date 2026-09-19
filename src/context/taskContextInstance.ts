import { createContext } from 'react';
import type { useTaskManager } from '../hooks/useTaskManager';

export type TaskManagerValue = ReturnType<typeof useTaskManager>;

export const TaskContext = createContext<TaskManagerValue | null>(null);
