import monkeyModal from '/assets/modals/monkey-modal.png';

let currentFolder = null;

function setCurrentFolder(folder) {
    currentFolder = folder;
    // Trigger re-render if using a framework like React
}

function goBack() {
    currentFolder = null;
    // Trigger re-render if using a framework like React
}


const MODAL_DATA = [
    {
        id: 1,
        title: 'About Me',
        content: (<>
            <h3 style={{ marginBottom: '1rem' }}>Ciao sono Mirko</h3>
            <p style={{ marginBottom: '1rem' }}>Un sviluppatore web che ha arricchito le proprie competenze in Informatica,
                acquisite alle scuole superiori, conseguendo un Master in Web Development.</p>
            <p style={{ marginBottom: '1rem' }}>
                Le esperienze passate mi hanno permesso di acquisire importanti soft skills,
                come la capacità di lavorare in team, la gestione del tempo e la risoluzione di problemi
                in contesti critici.
            </p>
            <p style={{ marginBottom: '1rem' }}>
                Oltre alla programmazione sono appassionato al mondo dei videogiochi,
                da cui ho preso ispirazione per la realizzazione di questo portfolio.
            </p>
            <p style={{ marginBottom: '1rem' }}>

                Mi piace leggere i manga, guardare gli anime e allenarmi in palestra, tutte attività
                che mi aiutano ad affrontare le sfide quotidiane con grinta e perseveranza.
            </p>
        </>),
        theme: "monkey",
        picture: monkeyModal
    },
    {
        id: 2,
        title: 'Formazione & Competenze',
        content: (
            <>
                <div className="book">
                    <section className="page">
                        <h3>Competenze</h3>
                        <ul>
                            <li><strong>Frontend</strong>: HTML5, CSS3, JavaScript</li>
                            <li><strong>Backend</strong>: Node.js, Express, PHP</li>
                            <li><strong>Libraries</strong>: React, Axios</li>
                            <li><strong>Frameworks</strong>: React Router, Bootstrap, Laravel, Express</li>
                            <li><strong>Database</strong>: MySQL</li>
                            <li><strong>Version Control</strong>: Git, GitHub</li>
                            <li><strong>Tools</strong>: Blade, Vite, Postman, Figma</li>
                        </ul>
                    </section>
                    <section className="page">
                        <h3>Formazione</h3>
                        <ul>
                            <li>Master in Web Development - Boolean Careers</li>
                            <li>Diploma in Informatica - Istituto Tecnico Industriale</li>
                        </ul>
                    </section>
                </div>
            </>
        ),
        theme: "library",
        picture: "/assets/modals/library-modal.png"

    },
    {
        id: 3,
        title: 'Esperienze & Progetti',
        content: (
            <div className="desk-container">
                {!currentFolder ? (
                    <div className="folders-grid">
                        <div className="folder" onClick={() => setCurrentFolder('personali')}>
                            <div className="folder-icon">📂</div> {/* Icona cartella generica, sostituire con icona? */}
                            <span>Progetti Personali</span>
                        </div>
                        <div className="folder" onClick={() => setCurrentFolder('aziendaX')}>
                            <div className="folder-icon">📁</div>
                            <span>Esperienza Azienda X</span>
                        </div>
                    </div>
                ) : (
                    <div className="projects-view">
                        <button className="back-btn" onClick={goBack}>⬅ Torna alla Scrivania</button>
                        <div className="projects-grid">
                            <div className="project-blueprint">
                                <div className="blueprint-header">Progetti personali</div>
                                <h4>Nome App</h4>
                                <p>Un'applicazione per gestire la tana dei programmatori.</p>
                                <div className="tech-stack">#React #Vite #CSS3</div>

                                <a href="#" className="view-btn">Apri Documentazione</a>
                                <a href="#" className="view-btn">Vai al sito</a>
                            </div>
                            <div className="project-blueprint">
                                <div className="blueprint-header">Progetti personali</div>
                                <h4>Nome App</h4>
                                <p>Un'applicazione per gestire la tana dei programmatori.</p>
                                <div className="tech-stack">#React #Vite #CSS3</div>

                                <a href="#" className="view-btn">Apri Documentazione</a>
                                <a href="#" className="view-btn">Vai al sito</a>
                            </div>
                            <div className="project-blueprint">
                                <div className="blueprint-header">Progetti personali</div>
                                <h4>Nome App</h4>
                                <p>Un'applicazione per gestire la tana dei programmatori.</p>
                                <div className="tech-stack">#React #Vite #CSS3</div>

                                <a href="#" className="view-btn">Apri Documentazione</a>
                                <a href="#" className="view-btn">Vai al sito</a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ),
        theme: "desk",
        picture: "/assets/modals/desk-modal.png"
    },
    {
        id: 4,
        title: 'Certificazioni',
        content: (
            <div className="gallery-container">
                <div className="certificate-item">
                    <div className="frame">
                        <img src="/assets/certs/cert-web-dev.jpg" alt="Certificato Web Dev" />
                    </div>
                    <p>Master Web Development - specializzazione in PHP & Laravel @ Boolean</p>
                </div>
                <div className="certificate-item">
                    <div className="frame">
                        <img src="/assets/certs/cert-react.jpg" alt="Certificato React" />
                    </div>
                    <p>Corso online React @ Scrimba</p>
                </div>
                <div className="certificate-item">
                    <div className="frame">
                        <img src="/assets/certs/cert-typescript.jpg" alt="Certificato Typescript" />
                    </div>
                    <p>Corso online Typescript @ Scrimba</p>
                </div>
            </div>
        ),
        theme: "painting",
        picture: "/assets/modals/painting-modal.png"
    },
    {
        id: 5,
        title: 'Contatti',
        content: (
            <div className="contacts-container">
                <p className="contact-intro">Il pappagallo è pronto a volare! Come vuoi contattarmi?</p>
                <div className="contact-links">
                    <a href="mailto:mirkobechini@gmail.com" className="contact-card mail">
                        <span className="icon">✉️</span>
                        <span className="label">Email</span>
                    </a>
                    <a href="https://linkedin.com/in/www.linkedin.com/in/mirko-bechini-892202252" target="_blank" className="contact-card linkedin">
                        <span className="icon">🔗</span>
                        <span className="label">LinkedIn</span>
                    </a>
                    <a href="https://github.com/mirkobechini" target="_blank" className="contact-card github">
                        <span className="icon">💻</span>
                        <span className="label">GitHub</span>
                    </a>
                </div>
            </div>
        ),
        theme: "parrot",
        picture: "/assets/modals/parrot-modal.png"
    },
];

export default MODAL_DATA;