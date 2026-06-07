import styles from './ProjectsModal.module.css';
import { useMemo, useState, memo, useEffect } from 'react';
import sharedStyles from '../shared/SharedModal.module.css';
import projectData from './projectData';
import { getAssetPath } from '../../../utils/assets';
import { isValidLink } from '../../../utils/links';

const frontendIcon = getAssetPath('/modals/projects/frontend-icon.webp');
const backendIcon = getAssetPath('/modals/projects/backend-icon.webp');
const fullstackIcon = getAssetPath('/modals/projects/fullstack-icon.webp');
const folderIcon = getAssetPath('/modals/projects/folder-icon.webp');
const resetButtonIcon = getAssetPath('/modals/projects/reset-button.webp');

const ProjectsModal = memo(function ProjectsModal() {

    const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
    const [selectedScopeFilter, setSelectedScopeFilter] = useState('all');

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Determine if the device is mobile
    const [isFiltersVisible, setIsFiltersVisible] = useState(!isMobile); // Show filters by default on desktop

    const handleResize = () => {
        const isMobile = window.innerWidth < 768;
        setIsMobile(isMobile);
        setIsFiltersVisible(!isMobile);
    };

    const handleFilters = () => {
        setIsFiltersVisible(prev => !prev);
    }

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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


    return (
        <div className={styles['desk-container']}>
            {/*TODO: Add home button*/}
            {isFiltersVisible ? (
                <div className={styles['filter-container']}>
                    <div className={styles['filter-group']}>
                        <fieldset className={styles['filter-wrapper']}>
                            <input type='radio' className={styles['visually-hidden']} id='all-types' name='projectTypeFilter' value='all' checked={selectedTypeFilter === 'all'} onChange={e => setSelectedTypeFilter(e.target.value)} />
                            <label htmlFor='all-types' className={`${styles['button-label']} ${selectedTypeFilter === 'all' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={folderIcon} alt="Tutti" width="90" height="68" /> Tutti</label>
                            <input type='radio' className={styles['visually-hidden']} id='frontend' name='projectTypeFilter' value='frontend' checked={selectedTypeFilter === 'frontend'} onChange={e => setSelectedTypeFilter(e.target.value)} />
                            <label htmlFor='frontend' className={`${styles['button-label']} ${selectedTypeFilter === 'frontend' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={frontendIcon} alt="Frontend" width="106" height="67" /> Frontend</label>
                            <input type='radio' className={styles['visually-hidden']} id='backend' name='projectTypeFilter' value='backend' checked={selectedTypeFilter === 'backend'} onChange={e => setSelectedTypeFilter(e.target.value)} />
                            <label htmlFor='backend' className={`${styles['button-label']} ${selectedTypeFilter === 'backend' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={backendIcon} alt="Backend" width="71" height="80" /> Backend</label>
                            <input type='radio' className={styles['visually-hidden']} id='fullstack' name='projectTypeFilter' value='fullstack' checked={selectedTypeFilter === 'fullstack'} onChange={e => setSelectedTypeFilter(e.target.value)} />
                            <label htmlFor='fullstack' className={`${styles['button-label']} ${selectedTypeFilter === 'fullstack' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={fullstackIcon} alt="Fullstack" width="100" height="86" /> Fullstack</label>
                        </fieldset>
                        <fieldset className={styles['filter-wrapper']}>
                            <input type='radio' className={styles['visually-hidden']} id='all-projects' name='projectScopeFilter' value='all' checked={selectedScopeFilter === 'all'} onChange={e => setSelectedScopeFilter(e.target.value)} />
                            <label htmlFor='all-projects' className={`${styles['button-label']} ${selectedScopeFilter === 'all' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={folderIcon} alt="Tutti" width="90" height="68" /> Tutti</label>
                            <input type='radio' className={styles['visually-hidden']} id='personal-projects' name='projectScopeFilter' value='personal' checked={selectedScopeFilter === 'personal'} onChange={e => setSelectedScopeFilter(e.target.value)} />
                            <label htmlFor='personal-projects' className={`${styles['button-label']} ${selectedScopeFilter === 'personal' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={folderIcon} alt="Personali" width="90" height="68" /> Personali</label>
                            <input type='radio' className={styles['visually-hidden']} id='work-projects' name='projectScopeFilter' value='work' checked={selectedScopeFilter === 'work'} onChange={e => setSelectedScopeFilter(e.target.value)} />
                            <label htmlFor='work-projects' className={`${styles['button-label']} ${selectedScopeFilter === 'work' ? styles['selected-filter'] : ''}`}> <img className={styles.icon} src={folderIcon} alt="Lavoro" width="90" height="68" /> Lavoro</label>
                        </fieldset>
                    </div>
                    <button className={styles['filter-button']} onClick={() => { setSelectedTypeFilter('all'); setSelectedScopeFilter('all'); }} type="button">
                        <img src={resetButtonIcon} alt="Reset Filters" width="499" height="141" />
                        <span className={styles['filter-button-text']}>Reset</span>
                    </button>
                    {isMobile &&
                        <button className={styles['filter-button']} onClick={() => handleFilters()} type="button">
                            <img src={resetButtonIcon} alt="Show Filters" width="85" height="85" />
                            <span className={styles['filter-button-text']}>Nascondi</span>
                        </button>
                    }
                </div>
            ) : (
                isMobile && (
                <button className={styles['filter-button']} onClick={() => handleFilters()} type="button">
                    <img src={resetButtonIcon} alt="Show Filters" width="85" height="85" />
                    <span className={styles['filter-button-text']}>Filtri</span>
                </button>
                )
            )}
            {(!isMobile || !isFiltersVisible) && (
            <div className={`${styles['projects-view']} ${sharedStyles['scroll-y-contain']}`}>
                <div className={styles['projects-grid']}>
                    {
                        filteredProjects.length === 0 && (
                            <div className={styles['no-projects']}>
                                <p>Nessun progetto trovato con i filtri selezionati.</p>
                            </div>
                        )
                    }
                    {filteredProjects.map((project, index) => (

                        <div className={`${styles['project-blueprint']} ${index % 2 === 0 ? "" : styles.alternate}`} key={project.id}>
                            <div className={styles['blueprint-header']}></div>
                            <h4 className={styles['project-title']}>{project.title}</h4>
                            <p>{project.description}</p>
                            <div className={styles['tech-stack']}>
                                {project.technologies.length > 0 ? `#${project.technologies.join(' #')}` : ''}
                            </div>
                            <div className={styles['links-group']}>
                                {isValidLink(project.repo) && <a href={project.repo} className={styles['view-btn']} target="_blank" rel="noopener noreferrer">Apri Documentazione</a>}
                                {isValidLink(project.demo) && <a href={project.demo} className={styles['view-btn']} target="_blank" rel="noopener noreferrer">Vai al sito</a>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            )}
        </div>
    );
});

export default ProjectsModal;