import styles from './CertificationsModal.module.css';
import certificationData from './certificationData';
import { memo } from 'react';
import { isValidLink } from '../../../utils/links';

const CertificationsModal = memo(function CertificationsModal({ openModal }) {

    function handleCertClick(certId) {
        // TODO: Navigate to the specific formation modal for this certification
        openModal(2);
    }

    return (
        <div className={styles['gallery-container']}>

            {
                certificationData.map(cert => (

                    <div className={styles['certificate-item']} key={cert.id}>
                        <div className={styles.frame} onClick={() => handleCertClick(cert.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCertClick(cert.id); }}>
                            <img src={cert.preview} alt={cert.title} loading="lazy" decoding="async" width={cert.previewWidth ?? 1320} height={cert.previewHeight ?? 840} />
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