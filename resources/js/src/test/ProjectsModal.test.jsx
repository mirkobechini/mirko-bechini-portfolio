import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectsModal from '../features/modals/projects/ProjectsModal';
import useGithubProjects from '../hooks/useGithubProjects';

// Il hook è già testato a parte: qui lo sostituiamo per controllare cosa riceve la modal
vi.mock('../hooks/useGithubProjects', () => ({ default: vi.fn() }));
vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));

const makeProject = (overrides = {}) => ({
    id: 'p1',
    title: 'Progetto Uno',
    description: 'Descrizione uno',
    technologies: ['React'],
    type: 'frontend',
    projectScope: 'personal',
    repo: 'https://github.com/mirkobechini/p1',
    live: '#',
    ...overrides,
});

// Imposta quello che il hook "restituisce" in un test
function mockHook({ projects = [], loading = false, error = null } = {}) {
    useGithubProjects.mockReturnValue({ projects, loading, error, refetch: vi.fn() });
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('ProjectsModal', () => {
    // 1. Caricamento
    it('mostra il messaggio di caricamento mentre i progetti arrivano', () => {
        mockHook({ loading: true });

        render(<ProjectsModal onBackToProjectsHome={vi.fn()} />);

        expect(screen.getByText('Caricamento progetti...')).toBeInTheDocument();
    });

    // 2. Caso normale
    it('mostra una card per ogni progetto', () => {
        mockHook({
            projects: [makeProject(), makeProject({ id: 'p2', title: 'Progetto Due' })],
        });

        render(<ProjectsModal onBackToProjectsHome={vi.fn()} />);

        expect(screen.getByText('Progetto Uno')).toBeInTheDocument();
        expect(screen.getByText('Progetto Due')).toBeInTheDocument();
    });

    // 3. Errore API ma con progetti (stale o fallback): devono comparire comunque
    it('con errore ma con progetti disponibili mostra comunque la griglia', () => {
        mockHook({ projects: [makeProject()], error: 'Impossibile caricare i progetti da GitHub.' });

        render(<ProjectsModal onBackToProjectsHome={vi.fn()} />);

        expect(screen.getByText('Progetto Uno')).toBeInTheDocument();
        expect(screen.getByRole('status')).toHaveTextContent(/non aggiornati/);
    });

    it('mentre ricarica mostra i progetti già disponibili invece del caricamento', () => {
        mockHook({ projects: [makeProject()], loading: true });

        render(<ProjectsModal onBackToProjectsHome={vi.fn()} />);

        expect(screen.getByText('Progetto Uno')).toBeInTheDocument();
        expect(screen.queryByText('Caricamento progetti...')).not.toBeInTheDocument();
    });

    // 4. Errore senza nessun dato
    it("con errore e senza progetti mostra l'errore e l'invito a riprovare", () => {
        mockHook({ projects: [], error: 'Impossibile caricare i progetti da GitHub.' });

        render(<ProjectsModal onBackToProjectsHome={vi.fn()} />);

        expect(screen.getByText('Impossibile caricare i progetti da GitHub.')).toBeInTheDocument();
        expect(screen.getByText(/Riprova più tardi/)).toBeInTheDocument();
    });

    // 5. Lista vuota senza errore
    it('senza progetti e senza errore mostra "Nessun progetto trovato"', () => {
        mockHook({ projects: [] });

        render(<ProjectsModal onBackToProjectsHome={vi.fn()} />);

        expect(screen.getByText(/Nessun progetto trovato/)).toBeInTheDocument();
    });

    // 6. Filtri
    it('il filtro per tipo nasconde i progetti di altri tipi', async () => {
        const user = userEvent.setup();
        mockHook({
            projects: [
                makeProject({ id: 'f', title: 'Sito Frontend', type: 'frontend' }),
                makeProject({ id: 'b', title: 'API Backend', type: 'backend' }),
            ],
        });

        render(<ProjectsModal onBackToProjectsHome={vi.fn()} />);
        expect(screen.getByText('API Backend')).toBeInTheDocument();

        await user.click(screen.getByText('Frontend'));

        expect(screen.getByText('Sito Frontend')).toBeInTheDocument();
        expect(screen.queryByText('API Backend')).not.toBeInTheDocument();
    });

    // 7. Pulsante indietro
    it('il pulsante "Torna indietro" chiama onBackToProjectsHome', async () => {
        const user = userEvent.setup();
        const onBack = vi.fn();
        mockHook({ projects: [makeProject()] });

        render(<ProjectsModal onBackToProjectsHome={onBack} />);
        await user.click(screen.getByText('Torna indietro'));

        expect(onBack).toHaveBeenCalledTimes(1);
    });
});
