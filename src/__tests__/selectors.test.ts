import { describe, it, expect } from 'vitest';
import { selectVisibleTasks, computeStats, computeStatusCounts } from '../selectors';
import type { Task } from '../types/task';

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? Math.random().toString(36),
    title: 'Task',
    completed: false,
    priority: 'medium',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

const tasks: Task[] = [
  buildTask({ id: '1', title: 'Buy groceries', completed: false, priority: 'high' }),
  buildTask({ id: '2', title: 'Write report', completed: true, priority: 'medium' }),
  buildTask({ id: '3', title: 'Book flight', completed: false, priority: 'low' }),
];

describe('selectVisibleTasks', () => {
  it('returns all tasks when filters are all-default', () => {
    const result = selectVisibleTasks(tasks, { searchQuery: '', status: 'all', priority: 'all' });
    expect(result).toHaveLength(3);
  });

  it('filters by case-insensitive search substring', () => {
    const result = selectVisibleTasks(tasks, { searchQuery: 'BOOK', status: 'all', priority: 'all' });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('3');
  });

  it('filters by status', () => {
    const active = selectVisibleTasks(tasks, { searchQuery: '', status: 'active', priority: 'all' });
    const completed = selectVisibleTasks(tasks, { searchQuery: '', status: 'completed', priority: 'all' });
    expect(active).toHaveLength(2);
    expect(completed).toHaveLength(1);
  });

  it('filters by priority', () => {
    const result = selectVisibleTasks(tasks, { searchQuery: '', status: 'all', priority: 'high' });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('1');
  });

  it('composes search + status + priority together', () => {
    const result = selectVisibleTasks(tasks, {
      searchQuery: 'flight',
      status: 'active',
      priority: 'low',
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('3');
  });
});

describe('computeStats', () => {
  it('computes total/completed/pending/percent correctly', () => {
    const stats = computeStats(tasks);
    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
    expect(stats.pending).toBe(2);
    expect(stats.percentComplete).toBe(33);
  });

  it('handles an empty task list without dividing by zero', () => {
    const stats = computeStats([]);
    expect(stats).toEqual({ total: 0, completed: 0, pending: 0, percentComplete: 0 });
  });
});

describe('computeStatusCounts', () => {
  it('counts all/active/completed independently of current filters', () => {
    const counts = computeStatusCounts(tasks);
    expect(counts).toEqual({ all: 3, active: 2, completed: 1 });
  });
});
