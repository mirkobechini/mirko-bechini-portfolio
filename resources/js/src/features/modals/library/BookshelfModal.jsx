import { memo, useEffect, useState, lazy, Suspense } from 'react';
import styles from './BookshelfModal.module.css';
import sharedStyles from '../shared/SharedModal.module.css';
import { BOOKSHELF_PROFILES } from './bookshelfProfiles';
import { getAssetPath } from '../../../utils/assets';

const SkillsModal = lazy(() => import('./SkillsModal'));

const formationBook = getAssetPath('/modals/bookshelf/books-formation.webp');
const skillsBook = getAssetPath('/modals/bookshelf/books-skill.webp');

const BookshelfModal = memo(function BookshelfModal({ setModalSprite, defaultModalSprite }) {

    const [selectedProfile, setSelectedProfile] = useState(null);
    const [preselectSkill, setPreselectSkill] = useState(null);

    function handleBookSelection(profileKey) {
        setSelectedProfile(profileKey);
        setPreselectSkill(null);
        setReturnToEducation(null);
    }

    function handleBackToBookshelf() {
        setSelectedProfile(null);
        setPreselectSkill(null);
        setReturnToEducation(null);
    }

    function handleSwitchToSkill(skillName, education) {
        setSelectedProfile('skills');
        setPreselectSkill(skillName);
        setReturnToEducation(education);
    }

    function handleBackToFormation() {
        setSelectedProfile('formation');
        setPreselectSkill(null);
    }

    const activeProfile = selectedProfile == null ? null : BOOKSHELF_PROFILES[selectedProfile];
    const [returnToEducation, setReturnToEducation] = useState(null);

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