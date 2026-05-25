import { memo, useState } from 'react';
import styles from '../modalsCss/BookshelfModal.module.css';
import SkillsModal from './SkillsModal';
import { BOOKSHELF_PROFILES } from '../../../data/modals/skillsProfiles';
import { getAssetPath } from '../../../utils/assets';

const formationBook = getAssetPath('/modals/formation-skills/books-formation.png');
const skillsBook = getAssetPath('/modals/formation-skills/books-skill.png');

const BookshelfModal = memo(function BookshelfModal() {

    const [selectedProfile, setSelectedProfile] = useState(null);

    function handleBookSelection(profileKey) {
        setSelectedProfile(profileKey);
    }

    function handleBackToBookshelf() {
        setSelectedProfile(null);
    }

    const activeProfile = selectedProfile == null ? null : BOOKSHELF_PROFILES[selectedProfile];

    return (
        <>
            {selectedProfile === null ? (
                <div className={styles.bookshelf}>
                    <button className={styles['book-button']}
                        onClick={() => handleBookSelection('formation')}
                        aria-label={`Apri libro della formazione`}>
                        <img className={styles['book-image']} src={formationBook} alt="" aria-hidden="true" />
                        <span className={styles['book-label']}>Formazione</span>
                    </button>
                    <button className={styles['book-button']}
                        onClick={() => handleBookSelection('skills')}
                        aria-label={`Apri libro delle competenze`}>
                        <img className={styles['book-image']} src={skillsBook} alt="" aria-hidden="true" />
                        <span className={styles['book-label']}>Competenze</span>
                    </button>
                </div>
            ) : (
                <div className={styles.book}>
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