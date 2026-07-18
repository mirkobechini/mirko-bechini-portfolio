import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

function TestComponent({ onNavigate, currentIndex = -1, totalItems = 0, mode = 'linear', columns = 1, enabled = true }) {
    useKeyboardNavigation({ currentIndex, onNavigate, totalItems, mode, columns, enabled });
    return <div data-testid="test-component">Test</div>;
}

describe('useKeyboardNavigation', () => {
    let onNavigate;

    beforeEach(() => {
        onNavigate = vi.fn();
    });

    afterEach(() => {
        // Pulisci la pressione dei tasti dopo ogni test
        document.body.innerHTML = '';
    });

    // --- Linear mode ---

    it('navigates forward with ArrowRight in linear mode', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={0} onNavigate={onNavigate} totalItems={5} mode="linear" />);

        await user.keyboard('{ArrowRight}');

        expect(onNavigate).toHaveBeenCalledWith(1);
    });

    it('navigates forward with ArrowDown in linear mode', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={2} onNavigate={onNavigate} totalItems={5} mode="linear" />);

        await user.keyboard('{ArrowDown}');

        expect(onNavigate).toHaveBeenCalledWith(3);
    });

    it('navigates backward with ArrowLeft in linear mode', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={2} onNavigate={onNavigate} totalItems={5} mode="linear" />);

        await user.keyboard('{ArrowLeft}');

        expect(onNavigate).toHaveBeenCalledWith(1);
    });

    it('wraps from last to first with ArrowRight', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={4} onNavigate={onNavigate} totalItems={5} mode="linear" />);

        await user.keyboard('{ArrowRight}');

        expect(onNavigate).toHaveBeenCalledWith(0);
    });

    it('wraps from first to last with ArrowLeft', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={0} onNavigate={onNavigate} totalItems={5} mode="linear" />);

        await user.keyboard('{ArrowLeft}');

        expect(onNavigate).toHaveBeenCalledWith(4);
    });

    it('starts at first when currentIndex is -1 and pressing ArrowRight', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={-1} onNavigate={onNavigate} totalItems={5} mode="linear" />);

        await user.keyboard('{ArrowRight}');

        expect(onNavigate).toHaveBeenCalledWith(0);
    });

    it('starts at last when currentIndex is -1 and pressing ArrowLeft', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={-1} onNavigate={onNavigate} totalItems={5} mode="linear" />);

        await user.keyboard('{ArrowLeft}');

        expect(onNavigate).toHaveBeenCalledWith(4);
    });

    // --- Grid mode ---

    it('moves to next row with ArrowDown in grid mode', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={0} onNavigate={onNavigate} totalItems={8} mode="grid" columns={4} />);

        await user.keyboard('{ArrowDown}');

        expect(onNavigate).toHaveBeenCalledWith(4);
    });

    it('moves to previous row with ArrowUp in grid mode', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={4} onNavigate={onNavigate} totalItems={8} mode="grid" columns={4} />);

        await user.keyboard('{ArrowUp}');

        expect(onNavigate).toHaveBeenCalledWith(0);
    });

    it('wraps ArrowDown to first row same column when at last row', async () => {
        const user = userEvent.setup();
        // 8 items, 4 cols = 2 righe. item 5 (index 5) è colonna 1, riga 1
        // ArrowDown dovrebbe andare a colonna 1, riga 0 = index 1
        render(<TestComponent currentIndex={5} onNavigate={onNavigate} totalItems={8} mode="grid" columns={4} />);

        await user.keyboard('{ArrowDown}');

        expect(onNavigate).toHaveBeenCalledWith(1);
    });

    it('wraps ArrowUp from first row to last row same column', async () => {
        const user = userEvent.setup();
        // 6 items, 4 cols. item 1 (index 1) colonna 1, riga 0
        // ArrowUp: last item in colonna 1 = index 5
        render(<TestComponent currentIndex={1} onNavigate={onNavigate} totalItems={6} mode="grid" columns={4} />);

        await user.keyboard('{ArrowUp}');

        expect(onNavigate).toHaveBeenCalledWith(5);
    });

    // --- Edge cases ---

    it('does not navigate when disabled', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={0} onNavigate={onNavigate} totalItems={5} enabled={false} />);

        await user.keyboard('{ArrowRight}');

        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('does not navigate when totalItems is 0', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={-1} onNavigate={onNavigate} totalItems={0} />);

        await user.keyboard('{ArrowRight}');

        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('does not call onNavigate for non-arrow keys', async () => {
        const user = userEvent.setup();
        render(<TestComponent currentIndex={0} onNavigate={onNavigate} totalItems={5} />);

        await user.keyboard('a{Enter} ');

        expect(onNavigate).not.toHaveBeenCalled();
    });

    it('does not navigate when typing in an input', async () => {
        const user = userEvent.setup();
        render(
            <div>
                <input data-testid="input" />
                <TestComponent currentIndex={0} onNavigate={onNavigate} totalItems={5} />
            </div>
        );

        const input = document.querySelector('input');
        input?.focus();
        await user.keyboard('{ArrowRight}');

        expect(onNavigate).not.toHaveBeenCalled();
    });
});