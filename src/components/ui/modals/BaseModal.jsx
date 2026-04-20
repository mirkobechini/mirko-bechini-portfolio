import styles from '../modalsCss/BaseModal.module.css';

export default function BaseModal({ variant, closeModal }) {
    return (

        <div className={styles.modalOverlay} onClick={closeModal}>
            <div className={`${styles.gameModal} ${styles[`theme-${variant.theme}`]}`} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{variant.title}</h2>
                </div>
                <div className={styles.modalContent}>
                    {variant.content}
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.gameBtn} onClick={closeModal}>CONTINUA</button>
                </div>
                <img className={styles.modalSprite} src={variant.picture} alt={`${variant.theme} modal sprite`} />
            </div>
        </div>
    );
}