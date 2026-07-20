import { describe, it, expect } from 'vitest';
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
        function Counter({ onRender }) {
            useContext(GlobalContext);
            onRender();
            return null;
        }

        let count = 0;
        const onRender = () => { count++; };

        const { rerender } = render(
            <GlobalContextProvider>
                <Counter onRender={onRender} />
            </GlobalContextProvider>
        );

        rerender(
            <GlobalContextProvider>
                <Counter onRender={onRender} />
            </GlobalContextProvider>
        );

        expect(count).toBe(2);
    });
});