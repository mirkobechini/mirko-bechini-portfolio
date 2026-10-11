import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectsMessage from '../features/modals/projects/components/ProjectsMessage';

describe('ProjectsMessage', () => {
    it('mostra il contenuto', () => {
        render(<ProjectsMessage><p>Ciao</p></ProjectsMessage>);

        expect(screen.getByText('Ciao')).toBeInTheDocument();
    });

    it('di default usa la variante info (senza classe error)', () => {
        render(<ProjectsMessage><p>Ciao</p></ProjectsMessage>);

        const box = screen.getByText('Ciao').parentElement;
        expect(box).toHaveClass('message');
        expect(box).not.toHaveClass('error');
    });

    it('con variant="error" aggiunge la classe error', () => {
        render(<ProjectsMessage variant="error"><p>Errore</p></ProjectsMessage>);

        expect(screen.getByText('Errore').parentElement).toHaveClass('message', 'error');
    });

    it('espone il role quando viene passato', () => {
        render(<ProjectsMessage role="status">Aggiornamento</ProjectsMessage>);

        expect(screen.getByRole('status')).toHaveTextContent('Aggiornamento');
    });
});
