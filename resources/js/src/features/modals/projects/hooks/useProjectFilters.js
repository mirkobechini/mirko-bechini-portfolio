import { useCallback, useMemo, useState } from 'react';

export default function useProjectFilters(projects = []) {
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
    const [selectedScopeFilter, setSelectedScopeFilter] = useState('all');

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            if (selectedTypeFilter !== 'all' && project.type !== selectedTypeFilter) {
                return false;
            }
            if (selectedScopeFilter !== 'all' && project.projectScope !== selectedScopeFilter) {
                return false;
            }
            return true;
        });
    }, [projects, selectedTypeFilter, selectedScopeFilter]);

    const resetFilters = useCallback(() => {
        setSelectedTypeFilter('all');
        setSelectedScopeFilter('all');
    }, []);

    return {
        filteredProjects,
        selectedTypeFilter,
        selectedScopeFilter,
        setTypeFilter: setSelectedTypeFilter,
        setScopeFilter: setSelectedScopeFilter,
        resetFilters,
    };
}
