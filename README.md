# FocusList — Production-Grade To-Do Application

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-32%20passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

FocusList is a high-performance, distraction-free, keyboard-first task management application built with **React 18**, **TypeScript (Strict Mode)**, **Vite**, and **bespoke hand-written CSS** using CSS custom properties. It features zero external CSS frameworks, zero runtime libraries, zero backend or network dependencies, and relies solely on client-side browser persistence via `localStorage`.

---

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 18 (function components + hooks) |
| Language | TypeScript, strict mode |
| Build | Vite 5 |
| Styling | Hand-written CSS, custom properties, no framework |
| State | `useReducer` + Context API, pure selectors |
| Testing | Vitest + React Testing Library |
| Persistence | Browser `localStorage` |
| Deployment | Vercel (static SPA) |

## Table of Contents
1. [Target Persona & Vertical](#1-target-persona--vertical)
2. [Architecture & State Model](#2-architecture--state-model)
3. [LocalStorage Engineering & Resilience](#3-localstorage-engineering--resilience)
4. [Step-by-Step Usage Instructions](#4-step-by-step-usage-instructions)
5. [Keyboard Navigation & Shortcuts](#5-keyboard-navigation--shortcuts)
6. [Explicit Assumptions & Design Decisions](#6-explicit-assumptions--design-decisions)
7. [Innovations, Accessibility & Responsive Polish](#7-innovations-accessibility--responsive-polish)
8. [Automated Testing, Verification & Deployment](#8-automated-testing-verification--deployment)
9. [Project Structure](#9-project-structure)
10. [Contributing](#10-contributing)
11. [License](#11-license)

---

## 1. Target Persona & Vertical

**Vertical**: Personal productivity and daily task triage for knowledge workers, software engineers, students, and accessibility-conscious professionals.

**Target Persona**: **"The High-Velocity Maker"**
- Needs to capture, organize, and triage tasks rapidly without lifting their hands from the keyboard.
- Frustrated by sluggish, bloated tools (e.g. Jira, Notion) that require cloud authentication, spin up loading spinners, or break when offline.
- Demands 100% data privacy: tasks must remain strictly inside the local browser sandbox.
- Relies on full keyboard navigation, crisp visual contrast in both light and dark modes, screen reader live announcements, and reliable offline persistence.

---

## 2. Architecture & State Model

FocusList follows strict single-responsibility component boundaries, separation of concerns, and unidirectional data flow.

```
ErrorBoundary (Top-level render fault tolerance)
 └── App.tsx (Layout & filter orchestration)
      ├── LiveAnnouncer (Visually hidden aria-live="polite" region for screen readers)
      ├── Header (Brand, completion status, theme toggle, keyboard hint)
      ├── Stats (Live semantic <dl> metrics: Total, Completed, Pending + Progress Bar)
      ├── TaskForm (Imperative focus handle, validation, priority selector)
      ├── Filters (Composed search with useDeferredValue, status buttons with live counts, priority dropdown)
      ├── TaskList (Semantic <ul>, empty states, "Clear completed" action)
      │    └── TaskItem (Custom animated checkbox, priority badge & accent stripe, inline edit, delete)
      └── context/TaskProvider (wraps useTaskManager, exposes it via useTaskContext)
           └── hooks/
                ├── useTaskManager (dispatches TaskAction objects into tasksReducer, persists via useLocalStorage)
                ├── useLocalStorage (Resilient Web Storage wrapper with schema validation & fallback)
                └── useKeyboardShortcut (Context-aware global hotkey listeners)
```

### State Model: Reducer + Context + Selectors
- **`state/tasksReducer.ts`**: The single source of truth for every task mutation. A pure function `tasksReducer(state, action)` with explicit action types (`ADD`, `TOGGLE`, `EDIT`, `DELETE`, `CLEAR_COMPLETED`, `IMPORT`, `HYDRATE`). Never mutates its input, has zero dependency on React, localStorage, or timers — fully unit-testable in isolation (see `__tests__/tasksReducer.test.ts`).
- **`hooks/useTaskManager.ts`**: The only place that wires the pure reducer to persistence. Every mutation method (`addTask`, `toggleComplete`, etc.) builds a `TaskAction` and applies it via `setTasks(prev => tasksReducer(prev, action))`, so writes to `localStorage` and the reducer's logic stay decoupled.
- **`context/TaskContext.tsx` + `useTaskContext.ts`**: `TaskProvider` owns the single `useTaskManager()` instance for the whole tree; `AppShell` and any future component read/dispatch through `useTaskContext()` instead of receiving tasks via prop drilling.
- **`selectors.ts`**: Pure, exported, unit-tested functions — `selectVisibleTasks(tasks, filters)` and `computeStats(tasks)` / `computeStatusCounts(tasks)`. `App.tsx` calls these; no component inlines filter/stat logic itself.
- **Filter Composition**: `searchQuery`, `statusFilter`, and `priorityFilter` are view-local state owned in `App.tsx` (not domain state, so they stay out of `TaskContext`) and passed into `selectVisibleTasks`, which composes all three against the master task array in one pass. Zero out-of-sync states or split sources of truth.
- **Performance Optimization**:
  - `useDeferredValue(searchQuery)`: Employs React 18 concurrent rendering so keystrokes remain instantaneous even during live filtering.
  - `useMemo`: Caches derived filtered lists and statistics.
  - `useCallback`: Wraps all action handlers passed to children.
  - `React.memo`: Wraps `TaskItem` and controls to prevent re-rendering unaffected items.
  - `content-visibility: auto`: Applied to list items for accelerated layout rendering.
  - Rollup vendor code-splitting: `react` and `react-dom` are isolated into a distinct cacheable bundle (`vendor-*.js`).

---

## 3. LocalStorage Engineering & Resilience

The custom hook [`useLocalStorage<T>`](src/hooks/useLocalStorage.ts) handles real-world browser storage failure modes:

1. **Schema Validation & Type Safety**:
   Accepts an optional runtime type guard (`validator?: (data: unknown) => data is T`). If stored JSON does not match the strict `Task[]` schema (due to manual tampering or older versions), it automatically falls back to safe initial values instead of crashing the React tree.
2. **Graceful Quota & Permission Degradation**:
   In private browsing modes (e.g. Safari Private Window) or when storage quota is exceeded (`QuotaExceededError`), `localStorage.setItem` throws. The hook catches this gracefully, falling back to reliable in-memory state.
3. **Cross-Tab Synchronization**:
   Listens to the `window` storage event to automatically keep multiple open tabs or windows in sync when tasks are updated.
4. **Hydration & SSR Safety**:
   Checks `typeof window !== 'undefined'` before invoking Web Storage APIs.

---

## 4. Step-by-Step Usage Instructions

### Adding a Task
1. Press `/` anywhere in the app (or click into the "Task Title" input).
2. Type your task title (e.g., `"Deploy FocusList to Vercel"`).
3. Select priority: **High**, **Medium**, or **Low** (defaults to Medium).
4. Press `Enter` or click **Add Task**.
   - *Validation*: Empty submissions and whitespace-only entries are blocked with an immediate inline error message and accessible `aria-invalid` notice.

### Marking Complete / Incomplete
- Click the custom checkbox on the left of any task, or focus it with `Tab` and press `Space`.
- Completed tasks display a clean strikethrough, dimmed contrast, and an animated green checkmark.

### Inline Editing
1. **Double-click** the task title text, or click the **Edit** button (pencil icon).
2. The title switches to an inline text field, pre-selected and focused.
3. Edit the title and press `Enter` (or click outside/blur) to save changes.
4. Press `Escape` at any time to discard changes and exit edit mode.

### Deleting a Task
- Click the **Delete** button (trash icon) on any task item. The item is removed and a screen reader announcement confirms deletion.

### Filtering and Searching
- **Live Search**: Type into the search input to instantly filter tasks by title (case-insensitive, concurrent non-blocking).
- **Status Filter**: Click `All`, `Active`, or `Completed` segmented buttons. Live task counts (`All (3)`, `Active (2)`, `Completed (1)`) update dynamically.
- **Priority Filter**: Select `All`, `High`, `Medium`, or `Low` from the priority dropdown.
- **Combined Filters**: All three filters compose simultaneously against the same dataset.
- **Resetting**: When filters are active, click the **Reset Filters** button or clear the search input with the `×` button.

### Batch Clearing Completed Tasks
- When one or more tasks are completed, the **"Clear Completed (n)"** button appears in the task list header. Clicking it purges all completed tasks in one click.

### Light & Dark Theme Toggle
- Click the theme toggle icon in the header (Sun/Moon) to switch between Light and Dark modes. The choice is preserved in `localStorage` and respects system preferences by default.

---

## 5. Keyboard Navigation & Shortcuts

FocusList is 100% operable without a mouse:

| Shortcut / Key | Context | Action |
|---|---|---|
| `/` | Anywhere (outside inputs) | Immediately jump focus to the Add Task title input |
| `Tab` / `Shift + Tab` | Global | Navigate linearly through all interactive elements |
| `Enter` | Add Task Form | Submit new task |
| `Enter` | Inline Edit Mode | Commit changes and exit edit mode |
| `Escape` | Inline Edit Mode | Discard edits and restore previous title |
| `Space` | Checkbox / Segmented Buttons | Toggle task status or select filter |
| `Escape` | Search Input | Clear query / blur search |

---

## 6. Explicit Assumptions & Design Decisions

1. **Client-Side Storage Only**:
   Data is retained within the user's browser `localStorage` under the key `focuslist_tasks` (with fallback to `tasks`). No network requests or remote database sync occur.
2. **Single-User Workspace**:
   Each browser profile acts as an isolated task workspace.
3. **Duplicate Titles Permitted**:
   Users can create tasks with identical titles (e.g. daily habits, subtasks) without conflict because each task receives a unique `crypto.randomUUID()` identifier.
4. **Zero CSS Frameworks**:
   All CSS is crafted by hand using CSS custom properties (`--color-primary`, `--space-*`, `--radius-*`, etc.) in modular stylesheets to keep the final bundle under 150KB and ensure zero external dependency bloat.
5. **Color Contrast Compliance**:
   All text elements and priority badges meet or exceed WCAG 2.1 AA requirements (>= 4.5:1 for body and badge text in both light and dark themes).
6. **Accessible Touch Targets**:
   All interactive controls (buttons, checkboxes, inputs) meet or exceed the 44px by 44px minimum touch target size for mobile devices.

---

## 7. Innovations, Accessibility & Responsive Polish

Beyond the bare spec, FocusList incorporates:

1. **Light & Dark Theme Toggle**:
   Full dark mode support with tailored color palettes, verified contrast ratios, and persistence.
2. **React 18 Concurrent Search**:
   Uses `useDeferredValue` for smooth, non-blocking filtering on every keystroke.
3. **Global Hotkey & Keybinding Pill**:
   Users can press `/` at any time to focus the creation input, indicated by a `<kbd>/</kbd>` badge.
4. **Priority Left-Border Accent System**:
   In addition to accessible color pill badges, each task card features a distinct 4px left-border accent stripe (Red for High, Amber for Medium, Blue for Low).
5. **Status Filter Badges with Live Counts**:
   Segmented controls show live item counts (`All (3)`, `Active (2)`, `Completed (1)`).
6. **Smooth Micro-Interactions & Animations**:
   - Custom SVG animated checkmark that scales smoothly on toggle.
   - Text strikethrough transition and card elevation on hover.
   - Respects user preference via `@media (prefers-reduced-motion: reduce)`.
7. **"All Done!" Milestone Celebration**:
   When all tasks are completed (`pending === 0` and `total > 0`), a celebratory badge appears in the header (`🎉 All Done!`), the completion meter hits 100% in emerald green, and the stat card illuminates.
8. **Dual Empty States**:
   Distinct empty states for an empty workspace ("No tasks yet") versus an active filter that yielded no results ("No matching tasks found" with a one-click "Clear All Filters" button).
9. **Polite Screen Reader Announcer**:
   An invisible `aria-live="polite"` live region communicates task creation, editing, deletion, batch clearing, and filter adjustments to assistive technologies.
10. **Error Boundary**:
    Top-level `ErrorBoundary` prevents React rendering crashes from breaking the interface.

---

## 8. Automated Testing, Verification & Deployment

### Requirements Coverage

| Requirement | Implemented in |
|---|---|
| Add task by title, reject empty/whitespace | `components/TaskForm.tsx` → `useTaskManager.addTask` |
| Toggle complete/incomplete | `useTaskManager.toggleComplete` → `state/tasksReducer.ts` (`TOGGLE`) |
| Inline edit (Enter/blur save, Escape cancel) | `components/TaskItem.tsx` → `useTaskManager.editTask` → reducer `EDIT` |
| Delete task | `components/TaskItem.tsx` → `useTaskManager.deleteTask` → reducer `DELETE` |
| Priority High/Medium/Low, badged | `types/task.ts`, `components/TaskItem.tsx` (badge + accent stripe) |
| Live search by title | `selectors.ts` → `selectVisibleTasks` (case-insensitive substring) |
| Filter by status (All/Active/Completed) | `components/Filters.tsx` + `selectVisibleTasks` |
| Filter by priority | `components/Filters.tsx` + `selectVisibleTasks` |
| All filters compose together | `App.tsx` passes one `TaskFilters` object into `selectVisibleTasks` |
| Stats: Total/Completed/Pending | `selectors.ts` → `computeStats`, rendered in `components/Stats.tsx` |
| Persistence across refresh | `hooks/useLocalStorage.ts`, keyed by `focuslist_tasks` |

### Automated Tests (Vitest + Testing Library)
32 tests across 5 files, including dedicated coverage for the pure `tasksReducer` (6 cases: add/toggle/edit/delete/clear/unknown-action) and the pure selectors (8 cases: search, status, priority, composed filters, stats, empty-list edge case).

```bash
# Run unit and integration tests
npm test

# Run TypeScript strict type-check
npm run type-check

# Run ESLint (flat config, zero errors/warnings)
npm run lint

# Build production bundle
npm run build
```

### Production Deployment
The build output in `dist/` is completely static and ready for instant HTTPS deployment on **Vercel** or **Netlify**:
- **Vercel**:
  - Framework Preset: `Vite`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- **Netlify**:
  - Build Command: `npm run build`
  - Publish directory: `dist`

---

## 9. Project Structure

```
src/
├── components/     # Presentational, memoized UI components
├── context/        # TaskContext — app-wide task state provider
├── hooks/          # useTaskManager, useLocalStorage, useKeyboardShortcut
├── state/          # Pure tasksReducer + action creators
├── styles/         # Hand-written CSS, one file per concern
├── types/          # Shared TypeScript types
├── selectors.ts    # Pure filter/stat derivation functions
├── App.tsx         # Composition root
└── main.tsx        # Entry point, web-vitals reporting
```

## 10. Contributing

This is a solo hackathon submission and not currently accepting external contributions. If forking for your own use:
1. Fork the repository
2. `npm install`
3. `npm run dev` to start the local dev server
4. `npm run lint && npm run test && npm run build` before opening a PR

## 11. License

MIT — free to use, modify, and distribute.
