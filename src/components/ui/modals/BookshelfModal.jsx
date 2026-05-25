import { memo, useState } from 'react';
import styles from '../modalsCss/BookshelfModal.module.css';
import SkillsModal from './SkillsModal';
import { SKILLS_MODAL_PROFILES } from '../../../data/modals/skillsProfiles';

const BookshelfModal = memo(function BookshelfModal() {

    const [selectedProfile, setSelectedProfile] = useState(null);

    function handleBookSelection(profileKey) {
        setSelectedProfile(profileKey);
    }

    function handleBackToBookshelf() {
        setSelectedProfile(null);
    }

    const activeProfile = selectedProfile == null ? null : SKILLS_MODAL_PROFILES[selectedProfile];

    return (
        <>
            {selectedProfile === null ? (
                <div className={styles.bookshelf}>
                    <button className={styles['formation-book']}
                        onClick={() => handleBookSelection('formation')}
                        aria-label={`Apri libro della formazione`}>
                        <img className="nes-icon is-medium" src={"#"} alt="" aria-hidden="true" />
                    </button>
                    <button className={styles['skills-book']}
                        onClick={() => handleBookSelection('skills')}
                        aria-label={`Apri libro delle competenze`}>
                        <img className="nes-icon is-medium" src={"#"} alt="" aria-hidden="true" />
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