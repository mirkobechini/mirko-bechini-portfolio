import { memo } from 'react';
import styles from './AboutMeModal.module.css';
import { getAssetPath } from '../../../utils/assets';
import useAbout from '../../../hooks/useAbout';

const bottomSprite = getAssetPath('/modals/about-me/bottom-sprite.webp');
const topLeftAngle = getAssetPath('/modals/about-me/top-left-angle.webp');
const curriculumPDF = getAssetPath('/modals/about-me/Bechini-Mirko_CV.pdf');

function handleCurriculum() {
    window.open(curriculumPDF, '_blank');
}

const AboutMeModal = memo(function AboutMeModal() {
    const { about } = useAbout();

    return (
        <>
            {about && (
                <>
                    <h3 style={{ marginBottom: '1rem' }}>{about.title}</h3>
                    {about.paragraphs.map((paragraph, index) => (
                        <p key={index} style={{ marginBottom: '1rem' }}>{paragraph}</p>
                    ))}
                </>
            )}
            <img src={topLeftAngle} alt="top angle" className={styles['top-left-angle']} />
            <button aria-label="Scarica il curriculum vitae" className={styles['bottom-sprite']} onClick={handleCurriculum}>
                <img src={bottomSprite} alt="Scarica il curriculum vitae" />
            </button>
        </>
    );
});

export default AboutMeModal;