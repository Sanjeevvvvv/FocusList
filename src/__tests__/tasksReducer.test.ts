import { describe, it, expect } from 'vitest';
import { tasksReducer, makeAddAction } from '../state/tasksReducer';
import type { Task } from '../types/task';

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 't1',
    title: 'Sample task',
    completed: false,
    priority: 'medium',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe('tasksReducer', () => {
  it('ADD prepends the new task and does not mutate the input array', () => {
    const initial = [buildTask({ id: 'existing' })];
    const action = makeAddAction('New task', 'high', () => 'new-id');

    const next = tasksReducer(initial, action);

    expect(next).toHaveLength(2);
    expect(next[0]?.id).toBe('new-id');
    expect(next[0]?.title).toBe('New task');
    expect(initial).toHaveLength(1); // original untouched
  });

  it('TOGGLE flips only the matching task', () => {
    const initial = [buildTask({ id: 'a', completed: false }), buildTask({ id: 'b', completed: false })];

    const next = tasksReducer(initial, { type: 'TOGGLE', payload: { id: 'a' } });

    expect(next.find((t) => t.id === 'a')?.completed).toBe(true);
    expect(next.find((t) => t.id === 'b')?.completed).toBe(false);
  });

  it('EDIT updates only the matching task title', () => {
    const initial = [buildTask({ id: 'a', title: 'Old' })];

    const next = tasksReducer(initial, { type: 'EDIT', payload: { id: 'a', title: 'New' } });

    expect(next[0]?.title).toBe('New');
  });

  it('DELETE removes only the matching task', () => {
    const initial = [buildTask({ id: 'a' }), buildTask({ id: 'b' })];

    const next = tasksReducer(initial, { type: 'DELETE', payload: { id: 'a' } });

    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe('b');
  });

  it('CLEAR_COMPLETED keeps only incomplete tasks', () => {
    const initial = [
      buildTask({ id: 'a', completed: true }),
      buildTask({ id: 'b', completed: false }),
    ];

    const next = tasksReducer(initial, { type: 'CLEAR_COMPLETED' });

    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe('b');
  });

  it('unknown action types return the state unchanged', () => {
    const initial = [buildTask()];
    // @ts-expect-error intentionally invalid action for the default branch
    const next = tasksReducer(initial, { type: 'NOT_REAL' });

    expect(next).toBe(initial);
  });
});
