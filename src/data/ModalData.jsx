import monkeyModal from '/assets/modals/monkey-modal.png';


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
                    <section className="page left-page">
                        <h3>Competenze</h3>
                        <ul>
                            <li><strong>Frontend</strong>: HTML5, CSS3, JavaScript</li>
                            <li><strong>Backend</strong>: Node.js, Express, PHP</li>
                            <li><strong>Frameworks</strong>: React, Laravel</li>
                            <li><strong>Database</strong>: MySQL</li>
                            <li><strong>Version Control</strong>: Git, GitHub</li>
                        </ul>
                    </section>
                    <section className="page right-page">
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
        content: 'lorem',
        theme: "desk",
        picture: "/assets/modals/desk-modal.png"
    },
    {
        id: 4,
        title: 'Certificazioni',
        content: 'lorem',
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