import { useCallback, useMemo, useState } from 'react';

export default function useProjectFilters(projects = []) {
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
    const [selectedScopeFilter, setSelectedScopeFilter] = useState('all');

    const typeOptions = useMemo(() => ([
        { id: 'all', value: 'all', label: 'Tutti', iconKey: 'all' },
        { id: 'frontend', value: 'frontend', label: 'Frontend', iconKey: 'frontend' },
        { id: 'backend', value: 'backend', label: 'Backend', iconKey: 'backend' },
        { id: 'fullstack', value: 'fullstack', label: 'Fullstack', iconKey: 'fullstack' },
    ]), []);

    const scopeOptions = useMemo(() => ([
        { id: 'all', value: 'all', label: 'Tutti', iconKey: 'all' },
        { id: 'personal', value: 'personal', label: 'Personali', iconKey: 'all' },
        { id: 'work', value: 'work', label: 'Lavoro', iconKey: 'all' },
    ]), []);

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
        typeOptions,
        scopeOptions,
    };
}
