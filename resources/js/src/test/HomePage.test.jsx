import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));
vi.mock('../utils/preloadImages', () => ({ preloadImages: vi.fn() }));
vi.mock('../utils/playMonkeySound', () => ({ playMonkeyHover: vi.fn(), playMonkeyClick: vi.fn() }));
vi.mock('../utils/playParrotSound', () => ({ playParrotHover: vi.fn(), playParrotClick: vi.fn() }));
vi.mock('../hooks/useDragScroll', () => ({
    useDragScroll: () => ({
        hasMoved: false, handleGrab: vi.fn(), handleLeave: vi.fn(), handleMovement: vi.fn(),
        handleTouchStart: vi.fn(), handleTouchMove: vi.fn(), centerBackground: vi.fn(), isDragging: { current: false },
    }),
}));
vi.mock('../features/modals/shared/BaseModal', () => ({
    default: function MockBaseModal({ variant }) { return <div data-testid="base-modal">{variant.title}</div>; },
}));
vi.mock('../components/ui/ScrollGuideIndicators', () => ({
    default: () => <div data-testid="scroll-guide" />,
}));
vi.mock('../data/spriteConfig', () => ({
    default: [
        { id: 1, src: '/monkey.webp', className: 'monkey', label: 'Chi Sono', ariaLabel: 'Sezione Chi Sono', title: 'About me', alt: 'Scimmia', fetchPriority: 'high', loading: 'eager', width: 480, height: 550 },
        { id: 2, src: '/book.webp', className: 'library', label: 'Formazione', ariaLabel: 'Sezione Formazione', title: 'Formation', alt: 'Libreria', fetchPriority: 'low', loading: 'lazy', width: 572, height: 538 },
        { id: 5, src: '/parrot.webp', className: 'parrot', label: 'Contatti', ariaLabel: 'Sezione Contatti', title: 'Contacts', alt: 'Pappagallo', fetchPriority: 'low', loading: 'lazy', width: 471, height: 538 },
    ],
}));
vi.mock('../features/modals/modalRegistry', () => ({
    default: [
        { id: 1, title: 'About Me', theme: 'monkey', componentKey: 'aboutMe', sprite: null },
        { id: 2, title: 'Formazione', theme: 'library', componentKey: 'bookshelf', sprite: '/book.webp' },
        { id: 5, title: 'Contatti', theme: 'parrot', componentKey: 'contacts', sprite: null },
    ],
}));
import HomePage from '../pages/HomePage';
import { GlobalContextProvider } from '../context/GlobalContext';

function renderHomePage() {
    return render(
        <GlobalContextProvider>
            <HomePage />
        </GlobalContextProvider>
    );
}

describe('HomePage', () => {
    it('renders sprite buttons', () => {
        renderHomePage();
        expect(screen.getByLabelText('Sezione Chi Sono')).toBeInTheDocument();
        expect(screen.getByLabelText('Sezione Formazione')).toBeInTheDocument();
        expect(screen.getByLabelText('Sezione Contatti')).toBeInTheDocument();
    });

    it('renders sprite labels', () => {
        renderHomePage();
        expect(screen.getByText('Chi Sono')).toBeInTheDocument();
        expect(screen.getByText('Formazione')).toBeInTheDocument();
    });

    it('renders background image', () => {
        renderHomePage();
        const img = screen.getByAltText('Monkey Den');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/assets/backgrounds/den.webp');
    });

    it('renders ScrollGuideIndicators', () => {
        renderHomePage();
        expect(screen.getByTestId('scroll-guide')).toBeInTheDocument();
    });

    it('opens modal when clicking a sprite button', async () => {
        const user = userEvent.setup();
        renderHomePage();
        await user.click(screen.getByLabelText('Sezione Chi Sono'));
        expect(screen.getByTestId('base-modal')).toBeInTheDocument();
        expect(screen.getByText('About Me')).toBeInTheDocument();
    });

    it('plays monkey click sound on About Me', async () => {
        const { playMonkeyClick } = await import('../utils/playMonkeySound');
        const user = userEvent.setup();
        renderHomePage();
        await user.click(screen.getByLabelText('Sezione Chi Sono'));
        expect(playMonkeyClick).toHaveBeenCalled();
    });

    it('plays parrot click sound on Contatti', async () => {
        const { playParrotClick } = await import('../utils/playParrotSound');
        const user = userEvent.setup();
        renderHomePage();
        await user.click(screen.getByLabelText('Sezione Contatti'));
        expect(playParrotClick).toHaveBeenCalled();
    });

    it('triggers preload on mouse enter', async () => {
        const { preloadImages } = await import('../utils/preloadImages');
        const user = userEvent.setup();
        renderHomePage();
        await user.hover(screen.getByLabelText('Sezione Formazione'));
        expect(preloadImages).toHaveBeenCalled();
    });

    it('plays monkey hover sound on mouse enter', async () => {
        const { playMonkeyHover } = await import('../utils/playMonkeySound');
        const user = userEvent.setup();
        renderHomePage();
        await user.hover(screen.getByLabelText('Sezione Chi Sono'));
        expect(playMonkeyHover).toHaveBeenCalled();
    });
});