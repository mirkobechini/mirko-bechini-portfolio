import { memo, useEffect, useState, lazy, Suspense } from 'react';
import styles from './ProjectExperienceModal.module.css';
import sharedStyles from '../shared/SharedModal.module.css';
import { getAssetPath } from '../../../utils/assets';
import ProjectsModal from './ProjectsModal';


const projectButton = getAssetPath('/modals/project-experience/button-project.webp');
const experienceButton = getAssetPath('/modals/project-experience/button-experience.webp');

const ProjectExperienceModal = memo(function ProjectExperienceModal({ setModalSprite, defaultModalSprite }) {

    const [selectedView, setSelectedView] = useState(null);

    function handleButtonSelection(viewKey) {
        setSelectedView(viewKey);
    }

    useEffect(() => {
        // Imposta lo sprite iniziale solo quando il componente viene montato o se cambia il default
        setModalSprite?.(defaultModalSprite ?? null);
    }, [defaultModalSprite, setModalSprite]);

    return (
        <>
            {selectedView === null ? (
                <div className={styles['project-experience-home']}>
                    <div className={styles['button-container']}>
                        <button className={`${styles['button-project-experience']} ${sharedStyles['button-lift-hover']} ${sharedStyles['button-lift-motion']}`}
                            type="button"
                            onClick={() => handleButtonSelection('projects')}
                            aria-label={`Apri i progetti`}>
                            <span className={styles['button-image-frame']} aria-hidden="true">
                                <img className={styles['button-image']} src={projectButton} alt="" aria-hidden="true" width="566" height="390" />
                            </span>
                            <span className={sharedStyles['button-label']}>Progetti</span>
                        </button>
                    </div>
                    <div className={styles['button-container']}>
                        <button className={`${styles['button-project-experience']} ${sharedStyles['button-lift-hover']} ${sharedStyles['button-lift-motion']}`}
                            type="button"
                            onClick={() => handleButtonSelection('experiences')}
                            aria-label={`Apri le esperienze`}>
                            <span className={styles['button-image-frame']} aria-hidden="true">
                                <img className={styles['button-image']} src={experienceButton} alt="" aria-hidden="true" width="434" height="478" />
                            </span>
                            <span className={sharedStyles['button-label']}>Esperienze</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles['desk-container']}>
                    {selectedView === 'projects' ? (
                        <Suspense fallback={<div className={sharedStyles.loading}>Caricamento...</div>}>
                            <ProjectModal />
                        </Suspense>
                    ) : (
                        <div className={styles['experience-placeholder']}>
                            <article className={styles['experience-placeholder-card']} aria-live="polite">
                                <div className={styles['experience-placeholder-visual']} aria-hidden="true">
                                    <img src={experienceButton} alt="" className={styles['experience-placeholder-image']} width="434" height="478" />
                                </div>
                                <p className={styles['experience-placeholder-kicker']}>Esperienze</p>
                                <h3 className={styles['experience-placeholder-title']}>Sezione in arrivo</h3>
                                <p className={styles['experience-placeholder-description']}>
                                    Sto organizzando questa parte con un componente dedicato.
                                </p>
                                <span className={styles['experience-placeholder-badge']}>Work in progress</span>
                            </article>
                        </div>
                    )}
                </div>
            )}
        </>
    );
});

export default ProjectExperienceModal;