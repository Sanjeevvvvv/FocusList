import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTaskManager } from '../hooks/useTaskManager';
import { PRIMARY_STORAGE_KEY } from '../constants/tasks';

describe('useTaskManager', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('initializes with default tasks and calculates statistics correctly', () => {
    const { result } = renderHook(() => useTaskManager());
    expect(result.current.tasks.length).toBeGreaterThan(0);
    expect(result.current.stats.total).toBe(result.current.tasks.length);
    expect(result.current.stats.pending + result.current.stats.completed).toBe(result.current.stats.total);
  });

  it('adds a new task with given priority', () => {
    const { result } = renderHook(() => useTaskManager());
    const initialCount = result.current.tasks.length;

    act(() => {
      const added = result.current.addTask('Write unit tests', 'high');
      expect(added).toBe(true);
    });

    expect(result.current.tasks.length).toBe(initialCount + 1);
    expect(result.current.tasks[0]?.title).toBe('Write unit tests');
    expect(result.current.tasks[0]?.priority).toBe('high');
    expect(result.current.tasks[0]?.completed).toBe(false);
  });

  it('disallows adding whitespace-only or empty task titles', () => {
    const { result } = renderHook(() => useTaskManager());
    const initialCount = result.current.tasks.length;

    act(() => {
      const added = result.current.addTask('   ', 'medium');
      expect(added).toBe(false);
    });

    expect(result.current.tasks.length).toBe(initialCount);
  });

  it('toggles task completion and updates stats', () => {
    const { result } = renderHook(() => useTaskManager());
    const target = result.current.tasks[0];
    if (!target) throw new Error('No task');

    const initialCompleted = target.completed;
    act(() => {
      result.current.toggleComplete(target.id);
    });

    const updated = result.current.tasks.find((t) => t.id === target.id);
    expect(updated?.completed).toBe(!initialCompleted);
  });

  it('edits an existing task title', () => {
    const { result } = renderHook(() => useTaskManager());
    const target = result.current.tasks[0];
    if (!target) throw new Error('No task');

    act(() => {
      const edited = result.current.editTask(target.id, 'Renamed task title');
      expect(edited).toBe(true);
    });

    const updated = result.current.tasks.find((t) => t.id === target.id);
    expect(updated?.title).toBe('Renamed task title');
  });

  it('deletes a task by id', () => {
    const { result } = renderHook(() => useTaskManager());
    const initialCount = result.current.tasks.length;
    const target = result.current.tasks[0];
    if (!target) throw new Error('No task');

    act(() => {
      result.current.deleteTask(target.id);
    });

    expect(result.current.tasks.length).toBe(initialCount - 1);
    expect(result.current.tasks.some((t) => t.id === target.id)).toBe(false);
  });

  it('clears all completed tasks', () => {
    const { result } = renderHook(() => useTaskManager());
    act(() => {
      result.current.clearCompleted();
    });

    expect(result.current.tasks.every((t) => !t.completed)).toBe(true);
    expect(result.current.stats.completed).toBe(0);
  });

  it('persists changes to primary localStorage key', () => {
    const { result } = renderHook(() => useTaskManager());
    act(() => {
      result.current.addTask('Persistence check', 'low');
    });

    const stored = window.localStorage.getItem(PRIMARY_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(stored).toContain('Persistence check');
  });
});
