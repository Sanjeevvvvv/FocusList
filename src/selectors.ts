import type { Task, TaskStats, FilterStatus, FilterPriority } from './types/task';

export interface TaskFilters {
  searchQuery: string;
  status: FilterStatus;
  priority: FilterPriority;
}

export interface StatusCounts {
  all: number;
  active: number;
  completed: number;
}

/**
 * Pure selector: composes search + status + priority against one shared
 * task array. No component may inline this logic — every consumer
 * (App, tests) calls this single source of truth instead.
 */
export function selectVisibleTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch = query === '' || task.title.toLowerCase().includes(query);

    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'active' && !task.completed) ||
      (filters.status === 'completed' && task.completed);

    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

/** Pure selector: derives Total/Completed/Pending stats from the task array. */
export function computeStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, pending, percentComplete };
}

/** Pure selector: per-status counts used by the filter tabs' live badges. */
export function computeStatusCounts(tasks: Task[]): StatusCounts {
  return {
    all: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  };
}
