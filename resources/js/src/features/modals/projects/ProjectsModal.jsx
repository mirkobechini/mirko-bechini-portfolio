import styles from './ProjectsModal.module.css';
import { memo, useMemo, useState } from 'react';
import sharedStyles from '../shared/SharedModal.module.css';
import FilterPanel from './components/FilterPanel';
import FilterGroup from './components/FilterGroup';
import ProjectsGrid from './components/ProjectsGrid';
import useProjectFilters from './hooks/useProjectFilters';
import useGithubProjects from '../../../hooks/useGithubProjects';
import { getAssetPath } from '../../../utils/assets';

const frontendIcon = getAssetPath('/modals/projects/frontend-icon.webp');
const backendIcon = getAssetPath('/modals/projects/backend-icon.webp');
const fullstackIcon = getAssetPath('/modals/projects/fullstack-icon.webp');
const folderIcon = getAssetPath('/modals/projects/folder-icon.webp');
const resetButtonIcon = getAssetPath('/modals/projects/reset-button.webp');

const iconConfig = {
    all: { src: folderIcon, width: 90, height: 68 },
    frontend: { src: frontendIcon, width: 106, height: 67 },
    backend: { src: backendIcon, width: 71, height: 80 },
    fullstack: { src: fullstackIcon, width: 100, height: 86 },
};

const ProjectsModal = memo(function ProjectsModal({ onBackToProjectsHome }) {
    const { projects: githubProjects, loading, error } = useGithubProjects();
    const {
        filteredProjects,
        selectedTypeFilter,
        selectedScopeFilter,
        setTypeFilter,
        setScopeFilter,
        resetFilters,
        typeOptions,
        scopeOptions,
    } = useProjectFilters(githubProjects);

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const typeFilterOptions = useMemo(() => {
        return typeOptions.map(option => {
            const icon = iconConfig[option.iconKey] ?? iconConfig.all;
            return {
                id: option.id,
                value: option.value,
                content: (
                    <>
                        <img
                            className={styles.icon}
                            src={icon.src}
                            alt={option.label}
                            width={icon.width}
                            height={icon.height}
                        />
                        {option.label}
                    </>
                ),
            };
        });
    }, [typeOptions]);

    const scopeFilterOptions = useMemo(() => {
        return scopeOptions.map(option => {
            const icon = iconConfig[option.iconKey] ?? iconConfig.all;
            return {
                id: option.id,
                value: option.value,
                content: (
                    <>
                        <img
                            className={styles.icon}
                            src={icon.src}
                            alt={option.label}
                            width={icon.width}
                            height={icon.height}
                        />
                        {option.label}
                    </>
                ),
            };
        });
    }, [scopeOptions]);

    return (
        <div className={styles['desk-container']}>
            <FilterPanel
                onBack={onBackToProjectsHome}
                backLabel="Torna indietro"
                onReset={resetFilters}
                resetLabel="Reset"
                resetIcon={resetButtonIcon}
                isOpen={isFiltersOpen}
                onShow={() => setIsFiltersOpen(true)}
                onHide={() => setIsFiltersOpen(false)}
                showLabel="Filtri"
                hideLabel="Nascondi"
                mobileIcon={resetButtonIcon}
            >
                <FilterGroup
                    name="projectTypeFilter"
                    options={typeFilterOptions}
                    selectedValue={selectedTypeFilter}
                    onChange={setTypeFilter}
                />
                <FilterGroup
                    name="projectScopeFilter"
                    options={scopeFilterOptions}
                    selectedValue={selectedScopeFilter}
                    onChange={setScopeFilter}
                />
            </FilterPanel>

            <div className={`${styles['projects-view']} ${sharedStyles['scroll-y-contain']}`}>
                {loading ? (
                    <div className={styles['no-projects']}>
                        <p>Caricamento progetti...</p>
                    </div>
                ) : error ? (
                    <div className={styles['no-projects']}>
                        <p>{error}</p>
                        {filteredProjects.length === 0 && (
                            <p>Riprova più tardi o ricarica la pagina.</p>
                        )}
                    </div>
                ) : (
                    <ProjectsGrid projects={filteredProjects} />
                )}
            </div>
        </div>
    );
});

export default ProjectsModal;
