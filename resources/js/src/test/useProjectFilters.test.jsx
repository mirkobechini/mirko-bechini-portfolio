import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useProjectFilters from '../features/modals/projects/hooks/useProjectFilters';

const mockProjects = [
    { id: 1, title: 'Project A', type: 'frontend', projectScope: 'personal' },
    { id: 2, title: 'Project B', type: 'backend', projectScope: 'work' },
    { id: 3, title: 'Project C', type: 'fullstack', projectScope: 'personal' },
    { id: 4, title: 'Project D', type: 'frontend', projectScope: 'work' },
];

describe('useProjectFilters', () => {
    it('returns all projects with default filters', () => {
        const { result } = renderHook(() => useProjectFilters(mockProjects));

        expect(result.current.filteredProjects).toHaveLength(4);
        expect(result.current.selectedTypeFilter).toBe('all');
        expect(result.current.selectedScopeFilter).toBe('all');
    });

    it('filters by type', () => {
        const { result } = renderHook(() => useProjectFilters(mockProjects));

        act(() => result.current.setTypeFilter('frontend'));

        expect(result.current.filteredProjects).toHaveLength(2);
        expect(result.current.filteredProjects.every(p => p.type === 'frontend')).toBe(true);
    });

    it('filters by scope', () => {
        const { result } = renderHook(() => useProjectFilters(mockProjects));

        act(() => result.current.setScopeFilter('work'));

        expect(result.current.filteredProjects).toHaveLength(2);
        expect(result.current.filteredProjects.every(p => p.projectScope === 'work')).toBe(true);
    });

    it('filters by both type and scope', () => {
        const { result } = renderHook(() => useProjectFilters(mockProjects));

        act(() => result.current.setTypeFilter('frontend'));
        act(() => result.current.setScopeFilter('work'));

        expect(result.current.filteredProjects).toHaveLength(1);
        expect(result.current.filteredProjects[0].title).toBe('Project D');
    });

    it('returns empty when no projects match', () => {
        const { result } = renderHook(() => useProjectFilters(mockProjects));

        act(() => result.current.setTypeFilter('backend'));
        act(() => result.current.setScopeFilter('personal'));

        expect(result.current.filteredProjects).toHaveLength(0);
    });

    it('resets filters to default', () => {
        const { result } = renderHook(() => useProjectFilters(mockProjects));

        act(() => result.current.setTypeFilter('backend'));
        act(() => result.current.setScopeFilter('work'));
        act(() => result.current.resetFilters());

        expect(result.current.selectedTypeFilter).toBe('all');
        expect(result.current.selectedScopeFilter).toBe('all');
        expect(result.current.filteredProjects).toHaveLength(4);
    });

    it('returns empty array with no projects', () => {
        const { result } = renderHook(() => useProjectFilters());

        expect(result.current.filteredProjects).toHaveLength(0);
    });

    it('provides typeOptions', () => {
        const { result } = renderHook(() => useProjectFilters(mockProjects));

        expect(result.current.typeOptions).toHaveLength(4);
        expect(result.current.typeOptions[0].value).toBe('all');
        expect(result.current.typeOptions[1].value).toBe('frontend');
    });

    it('provides scopeOptions', () => {
        const { result } = renderHook(() => useProjectFilters(mockProjects));

        expect(result.current.scopeOptions).toHaveLength(3);
        expect(result.current.scopeOptions[0].value).toBe('all');
        expect(result.current.scopeOptions[1].value).toBe('personal');
    });
});