import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import GlobalContext, { GlobalContextProvider } from '../context/GlobalContext';

// Componente helper che legge il context
function TestConsumer() {
    const { activeSection, setActiveSection } = useContext(GlobalContext);

    return (
        <div>
            <p data-testid="active-section">{String(activeSection?.id ?? 'null')}</p>
            <button
                data-testid="set-section"
                onClick={() => setActiveSection({ id: 42, title: 'Test' })}
            >
                Set section
            </button>
            <button
                data-testid="clear-section"
                onClick={() => setActiveSection(null)}
            >
                Clear
            </button>
        </div>
    );
}

function renderProvider() {
    return render(
        <GlobalContextProvider>
            <TestConsumer />
        </GlobalContextProvider>
    );
}

describe('GlobalContextProvider', () => {
    it('provides activeSection initially as null', () => {
        renderProvider();
        expect(screen.getByTestId('active-section').textContent).toBe('null');
    });

    it('updates activeSection when setActiveSection is called', async () => {
        const user = userEvent.setup();
        renderProvider();

        await user.click(screen.getByTestId('set-section'));

        expect(screen.getByTestId('active-section').textContent).toBe('42');
    });

    it('clears activeSection when set to null', async () => {
        const user = userEvent.setup();
        renderProvider();

        // Prima setta un valore
        await user.click(screen.getByTestId('set-section'));
        expect(screen.getByTestId('active-section').textContent).toBe('42');

        // Poi lo resetta
        await user.click(screen.getByTestId('clear-section'));
        expect(screen.getByTestId('active-section').textContent).toBe('null');
    });

    it('memoizes context value to prevent unnecessary re-renders', () => {
        const renderCount = { count: 0 };
        function Counter() {
            useContext(GlobalContext);
            renderCount.count++;
            return null;
        }

        const { rerender } = render(
            <GlobalContextProvider>
                <Counter />
            </GlobalContextProvider>
        );

        // Re-render del provider senza cambiare state
        rerender(
            <GlobalContextProvider>
                <Counter />
            </GlobalContextProvider>
        );

        // useMemo fa sì che il conteggio non aumenti
        expect(renderCount.count).toBe(2);
    });
});