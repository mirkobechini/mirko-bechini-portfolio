import styles from '../modalsCss/CertificationsModal.module.css';
import certificationData from '../../../data/certificationData';
import { memo } from 'react';

const CertificationsModal = memo(function CertificationsModal() {

    return (
        <div className={styles.galleryContainer}>

            {
                certificationData.map(cert => (

                    <div className={styles.certificateItem} key={cert.id}>
                        <div className={styles.frame}>
                            <img src={cert.preview} alt={cert.title} loading="lazy" decoding="async" /> {/* Ottimizzazione del caricamento dell'immagine */}
                        </div>
                        <p>{cert.title} @ <a className="" href={cert.organizationUrl} target="_blank" rel="noopener noreferrer">{cert.organization}</a></p>
                    </div>
                ))
            }
        </div>
    );
});

export default CertificationsModal;