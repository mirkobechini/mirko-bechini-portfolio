import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// CSS mocks
vi.mock('nes.css/css/nes.min.css', () => ({}));
vi.mock('../styles/global.css', () => ({}));
vi.mock('../styles/home.css', () => ({}));
vi.mock('../styles/responsive.css', () => ({}));

// Mock App
vi.mock('../App', () => ({
    default: () => 'App Component',
}));

// Mock react-dom/client — usa vi.hoisted per variabili accessibili al factory
const { createRootMock, renderMock } = vi.hoisted(() => {
    const render = vi.fn();
    const createRoot = vi.fn(() => ({ render }));
    return { createRootMock: createRoot, renderMock: render };
});

vi.mock('react-dom/client', () => ({
    createRoot: createRootMock,
}));

describe('main.jsx', () => {
    beforeEach(() => {
        vi.resetModules();
        document.body.innerHTML = '<div id="root"></div>';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('calls createRoot with root element', async () => {
        await import('../main');

        expect(createRootMock).toHaveBeenCalled();
        expect(createRootMock).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'root' })
        );
    });

    it('calls render on the root', async () => {
        await import('../main');

        expect(renderMock).toHaveBeenCalled();
    });

    it('has root element in DOM', () => {
        const root = document.getElementById('root');
        expect(root).toBeInTheDocument();
        expect(root.tagName).toBe('DIV');
    });
});