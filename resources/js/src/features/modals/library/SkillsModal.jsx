import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './SkillsModal.module.css';
import defaultSkillsData from './skillsData';
import { useKeyboardNavigation } from '../../../hooks/useKeyboardNavigation';
import SkillsGridView from './SkillsGridView';
import SkillDetailView from './SkillDetailView';
import FormationView from './FormationView';
import playBookFlip from '../../../utils/playBookFlip';

const SKILL_COLUMNS_DESKTOP = 4;
const SKILL_COLUMNS_MOBILE = 3;
const MOBILE_BREAKPOINT = 768;

const SkillsModal = memo(function SkillsModal({ profile, onBackToBookshelf, onSwitchToSkill, onBackToFormation, preselectSkill, returnToEducation }) {
    const currentProfile = profile ?? {
        id: 'skills',
        title: 'Competenze',
        enableKeyboardNavigation: true,
        skillsData: defaultSkillsData,
    };

    const skillsData = useMemo(() => currentProfile.skillsData ?? [], [currentProfile.skillsData]);
    const educationData = currentProfile.educationData ?? [];
    const formationFocus = currentProfile.formationFocus ?? [];
    const formationRoadmap = currentProfile.formationRoadmap ?? [];
    const isSkillsProfile = currentProfile.id === 'skills';
    const isFormationProfile = currentProfile.id === 'formation';
    const profileVariantClass = isFormationProfile ? styles['book-formation'] : styles['book-skills'];

    const [currentSkill, setCurrentSkill] = useState(null);
    const skillCardRefs = useRef([]);
    const [skillColumns, setSkillColumns] = useState(
        window.innerWidth < MOBILE_BREAKPOINT ? SKILL_COLUMNS_MOBILE : SKILL_COLUMNS_DESKTOP
    );

    /* Rileva il numero di colonne in base alla larghezza viewport */
    useEffect(() => {
        function handleResize() {
            setSkillColumns(
                window.innerWidth < MOBILE_BREAKPOINT ? SKILL_COLUMNS_MOBILE : SKILL_COLUMNS_DESKTOP
            );
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    /* Auto-select skill when coming from formation tag */
    useEffect(() => {
        if (isSkillsProfile && preselectSkill) {
            const found = skillsData.find(
                (s) => s.skill.toLowerCase() === preselectSkill.toLowerCase()
            );
            if (found) setCurrentSkill(found);
        }
    }, [preselectSkill, isSkillsProfile, skillsData]);

    const handleSkillClick = (skill) => {
        setCurrentSkill(skill);
        playBookFlip();
    };

    const handleHomeClick = () => {
        onBackToBookshelf?.();
        playBookFlip();
    };

    useEffect(() => {
        if (currentSkill == null) return;

        const currentIndex = skillsData.findIndex((skill) => skill.id === currentSkill.id);
        const activeCard = skillCardRefs.current[currentIndex];

        if (currentIndex >= 0 && document.activeElement !== activeCard) {
            activeCard?.focus({ preventScroll: true });
        }
    }, [currentSkill, skillsData]);

    const currentSkillIndex = currentSkill == null
        ? -1
        : skillsData.findIndex((skill) => skill.id === currentSkill.id);

    const handleSkillNavigate = useCallback((nextIndex) => {
        setCurrentSkill(skillsData[nextIndex]);
        playBookFlip();
    }, [skillsData]);

    useKeyboardNavigation({
        currentIndex: currentSkillIndex,
        onNavigate: handleSkillNavigate,
        totalItems: skillsData.length,
        mode: 'grid',
        columns: skillColumns,
        enabled: currentProfile.enableKeyboardNavigation && isSkillsProfile && skillsData.length > 0,
    });

    return (
        <div className={`${styles.book} ${profileVariantClass}`} data-profile={currentProfile.id}>
            {onBackToBookshelf && (
                <button type="button" className={styles['btn-home']} onClick={handleHomeClick} aria-label="Torna alla libreria">
                    Home
                </button>
            )}

            {isSkillsProfile && (
                <SkillsGridView
                    skillsData={skillsData}
                    currentSkill={currentSkill}
                    skillCardRefs={skillCardRefs}
                    onSkillClick={handleSkillClick}
                    title={currentProfile.title}
                    onBackToFormation={onBackToFormation}
                    returnToEducation={returnToEducation}
                />
            )}

            {isSkillsProfile && (
                <SkillDetailView
                    currentSkill={currentSkill}
                    detailsTitle={currentProfile.detailsTitle}
                />
            )}

            {isFormationProfile && (
                <FormationView
                    currentProfile={currentProfile}
                    educationData={educationData}
                    formationFocus={formationFocus}
                    formationRoadmap={formationRoadmap}
                    onSwitchToSkill={onSwitchToSkill}
                    returnToEducation={returnToEducation}
                />
            )}

            {!isSkillsProfile && !isFormationProfile && (
                <section className={styles.page}>
                    <h3>Profilo non disponibile</h3>
                </section>
            )}
        </div>
    );
});

export default SkillsModal;
