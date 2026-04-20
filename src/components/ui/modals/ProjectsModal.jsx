import styles from '../modalsCss/ProjectsModal.module.css';
import { useEffect, useState } from 'react';

export default function ProjectsModal() {
    const [currentFolder, setCurrentFolder] = useState(null);
    
    useEffect(() => {

    }, [currentFolder]);


    function handleSetCurrentFolder(folder) {
        setCurrentFolder(folder);
    }

    function goBack() {
        setCurrentFolder(null);
    }


    return (
        <div className={styles.deskContainer}>
            {!currentFolder ? (
                //TODO: Inserire dei label? in alto per filtrare i progetti (frontend,backend,fullstack), (aziende), (personali)
                <div className={styles.foldersGrid}>
                    <div className={styles.folder} onClick={() => handleSetCurrentFolder('personali')}>
                        <div className={styles.folderIcon}>📂</div> {/* Icona cartella generica, sostituire con icona? */}
                        <span>Progetti Personali</span>
                    </div>
                    <div className={styles.folder} onClick={() => handleSetCurrentFolder('aziendaX')}>
                        <div className={styles.folderIcon}>📁</div>
                        <span>Esperienza Azienda X</span>
                    </div>
                </div>
            ) : (
                <div className={styles.projectsView}>
                    <button className={styles.backBtn} onClick={goBack}>⬅ Torna alla Scrivania</button>
                    <div className={styles.projectsGrid}>
                        <div className={styles.projectBlueprint}>
                            <div className={styles.blueprintHeader}>Progetti personali</div>
                            <h4>Nome App</h4>
                            <p>Un'applicazione per gestire la tana dei programmatori.</p>
                            <div className={styles.techStack}>#React #Vite #CSS3</div>

                            <a href="#" className={styles.viewBtn}>Apri Documentazione</a>
                            <a href="#" className={styles.viewBtn}>Vai al sito</a>
                        </div>
                        <div className={styles.projectBlueprint}>
                            <div className={styles.blueprintHeader}>Progetti personali</div>
                            <h4>Nome App</h4>
                            <p>Un'applicazione per gestire la tana dei programmatori.</p>
                            <div className={styles.techStack}>#React #Vite #CSS3</div>

                            <a href="#" className={styles.viewBtn}>Apri Documentazione</a>
                            <a href="#" className={styles.viewBtn}>Vai al sito</a>
                        </div>
                        <div className={styles.projectBlueprint}>
                            <div className={styles.blueprintHeader}>Progetti personali</div>
                            <h4>Nome App</h4>
                            <p>Un'applicazione per gestire la tana dei programmatori.</p>
                            <div className={styles.techStack}>#React #Vite #CSS3</div>

                            <a href="#" className={styles.viewBtn}>Apri Documentazione</a>
                            <a href="#" className={styles.viewBtn}>Vai al sito</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}