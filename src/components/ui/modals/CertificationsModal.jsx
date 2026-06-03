import styles from '../modalsCss/CertificationsModal.module.css';
import certificationData from '../../../data/certificationData';
import { memo } from 'react';
import { isValidLink } from '../../../utils/links';

const CertificationsModal = memo(function CertificationsModal() {

    return (
        <div className={styles['gallery-container']}>

            {
                certificationData.map(cert => (

                    <div className={styles['certificate-item']} key={cert.id}>
                        <div className={styles.frame}>
                            <img src={cert.preview} alt={cert.title} loading="lazy" decoding="async" width={cert.previewWidth ?? 1320} height={cert.previewHeight ?? 840} /> {/* Ottimizzazione del caricamento dell'immagine */}
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