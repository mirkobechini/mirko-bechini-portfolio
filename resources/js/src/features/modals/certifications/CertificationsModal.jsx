import styles from './CertificationsModal.module.css';
import useCertifications from '../../../hooks/useCertifications';
import { memo, useCallback, useMemo, useState } from 'react';
import { isValidLink } from '../../../utils/links';

const CertificationsModal = memo(function CertificationsModal({ openModal }) {

    const { certifications } = useCertifications();

    // Un'immagine che non si carica (file sparito, indirizzo sbagliato) toglie la sua tessera: una tessera
    // vuota con il titolo e nessun attestato da vedere sarebbe peggio di niente.
    const [brokenIds, setBrokenIds] = useState(() => new Set());
    const markBroken = useCallback((id) => setBrokenIds((current) => new Set(current).add(id)), []);
    const visible = useMemo(
        () => certifications.filter((cert) => cert.preview && !brokenIds.has(cert.id)),
        [certifications, brokenIds]
    );

    // Si apre il corso collegato all'attestato (courseId), non l'attestato stesso
    function handleCertClick(courseId) {
        if (courseId == null) return;
        openModal(2, { preselectEducation: courseId });
    }

    return (
        <div className={styles['gallery-container']}>

            {
                visible.map(cert => (

                    <div className={styles['certificate-item']} key={cert.id}>
                        <div className={styles.frame} onClick={() => handleCertClick(cert.courseId)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCertClick(cert.courseId); }}>
                            <img src={cert.preview} alt={cert.title} loading="lazy" decoding="async" onError={() => markBroken(cert.id)} width={cert.previewWidth ?? 1320} height={cert.previewHeight ?? 840} />
                        </div>
                        <p>
                            {cert.title} @ {isValidLink(cert.organizationUrl)
                                ? <a href={cert.organizationUrl} target="_blank" rel="noopener noreferrer">{cert.organization}</a>
                                : cert.organization}
                        </p>
                    </div>
                ))
            }
        </div>
    );
});

export default CertificationsModal;