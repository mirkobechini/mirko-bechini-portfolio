import styles from './ProjectsModal.module.css';
import { memo, useMemo, useState } from 'react';
import sharedStyles from '../shared/SharedModal.module.css';
import FilterPanel from './components/FilterPanel';
import FilterGroup from './components/FilterGroup';
import projectData from './projectData';
import { getAssetPath } from '../../../utils/assets';
import { isValidLink } from '../../../utils/links';

const frontendIcon = getAssetPath('/modals/projects/frontend-icon.webp');
const backendIcon = getAssetPath('/modals/projects/backend-icon.webp');
const fullstackIcon = getAssetPath('/modals/projects/fullstack-icon.webp');
const folderIcon = getAssetPath('/modals/projects/folder-icon.webp');
const resetButtonIcon = getAssetPath('/modals/projects/reset-button.webp');

const ProjectsModal = memo(function ProjectsModal({ onBackToProjectsHome }) {
    const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
    const [selectedScopeFilter, setSelectedScopeFilter] = useState('all');
    const [isFiltersOpenMobile, setIsFiltersOpenMobile] = useState(false);

    const filteredProjects = useMemo(() => {
        return projectData.filter(project => {
            if (selectedTypeFilter !== 'all' && project.type !== selectedTypeFilter) {
                return false;
            }
            if (selectedScopeFilter !== 'all' && project.projectScope !== selectedScopeFilter) {
                return false;
            }
            return true;
        });
    }, [selectedTypeFilter, selectedScopeFilter]);

    const typeFilterOptions = useMemo(() => ([
        {
            id: 'all',
            value: 'all',
            content: (
                <>
                    <img className={styles.icon} src={folderIcon} alt="Tutti" width="90" height="68" />
                    Tutti
                </>
            ),
        },
        {
            id: 'frontend',
            value: 'frontend',
            content: (
                <>
                    <img className={styles.icon} src={frontendIcon} alt="Frontend" width="106" height="67" />
                    Frontend
                </>
            ),
        },
        {
            id: 'backend',
            value: 'backend',
            content: (
                <>
                    <img className={styles.icon} src={backendIcon} alt="Backend" width="71" height="80" />
                    Backend
                </>
            ),
        },
        {
            id: 'fullstack',
            value: 'fullstack',
            content: (
                <>
                    <img className={styles.icon} src={fullstackIcon} alt="Fullstack" width="100" height="86" />
                    Fullstack
                </>
            ),
        },
    ]), []);

    const scopeFilterOptions = useMemo(() => ([
        {
            id: 'all',
            value: 'all',
            content: (
                <>
                    <img className={styles.icon} src={folderIcon} alt="Tutti" width="90" height="68" />
                    Tutti
                </>
            ),
        },
        {
            id: 'personal',
            value: 'personal',
            content: (
                <>
                    <img className={styles.icon} src={folderIcon} alt="Personali" width="90" height="68" />
                    Personali
                </>
            ),
        },
        {
            id: 'work',
            value: 'work',
            content: (
                <>
                    <img className={styles.icon} src={folderIcon} alt="Lavoro" width="90" height="68" />
                    Lavoro
                </>
            ),
        },
    ]), []);

    function handleResetFilters() {
        setSelectedTypeFilter('all');
        setSelectedScopeFilter('all');
    }

    return (
        <div className={styles['desk-container']}>
            <FilterPanel
                onBack={onBackToProjectsHome}
                backLabel="Torna alla scelta progetti/esperienze"
                onReset={handleResetFilters}
                resetLabel="Reset"
                resetIcon={resetButtonIcon}
                isMobileOpen={isFiltersOpenMobile}
                onShowMobile={() => setIsFiltersOpenMobile(true)}
                onHideMobile={() => setIsFiltersOpenMobile(false)}
                showLabel="Filtri"
                hideLabel="Nascondi"
                mobileIcon={resetButtonIcon}
            >
                <FilterGroup
                    name="projectTypeFilter"
                    options={typeFilterOptions}
                    selectedValue={selectedTypeFilter}
                    onChange={setSelectedTypeFilter}
                />
                <FilterGroup
                    name="projectScopeFilter"
                    options={scopeFilterOptions}
                    selectedValue={selectedScopeFilter}
                    onChange={setSelectedScopeFilter}
                />
            </FilterPanel>

            <div className={`${styles['projects-view']} ${sharedStyles['scroll-y-contain']}`}>
                <div className={styles['projects-grid']}>
                    {filteredProjects.length === 0 && (
                        <div className={styles['no-projects']}>
                            <p>Nessun progetto trovato con i filtri selezionati.</p>
                        </div>
                    )}
                    {filteredProjects.map((project, index) => (
                        <div className={`${styles['project-blueprint']} ${index % 2 === 0 ? '' : styles.alternate}`} key={project.id}>
                            <div className={styles['blueprint-header']}></div>
                            <h4 className={styles['project-title']}>{project.title}</h4>
                            <p>{project.description}</p>
                            <div className={styles['tech-stack']}>
                                {project.technologies.length > 0 ? `#${project.technologies.join(' #')}` : ''}
                            </div>
                            <div className={styles['links-group']}>
                                {isValidLink(project.repo) && (
                                    <a href={project.repo} className={styles['view-btn']} target="_blank" rel="noopener noreferrer">Apri Documentazione</a>
                                )}
                                {isValidLink(project.live) && (
                                    <a href={project.live} className={styles['view-btn']} target="_blank" rel="noopener noreferrer">Vai al sito</a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default ProjectsModal;