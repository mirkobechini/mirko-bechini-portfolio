import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectDetailView from '../features/modals/projects/components/ProjectDetailView';

const project = (overrides = {}) => ({
    id: 'p',
    title: 'Gods Backoffice',
    description: 'Prima riga.\nSeconda riga.',
    projectScope: 'work',
    type: 'backend',
    technologies: ['PHP', 'Laravel'],
    repo: 'https://github.com/mirkobechini/gods-backoffice',
    live: 'https://gods.example.com',
    stars: 7,
    updatedAt: '2026-10-12T10:00:00+00:00',
    course: 'Master web development',
    preview: '/storage/projects/previews/a.png',
    hasCustomPreview: true,
    ...overrides,
});

describe('ProjectDetailView', () => {
    it('mostra titolo, tipo e ambito, descrizione intera, stelle, data, corso e link', () => {
        render(<ProjectDetailView project={project()} onBack={() => { }} />);

        expect(screen.getByRole('heading', { name: 'Gods Backoffice' })).toBeInTheDocument();
        expect(screen.getByText('Backend · Lavoro')).toBeInTheDocument();
        expect(screen.getByText(/Prima riga\.\s*Seconda riga\./)).toBeInTheDocument();
        expect(screen.getByText('★ 7')).toBeInTheDocument();
        expect(screen.getByText('12 ottobre 2026')).toBeInTheDocument();
        expect(screen.getByText('Master web development')).toBeInTheDocument();
        expect(screen.getByText('Apri Documentazione')).toHaveAttribute('href', 'https://github.com/mirkobechini/gods-backoffice');
        expect(screen.getByText('Vai al sito')).toHaveAttribute('href', 'https://gods.example.com');
    });

    it('i link esterni si aprono in una nuova scheda in sicurezza', () => {
        render(<ProjectDetailView project={project()} onBack={() => { }} />);

        for (const name of ['Apri Documentazione', 'Vai al sito']) {
            const link = screen.getByText(name);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
    });

    it('le tecnologie non si ripetono nel dettaglio (sono già nella card)', () => {
        render(<ProjectDetailView project={project()} onBack={() => { }} />);

        expect(screen.queryByText(/#PHP/)).not.toBeInTheDocument();
        expect(screen.queryByText('Laravel')).not.toBeInTheDocument();
    });

    it("mostra l'anteprima grande solo se è stata caricata", () => {
        const { rerender } = render(<ProjectDetailView project={project()} onBack={() => { }} />);
        expect(screen.getByAltText('Anteprima di Gods Backoffice')).toHaveAttribute('src', '/storage/projects/previews/a.png');

        rerender(<ProjectDetailView project={project({ hasCustomPreview: false })} onBack={() => { }} />);
        expect(screen.queryByAltText('Anteprima di Gods Backoffice')).not.toBeInTheDocument();
    });

    it('nasconde ciò che manca: stelle a zero, data assente, corso assente, link non validi', () => {
        render(<ProjectDetailView project={project({ stars: 0, updatedAt: null, course: null, repo: '#', live: null })} onBack={() => { }} />);

        expect(screen.queryByText(/Stelle su GitHub/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Ultimo aggiornamento/)).not.toBeInTheDocument();
        expect(screen.queryByText('Corso')).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('una data non valida non rompe la pagina', () => {
        render(<ProjectDetailView project={project({ updatedAt: 'non-una-data' })} onBack={() => { }} />);

        expect(screen.queryByText(/Ultimo aggiornamento/)).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Gods Backoffice' })).toBeInTheDocument();
    });

    it('tipo e ambito sconosciuti non mostrano etichette strane', () => {
        render(<ProjectDetailView project={project({ type: 'altro', projectScope: undefined })} onBack={() => { }} />);

        expect(screen.queryByText(/undefined|altro/)).not.toBeInTheDocument();
    });

    it('il pulsante "Torna ai progetti" chiama onBack ed è il primo ad avere il focus', async () => {
        const onBack = vi.fn();
        render(<ProjectDetailView project={project()} onBack={onBack} />);

        const back = screen.getByRole('button', { name: /Torna ai progetti/ });
        expect(back).toHaveFocus();

        await userEvent.click(back);
        expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('è un articolo con il titolo come nome accessibile', () => {
        render(<ProjectDetailView project={project()} onBack={() => { }} />);

        expect(screen.getByRole('article', { name: 'Gods Backoffice' })).toBeInTheDocument();
    });

    it('senza descrizione non lascia un paragrafo vuoto', () => {
        const { container } = render(<ProjectDetailView project={project({ description: '' })} onBack={() => { }} />);

        expect(container.querySelectorAll('p').length).toBe(1); // solo "tipo · ambito"
    });
});
