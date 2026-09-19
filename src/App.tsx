import React, { useState, useMemo, useCallback, useRef, useDeferredValue, useEffect } from 'react';
import type { FilterStatus, FilterPriority } from './types/task';
import { TaskProvider } from './context/TaskContext';
import { useTaskContext } from './context/useTaskContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useKeyboardShortcut } from './hooks/useKeyboardShortcut';
import { THEME_STORAGE_KEY } from './constants/tasks';
import { selectVisibleTasks, computeStatusCounts } from './selectors';
import { Header } from './components/Header';
import { Stats } from './components/Stats';
import { TaskForm, type TaskFormHandle } from './components/TaskForm';
import { Filters } from './components/Filters';
import { TaskList } from './components/TaskList';
import { LiveAnnouncer } from './components/LiveAnnouncer';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppShell() {
  const {
    tasks,
    stats,
    announcement,
    setAnnouncement,
    addTask,
    toggleComplete,
    editTask,
    deleteTask,
    clearCompleted,
  } = useTaskContext();

  // Filter state — owned here because it's view-local (URL/session concern),
  // not domain state, so it stays out of TaskContext.
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');

  // React 18 Concurrency: Defer search filter computation so keystrokes remain instantaneous
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Theme Management (Light / Dark)
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(
    THEME_STORAGE_KEY,
    () => {
      if (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'dark';
      }
      return 'light';
    }
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  // Form input ref for hotkey focus
  const formRef = useRef<TaskFormHandle>(null);

  // Global hotkey: Press '/' to focus the task input
  useKeyboardShortcut({
    key: '/',
    onKeyDown: (e) => {
      e.preventDefault();
      formRef.current?.focusInput();
    },
    ignoreWhenInputFocused: true,
  });

  // Status counts for filter tabs — pure selector, single source of truth.
  const statusCounts = useMemo(() => computeStatusCounts(tasks), [tasks]);

  // Filtered tasks — pure selector, single source of truth. All three
  // filters (search/status/priority) compose against the same array;
  // no component inlines this logic itself.
  const filteredTasks = useMemo(
    () =>
      selectVisibleTasks(tasks, {
        searchQuery: deferredSearchQuery,
        status: statusFilter,
        priority: priorityFilter,
      }),
    [tasks, deferredSearchQuery, statusFilter, priorityFilter]
  );

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setAnnouncement('All filters and search reset.');
  }, [setAnnouncement]);

  return (
    <div className="app-shell" data-testid="app-root">
      <LiveAnnouncer message={announcement} />

      <main className="app-main" id="main-content">
        <div className="app-card">
          <Header
            totalTasks={stats.total}
            completedTasks={stats.completed}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />

          <Stats stats={stats} />

          <TaskForm ref={formRef} onAddTask={addTask} />

          <Filters
            searchQuery={searchQuery}
            status={statusFilter}
            priority={priorityFilter}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
            onPriorityChange={setPriorityFilter}
            onResetFilters={handleResetFilters}
            totalFilteredCount={filteredTasks.length}
            totalTasksCount={tasks.length}
            statusCounts={statusCounts}
          />

          <TaskList
            tasks={filteredTasks}
            totalTasksCount={tasks.length}
            completedCount={stats.completed}
            onToggleComplete={toggleComplete}
            onEditTask={editTask}
            onDeleteTask={deleteTask}
            onClearCompleted={clearCompleted}
            onResetFilters={handleResetFilters}
          />
        </div>
      </main>
    </div>
  );
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <TaskProvider>
        <AppShell />
      </TaskProvider>
    </ErrorBoundary>
  );
};

export default App;
