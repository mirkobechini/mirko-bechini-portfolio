import styles from '../modalsCss/CertificationsModal.module.css';

export default function CertificationsModal() {
    return (
        <div className={styles.galleryContainer}>
            <div className={styles.certificateItem}>
                <div className={styles.frame}>
                    <img src="/assets/certs/cert-web-dev.jpg" alt="Certificato Web Dev" />
                </div>
                <p>Master Web Development - specializzazione in PHP & Laravel @ Boolean</p>
            </div>
            <div className={styles.certificateItem}>
                <div className={styles.frame}>
                    <img src="/assets/certs/cert-react.jpg" alt="Certificato React" />
                </div>
                <p>Corso online React @ Scrimba</p>
            </div>
            <div className={styles.certificateItem}>
                <div className={styles.frame}>
                    <img src="/assets/certs/cert-typescript.jpg" alt="Certificato Typescript" />
                </div>
                <p>Corso online Typescript @ Scrimba</p>
            </div>
        </div>
    );
}