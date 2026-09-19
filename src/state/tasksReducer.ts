import type { Task, Priority } from '../types/task';

export type TaskAction =
  | { type: 'HYDRATE'; payload: Task[] }
  | { type: 'ADD'; payload: Task }
  | { type: 'TOGGLE'; payload: { id: string } }
  | { type: 'EDIT'; payload: { id: string; title: string } }
  | { type: 'DELETE'; payload: { id: string } }
  | { type: 'CLEAR_COMPLETED' }
  | { type: 'IMPORT'; payload: Task[] };

/**
 * Pure reducer for all task-array mutations. Never mutates its input —
 * every branch returns a new array/object. Kept dependency-free and
 * side-effect-free so it can be unit tested in isolation from React,
 * localStorage, or timers.
 */
export function tasksReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'HYDRATE':
    case 'IMPORT':
      return action.payload;

    case 'ADD':
      return [action.payload, ...state];

    case 'TOGGLE':
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, completed: !task.completed, updatedAt: Date.now() }
          : task
      );

    case 'EDIT':
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, title: action.payload.title, updatedAt: Date.now() }
          : task
      );

    case 'DELETE':
      return state.filter((task) => task.id !== action.payload.id);

    case 'CLEAR_COMPLETED':
      return state.filter((task) => !task.completed);

    default:
      return state;
  }
}

export function makeAddAction(
  title: string,
  priority: Priority,
  generateId: () => string
): TaskAction {
  const now = Date.now();
  return {
    type: 'ADD',
    payload: {
      id: generateId(),
      title,
      completed: false,
      priority,
      createdAt: now,
      updatedAt: now,
    },
  };
}
