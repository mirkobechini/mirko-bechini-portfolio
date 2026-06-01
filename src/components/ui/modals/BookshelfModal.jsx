import { memo, useEffect, useState } from 'react';
import styles from '../modalsCss/BookshelfModal.module.css';
import sharedStyles from '../modalsCss/SharedModal.module.css';
import SkillsModal from './SkillsModal';
import { BOOKSHELF_PROFILES } from '../../../data/modals/bookshelfProfiles';
import { getAssetPath } from '../../../utils/assets';

const formationBook = getAssetPath('/modals/bookshelf/books-formation.png');
const skillsBook = getAssetPath('/modals/bookshelf/books-skill.png');

const BookshelfModal = memo(function BookshelfModal({ setModalSprite, defaultModalSprite }) {

    const [selectedProfile, setSelectedProfile] = useState(null);

    function handleBookSelection(profileKey) {
        setSelectedProfile(profileKey);
    }

    function handleBackToBookshelf() {
        setSelectedProfile(null);
    }

    const activeProfile = selectedProfile == null ? null : BOOKSHELF_PROFILES[selectedProfile];

    useEffect(() => {
        if (selectedProfile == null) {
            setModalSprite?.(defaultModalSprite ?? null);
            return;
        }

        setModalSprite?.(activeProfile?.modalSprite ?? defaultModalSprite ?? null);
    }, [activeProfile, defaultModalSprite, selectedProfile, setModalSprite]);

    return (
        <>
            {selectedProfile === null ? (
                <div className={styles.bookshelf} data-library-view="bookshelf">
                    <button className={`${styles['book-button']} ${sharedStyles['button-lift-hover']}`}
                        onClick={() => handleBookSelection('formation')}
                        aria-label={`Apri libro della formazione`}>
                        <img className={styles['book-image']} src={formationBook} alt="" aria-hidden="true" />
                        <span className={sharedStyles['button-label']}>Formazione</span>
                    </button>
                    <button className={`${styles['book-button']} ${sharedStyles['button-lift-hover']}`}
                        onClick={() => handleBookSelection('skills')}
                        aria-label={`Apri libro delle competenze`}>
                        <img className={styles['book-image']} src={skillsBook} alt="" aria-hidden="true" />
                        <span className={sharedStyles['button-label']}>Competenze</span>
                    </button>
                </div>
            ) : (
                <div className={styles.book} data-library-view="profile">
                    {activeProfile != null && (
                        <SkillsModal
                            profile={activeProfile}
                            onBackToBookshelf={handleBackToBookshelf}
                        />
                    )}
                </div>
            )}
        </>
    );
});

export default BookshelfModal;