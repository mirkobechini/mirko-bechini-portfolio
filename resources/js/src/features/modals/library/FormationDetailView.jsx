import { memo } from 'react';
import styles from './FormationDetailView.module.css';

const FormationDetailView = memo(function FormationDetailView({ education, page = 1, onSkillTagClick }) {
    if (page === 1) {
        return (
            <div className={styles['detail-page']}>
                <div className={styles['detail-scroll']}>
                    <div className={styles['detail-meta']}>
                        <a href={education.organizationUrl} target="_blank" rel="noopener noreferrer" className={styles['detail-org-link']}>
                            {education.organization}
                        </a>
                        <span className={styles['detail-period']}>{education.period}</span>
                    </div>
                    <p className={styles['detail-description']}>{education.description}</p>

                    {education.highlights && education.highlights.length > 0 && (
                        <section>
                            <h5 className={styles['detail-section-label']}>Punti salienti</h5>
                            <ul className={styles['highlights-list']}>
                                {education.highlights.map((hl, i) => (
                                    <li key={i} className={styles['highlight-item']}>{hl}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        );
    }

    /* page === 2 */
    return (
        <div className={styles['detail-page']}>
            <div className={styles['detail-scroll']}>
                {education.modules && education.modules.length > 0 && (
                    <section>
                        <h5 className={styles['detail-section-label']}>Moduli del corso</h5>
                        <ul className={styles['modules-list']}>
                            {education.modules.map((mod, i) => (
                                <li key={i} className={styles['module-card']}>
                                    <h6 className={styles['module-title']}>{mod.title}</h6>
                                    <p className={styles['module-description']}>{mod.description}</p>
                                    <div className={styles['module-skills']}>
                                        {mod.skillsModules.map((skill, j) => (
                                            <span key={j}
                                                className={styles['module-skill-tag']}
                                                role={onSkillTagClick ? 'button' : undefined}
                                                tabIndex={onSkillTagClick ? 0 : undefined}
                                                onClick={onSkillTagClick ? () => onSkillTagClick(skill, education) : undefined}
                                                onKeyDown={onSkillTagClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSkillTagClick(skill, education); } } : undefined}
                                                style={onSkillTagClick ? { cursor: 'var(--cursor-nes-pointer)' } : undefined}
                                            >{skill}</span>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {education.skills && education.skills.length > 0 && (
                    <section>
                        <h5 className={styles['detail-section-label']}>Competenze acquisite</h5>
                        <div className={styles['detail-skills-row']}>
                            {education.skills.map((skill, i) => (
                                <span key={i}
                                    className={styles['detail-skill-tag']}
                                    role={onSkillTagClick ? 'button' : undefined}
                                    tabIndex={onSkillTagClick ? 0 : undefined}
                                    onClick={onSkillTagClick ? () => onSkillTagClick(skill, education) : undefined}
                                    onKeyDown={onSkillTagClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSkillTagClick(skill, education); } } : undefined}
                                    style={onSkillTagClick ? { cursor: 'var(--cursor-nes-pointer)' } : undefined}
                                >{skill}</span>
                            ))}
                        </div>
                    </section>
                )}

                {education.certificate && education.organizationUrl && (
                    <a
                        href={education.certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles['detail-certificate-link']}
                    >
                        Vedi certificato
                    </a>
                )}
            </div>
        </div>
    );
});

export default FormationDetailView;