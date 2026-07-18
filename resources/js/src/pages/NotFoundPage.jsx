import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.glitch}>
                404
            </div>

            <p className={styles.message}>
                OPS! QUESTA PAGINA NON ESISTE.
                <br />
                FORSE IL LINK È SBAGLIATO O LA PAGINA
                <br />
                È STATA SPOSTATA.
            </p>

            <button
                onClick={() => navigate('/')}
                className={styles['btn-home']}
                aria-label="Torna alla home"
            >
                TORNA ALLA HOME
            </button>
        </div>
    );
}