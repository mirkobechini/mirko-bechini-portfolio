import styles from '../modalsCss/CertificationsModal.module.css';
import certificationData from '../../../data/certificationData';

export default function CertificationsModal() {

    return (
        <div className={styles.galleryContainer}>

            {
                certificationData.map(cert => (

                    <div className={styles.certificateItem}>
                        <div className={styles.frame}>
                            <img src={cert.preview} alt={cert.title} />
                        </div>
                        <p>{cert.title} @ <a className="" href={cert.url} >{cert.organization}</a></p>
                    </div>
                ))
            }
        </div>
    );
}