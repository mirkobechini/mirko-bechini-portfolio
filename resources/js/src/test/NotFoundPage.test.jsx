import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';

function renderPage() {
    return render(
        <MemoryRouter>
            <NotFoundPage />
        </MemoryRouter>
    );
}

describe('NotFoundPage', () => {
    it('renders 404 heading', () => {
        renderPage();
        expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('renders the error message', () => {
        renderPage();
        expect(screen.getByText(/OPS! QUESTA PAGINA NON ESISTE/i)).toBeInTheDocument();
    });

    it('renders the home button with correct aria-label', () => {
        renderPage();
        const button = screen.getByRole('button', { name: /torna alla home/i });
        expect(button).toBeInTheDocument();
    });

    it('renders the home button with text TORNA ALLA HOME', () => {
        renderPage();
        expect(screen.getByText('TORNA ALLA HOME')).toBeInTheDocument();
    });

    it('displays the link to return home suggested in the message', () => {
        renderPage();
        // Il testo contiene "PAGINA NON ESISTE", "LINK SBAGLIATO", "PAGINA SPOSTATA"
        expect(screen.getByText(/PAGINA NON ESISTE/i)).toBeInTheDocument();
        expect(screen.getByText(/LINK È SBAGLIATO/i)).toBeInTheDocument();
        expect(screen.getByText(/PAGINA.*SPOSTATA/i)).toBeInTheDocument();
    });
});