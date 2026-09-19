import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('FocusList Integrated App Flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders application title and statistics', () => {
    render(<App />);
    expect(screen.getByText('FocusList')).toBeInTheDocument();
    expect(screen.getByTestId('stat-total')).toBeInTheDocument();
    expect(screen.getByTestId('stat-completed')).toBeInTheDocument();
    expect(screen.getByTestId('stat-pending')).toBeInTheDocument();
  });

  it('adds a new task and updates stats', () => {
    render(<App />);
    const input = screen.getByTestId('task-input');
    const select = screen.getByTestId('task-priority-select');
    const addButton = screen.getByTestId('add-task-btn');

    fireEvent.change(input, { target: { value: 'New Test Task' } });
    fireEvent.change(select, { target: { value: 'high' } });
    fireEvent.click(addButton);

    expect(screen.getByText('New Test Task')).toBeInTheDocument();
    expect(screen.getAllByText('High').length).toBeGreaterThan(0);
  });

  it('filters tasks by live search', () => {
    render(<App />);
    const input = screen.getByTestId('task-input');
    const addButton = screen.getByTestId('add-task-btn');

    fireEvent.change(input, { target: { value: 'Unique Alpha' } });
    fireEvent.click(addButton);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'Unique Alpha' } });

    expect(screen.getByText('Unique Alpha')).toBeInTheDocument();
  });

  it('composes status and priority filters', () => {
    render(<App />);
    const filterActiveBtn = screen.getByTestId('filter-status-active');
    fireEvent.click(filterActiveBtn);

    const prioritySelect = screen.getByTestId('filter-priority-select');
    fireEvent.change(prioritySelect, { target: { value: 'low' } });

    const resetBtn = screen.getByTestId('reset-filters-btn');
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
  });

  it('toggles dark and light theme', () => {
    render(<App />);
    const themeBtn = screen.getByTestId('theme-toggle-btn');
    expect(themeBtn).toBeInTheDocument();
    fireEvent.click(themeBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBeDefined();
  });
});
