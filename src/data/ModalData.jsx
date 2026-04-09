import monkeyModal from '/assets/modals/monkey-modal.png';


const MODAL_DATA = [
    {
        id: 1,
        title: 'Ciao sono Mirko',
        content: (<>
            <p style={{ marginBottom: '1rem' }}>Un sviluppatore web che ha arricchito le proprie competenze in Informatica,
                acquisite alle scuole superiori, conseguendo un Master in Web Development.</p>
            <p style={{ marginBottom: '1rem' }}>
                Le mie esperienze passate mi hanno permesso di acquisire importanti soft skills,
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
        content: 'lorem',
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
        content: 'lorem',
        theme: "parrot",
        picture: "/assets/modals/parrot-modal.png"
    },
];

export default MODAL_DATA;