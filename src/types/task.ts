export type Priority = 'high' | 'medium' | 'low';

export type FilterStatus = 'all' | 'active' | 'completed';

export type FilterPriority = 'all' | Priority;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  percentComplete: number;
}

export interface TaskFilterState {
  searchQuery: string;
  status: FilterStatus;
  priority: FilterPriority;
}
