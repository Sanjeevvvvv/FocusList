import type { Task, Priority, FilterStatus, FilterPriority } from '../types/task';

export const PRIMARY_STORAGE_KEY = 'focuslist_tasks';
export const FALLBACK_STORAGE_KEY = 'tasks';
export const THEME_STORAGE_KEY = 'focuslist_theme';

export const DEFAULT_PRIORITY: Priority = 'medium';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review project architecture and requirements',
    completed: true,
    priority: 'high',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3600000,
  },
  {
    id: 'task-2',
    title: 'Explore keyboard shortcuts: press / to add task',
    completed: false,
    priority: 'medium',
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'task-3',
    title: 'Try inline editing: double-click any task title',
    completed: false,
    priority: 'low',
    createdAt: Date.now() - 900000,
    updatedAt: Date.now() - 900000,
  },
];

export const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export const PRIORITY_OPTIONS: { value: FilterPriority; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
