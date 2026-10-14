import styles from './ProjectsModal.module.css';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import sharedStyles from '../shared/SharedModal.module.css';
import FilterPanel from './components/FilterPanel';
import FilterGroup from './components/FilterGroup';
import ProjectsGrid from './components/ProjectsGrid';
import ProjectDetailView from './components/ProjectDetailView';
import ProjectsMessage from './components/ProjectsMessage';
import useProjectFilters from './hooks/useProjectFilters';
import useProjects from '../../../hooks/useProjects';
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
    const { projects, loading, error } = useProjects();
    const {
        filteredProjects,
        selectedTypeFilter,
        selectedScopeFilter,
        setTypeFilter,
        setScopeFilter,
        resetFilters,
        typeOptions,
        scopeOptions,
    } = useProjectFilters(projects);

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const hasProjects = projects.length > 0;

    // Il dettaglio prende il posto dell'elenco; si ritrova per id, così sparisce da solo se il progetto non c'è più
    const [selectedId, setSelectedId] = useState(null);
    const selectedProject = useMemo(
        () => projects.find((project) => project.id === selectedId) ?? null,
        [projects, selectedId]
    );
    const viewRef = useRef(null);
    const savedScrollRef = useRef(0);
    const lastOpenedIdRef = useRef(null); // la card da rimettere a fuoco al ritorno

    const openProject = useCallback((project) => {
        savedScrollRef.current = viewRef.current?.scrollTop ?? 0;
        lastOpenedIdRef.current = project.id;
        setSelectedId(project.id);
    }, []);

    const closeProject = useCallback(() => setSelectedId(null), []);

    // Cambiando i filtri si torna all'elenco: il dettaglio non c'entra più con ciò che si sta cercando
    const changeTypeFilter = useCallback((value) => { setSelectedId(null); setTypeFilter(value); }, [setTypeFilter]);
    const changeScopeFilter = useCallback((value) => { setSelectedId(null); setScopeFilter(value); }, [setScopeFilter]);
    const resetAllFilters = useCallback(() => { setSelectedId(null); resetFilters(); }, [resetFilters]);

    // Aprendo si parte dall'inizio del foglio; tornando indietro si ritrova la card di prima
    const hadDetail = useRef(false);
    useEffect(() => {
        const view = viewRef.current;
        if (!view) return;

        if (selectedProject) {
            view.scrollTop = 0;
            hadDetail.current = true;
        } else if (hadDetail.current) {
            hadDetail.current = false;
            view.scrollTop = savedScrollRef.current;
            const card = [...view.querySelectorAll('[data-project-id]')].find((el) => el.dataset.projectId === String(lastOpenedIdRef.current));
            card?.focus({ preventScroll: true });
        }
    }, [selectedProject]);

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
                onReset={resetAllFilters}
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
                    onChange={changeTypeFilter}
                />
                <FilterGroup
                    name="projectScopeFilter"
                    options={scopeFilterOptions}
                    selectedValue={selectedScopeFilter}
                    onChange={changeScopeFilter}
                />
            </FilterPanel>

            <div ref={viewRef} className={`${styles['projects-view']} ${sharedStyles['scroll-y-contain']}`}>
                {loading && !hasProjects ? (
                    <ProjectsMessage>
                        <p>Caricamento progetti...</p>
                    </ProjectsMessage>
                ) : error && !hasProjects ? (
                    <ProjectsMessage variant="error">
                        <p>{error}</p>
                        <p>Riprova più tardi o ricarica la pagina.</p>
                    </ProjectsMessage>
                ) : (
                    <>
                        {error && (
                            <ProjectsMessage variant="error" role="status">
                                Impossibile aggiornare i progetti: i dati mostrati potrebbero non essere aggiornati.
                            </ProjectsMessage>
                        )}
                        {selectedProject ? (
                            <ProjectDetailView project={selectedProject} onBack={closeProject} />
                        ) : (
                            <ProjectsGrid projects={filteredProjects} onSelectProject={openProject} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
});

export default ProjectsModal;
