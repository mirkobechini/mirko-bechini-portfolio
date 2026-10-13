import { memo, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import styles from './BookshelfModal.module.css';
import sharedStyles from '../shared/SharedModal.module.css';
import { BOOKSHELF_PROFILES } from './bookshelfProfiles';
import useSkills from '../../../hooks/useSkills';
import useCourses from '../../../hooks/useCourses';
import useFormationSteps from '../../../hooks/useFormationSteps';
import { getAssetPath } from '../../../utils/assets';
import playBookFlip from '../../../utils/playBookFlip';

const SkillsModal = lazy(() => import('./SkillsModal'));

const formationBook = getAssetPath('/modals/bookshelf/books-formation.webp');
const skillsBook = getAssetPath('/modals/bookshelf/books-skill.webp');

const BookshelfModal = memo(function BookshelfModal({ setModalSprite, defaultModalSprite, modalParams }) {

    const [selectedProfile, setSelectedProfile] = useState(null);
    const [preselectSkill, setPreselectSkill] = useState(null);
    const [returnToEducation, setReturnToEducation] = useState(null);
    const { skills } = useSkills();
    const { courses } = useCourses();
    const { focus: formationFocus, roadmap: formationRoadmap } = useFormationSteps();
    const preselectDone = useRef(false);

    /* Auto-open "Formazione" book and select matching education when coming from a certification.
       Una volta sola: quando i corsi si aggiornano dalla API non deve riportare l'utente indietro. */
    useEffect(() => {
        const preselectId = modalParams?.preselectEducation;
        if (preselectId == null || preselectDone.current) return;
        const found = courses.find((e) => e.id === preselectId);
        if (found) {
            preselectDone.current = true;
            setSelectedProfile('formation');
            setReturnToEducation(found);
        }
    }, [modalParams?.preselectEducation, courses]);

    function handleBookSelection(profileKey) {
        setSelectedProfile(profileKey);
        setPreselectSkill(null);
        setReturnToEducation(null);
        playBookFlip();
    }

    function handleBackToBookshelf() {
        setSelectedProfile(null);
        setPreselectSkill(null);
        setReturnToEducation(null);
        playBookFlip();
    }

    function handleSwitchToSkill(skillName, education) {
        setSelectedProfile('skills');
        setPreselectSkill(skillName);
        setReturnToEducation(education);
        playBookFlip();
    }

    function handleBackToFormation() {
        setSelectedProfile('formation');
        setPreselectSkill(null);
        playBookFlip();
    }

    // Le competenze arrivano dalla API (con fallback statico); il resto del profilo è fisso
    const activeProfile = useMemo(() => {
        if (selectedProfile == null) return null;
        const profile = BOOKSHELF_PROFILES[selectedProfile];
        if (selectedProfile === 'skills') return { ...profile, skillsData: skills };
        if (selectedProfile === 'formation') return { ...profile, educationData: courses, formationFocus, formationRoadmap };
        return profile;
    }, [selectedProfile, skills, courses, formationFocus, formationRoadmap]);

    useEffect(() => {
        if (selectedProfile == null) {
            setModalSprite?.(defaultModalSprite ?? null);
            return;
        }

        setModalSprite?.(activeProfile?.modalSprite ?? defaultModalSprite ?? null);
    }, [activeProfile, defaultModalSprite, selectedProfile, setModalSprite, preselectSkill]);

    return (
        <>
            {selectedProfile === null ? (
                <div className={styles.bookshelf} data-library-view="bookshelf">
                    <button className={`${styles['book-button']} ${sharedStyles['button-lift-hover']} ${sharedStyles['button-lift-motion']}`}
                        onClick={() => handleBookSelection('formation')}
                        aria-label={`Apri libro della formazione`}>
                        <img className={styles['book-image']} src={formationBook} alt="" aria-hidden="true" width="201" height="260" />
                        <span className={sharedStyles['button-label']}>Formazione</span>
                    </button>
                    <button className={`${styles['book-button']} ${sharedStyles['button-lift-hover']} ${sharedStyles['button-lift-motion']}`}
                        onClick={() => handleBookSelection('skills')}
                        aria-label={`Apri libro delle competenze`}>
                        <img className={styles['book-image']} src={skillsBook} alt="" aria-hidden="true" width="201" height="256" />
                        <span className={sharedStyles['button-label']}>Competenze</span>
                    </button>
                </div>
            ) : (
                <div className={styles.book} data-library-view="profile">
                    {activeProfile != null && (
                        <Suspense fallback={<div className={sharedStyles.loading}>Caricamento...</div>}>
                            <SkillsModal
                                profile={activeProfile}
                                onBackToBookshelf={handleBackToBookshelf}
                                onSwitchToSkill={handleSwitchToSkill}
                                onBackToFormation={handleBackToFormation}
                                preselectSkill={preselectSkill}
                                returnToEducation={returnToEducation}
                            />
                        </Suspense>
                    )}
                </div>
            )}
        </>
    );
});

export default BookshelfModal;