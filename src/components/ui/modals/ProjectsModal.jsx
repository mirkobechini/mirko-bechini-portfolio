import styles from '../modalsCss/ProjectsModal.module.css';

export default function ProjectsModal() {
    let currentFolder = null;
    
    function setCurrentFolder(folder) {
        currentFolder = folder;
        // Trigger re-render if using a framework like React
    }
    
    function goBack() {
        currentFolder = null;
        // Trigger re-render if using a framework like React
    }


    return (
        <div className={styles.deskContainer}>
            {!currentFolder ? (
                <div className={styles.foldersGrid}>
                    <div className={styles.folder} onClick={() => setCurrentFolder('personali')}>
                        <div className={styles.folderIcon}>📂</div> {/* Icona cartella generica, sostituire con icona? */}
                        <span>Progetti Personali</span>
                    </div>
                    <div className={styles.folder} onClick={() => setCurrentFolder('aziendaX')}>
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