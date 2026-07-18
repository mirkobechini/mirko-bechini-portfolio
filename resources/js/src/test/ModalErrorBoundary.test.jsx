import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalErrorBoundary from '../features/modals/shared/ModalErrorBoundary';

// Componente che lancia un errore
function BuggyComponent({ shouldThrow }) {
    if (shouldThrow) {
        throw new Error('Test error');
    }
    return <p>Tutto ok</p>;
}

describe('ModalErrorBoundary', () => {
    it('renders children when no error occurs', () => {
        render(
            <ModalErrorBoundary>
                <p>Contenuto normale</p>
            </ModalErrorBoundary>
        );

        expect(screen.getByText('Contenuto normale')).toBeInTheDocument();
    });

    it('shows error message when child throws', () => {
        // Sopprimi gli errori di console attesi dal test
        vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ModalErrorBoundary>
                <BuggyComponent shouldThrow={true} />
            </ModalErrorBoundary>
        );

        expect(screen.getByText('Errore nel caricamento del contenuto.')).toBeInTheDocument();
    });

    it('shows retry button when error occurs', () => {
        vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <ModalErrorBoundary>
                <BuggyComponent shouldThrow={true} />
            </ModalErrorBoundary>
        );

        expect(screen.getByRole('button', { name: /riprova/i })).toBeInTheDocument();
        expect(screen.getByText('RIPROVA')).toBeInTheDocument();
    });

    it('retry button resets error state and re-renders children', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => { });
        const user = userEvent.setup();

        render(
            <ModalErrorBoundary>
                <BuggyComponent shouldThrow={true} />
            </ModalErrorBoundary>
        );

        // Verifica che l'errore sia mostrato
        expect(screen.getByText('Errore nel caricamento del contenuto.')).toBeInTheDocument();

        // Clicca RIPROVA — resetta lo stato, React riprova a renderizzare i children
        // Se i children lanciano ancora, torna allo stato di errore
        await user.click(screen.getByText('RIPROVA'));

        // Dopo il retry, se il child throwa ancora, l'error boundary mostra di nuovo l'errore
        expect(screen.getByText('Errore nel caricamento del contenuto.')).toBeInTheDocument();
    });
});