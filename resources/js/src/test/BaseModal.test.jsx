import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock lazy-loaded modal components
vi.mock('../features/modals/about/AboutMeModal', () => ({
    default: function MockModal() {
        return <div data-testid="modal-content">About Me Content</div>;
    },
}));
vi.mock('../features/modals/library/BookshelfModal', () => ({
    default: function MockModal() { return <div data-testid="modal-content">Bookshelf Content</div>; },
}));
vi.mock('../features/modals/projects/ProjectExperienceModal', () => ({
    default: function MockModal() { return <div data-testid="modal-content">Projects Content</div>; },
}));
vi.mock('../features/modals/certifications/CertificationsModal', () => ({
    default: function MockModal() { return <div data-testid="modal-content">Certifications Content</div>; },
}));
vi.mock('../features/modals/contacts/ContactsModal', () => ({
    // Ha un pulsante interno (per il focus trap) che cambia lo sprite (per setModalSprite)
    default: function MockModal({ setModalSprite }) {
        return (
            <div data-testid="modal-content">
                Contacts Content
                <button onClick={() => setModalSprite('/new-sprite.webp')}>Cambia sprite</button>
            </div>
        );
    },
}));

const mockVariant = {
    id: 1,
    title: 'About Me',
    theme: 'monkey',
    componentKey: 'aboutMe',
    sprite: null,
};

describe('BaseModal', () => {
    let BaseModal;

    beforeEach(async () => {
        vi.resetModules();
        const mod = await import('../features/modals/shared/BaseModal');
        BaseModal = mod.default;
    });

    it('renders modal title', () => {
        render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        expect(screen.getByText('About Me')).toBeInTheDocument();
    });

    it('renders lazy-loaded modal content', async () => {
        render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        await waitFor(() => {
            expect(screen.getByTestId('modal-content')).toBeInTheDocument();
        });
    });

    it('renders CONTINUA button', () => {
        render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        expect(screen.getByText('CONTINUA')).toBeInTheDocument();
    });

    it('calls closeModal when clicking overlay', async () => {
        const user = userEvent.setup();
        const closeModal = vi.fn();
        const { container } = render(<BaseModal variant={mockVariant} closeModal={closeModal} />);

        const overlay = container.querySelector('[class*="modal-overlay"]');
        await user.click(overlay);

        expect(closeModal).toHaveBeenCalled();
    });

    it('calls closeModal when clicking CONTINUA (bubbles to overlay)', async () => {
        const user = userEvent.setup();
        const closeModal = vi.fn();
        render(<BaseModal variant={mockVariant} closeModal={closeModal} />);

        await user.click(screen.getByText('CONTINUA'));
        expect(closeModal).toHaveBeenCalled();
    });

    it('calls closeModal on Escape key', async () => {
        const user = userEvent.setup();
        const closeModal = vi.fn();
        render(<BaseModal variant={mockVariant} closeModal={closeModal} />);

        await user.keyboard('{Escape}');
        expect(closeModal).toHaveBeenCalled();
    });

    it('renders modal with aria-modal true', () => {
        render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('renders modal with aria-labelledby', () => {
        render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('does not render sprite when variant.sprite is null', () => {
        const { container } = render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        const spriteImg = container.querySelector('[data-modal-slot="sprite"]');
        expect(spriteImg).toBeNull();
    });

    it('renders sprite when variant.sprite is provided', async () => {
        const variantWithSprite = { ...mockVariant, sprite: '/sprite.webp' };
        const { container } = render(<BaseModal variant={variantWithSprite} closeModal={vi.fn()} />);

        await waitFor(() => {
            const spriteImg = container.querySelector('[data-modal-slot="sprite"]');
            expect(spriteImg).toBeInTheDocument();
        });
    });

    it('sets body overflow to hidden on mount', () => {
        render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body overflow on unmount', () => {
        const { unmount } = render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        unmount();
        expect(document.body.style.overflow).toBe('');
    });
});

describe('BaseModal - focus management', () => {
    const contactsVariant = { id: 5, title: 'Contatti', theme: 'parrot', componentKey: 'contacts', sprite: null };
    let BaseModal;

    beforeEach(async () => {
        vi.resetModules();
        const mod = await import('../features/modals/shared/BaseModal');
        BaseModal = mod.default;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // jsdom non calcola il layout: getClientRects() è sempre vuoto, quindi nessun elemento
    // risulterebbe "focusable". Lo simuliamo per testare il focus trap.
    const mockVisibleElements = () =>
        vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}]);

    it('porta il focus sul pulsante CONTINUA al mount', () => {
        render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        expect(screen.getByText('CONTINUA')).toHaveFocus();
    });

    it("ripristina il focus all'elemento precedente allo smontaggio", () => {
        const opener = document.createElement('button');
        document.body.appendChild(opener);
        opener.focus();

        const { unmount } = render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);
        expect(opener).not.toHaveFocus();

        unmount();
        expect(opener).toHaveFocus();
        opener.remove();
    });

    it("Tab dall'ultimo elemento riporta il focus al primo", async () => {
        mockVisibleElements();
        const user = userEvent.setup();
        render(<BaseModal variant={contactsVariant} closeModal={vi.fn()} />);
        const inner = await screen.findByText('Cambia sprite');

        expect(screen.getByText('CONTINUA')).toHaveFocus();
        await user.tab();

        expect(inner).toHaveFocus();
    });

    it("Shift+Tab dal primo elemento porta il focus sull'ultimo", async () => {
        mockVisibleElements();
        const user = userEvent.setup();
        render(<BaseModal variant={contactsVariant} closeModal={vi.fn()} />);
        const inner = await screen.findByText('Cambia sprite');

        inner.focus();
        await user.tab({ shift: true });

        expect(screen.getByText('CONTINUA')).toHaveFocus();
    });

    it('Tab senza elementi focusable lascia il focus sul dialog', async () => {
        // senza mock getClientRects() è vuoto: nessun elemento risulta focusable
        const user = userEvent.setup();
        render(<BaseModal variant={mockVariant} closeModal={vi.fn()} />);

        await user.tab();

        expect(screen.getByRole('dialog')).toHaveFocus();
    });

    it('se il focus esce dal dialog viene riportato dentro', async () => {
        mockVisibleElements();
        const outside = document.createElement('button');
        document.body.appendChild(outside);
        render(<BaseModal variant={contactsVariant} closeModal={vi.fn()} />);
        const inner = await screen.findByText('Cambia sprite');

        outside.focus();

        expect(inner).toHaveFocus();
        outside.remove();
    });

    it('setModalSprite aggiorna lo sprite mostrato', async () => {
        const user = userEvent.setup();
        const { container } = render(<BaseModal variant={contactsVariant} closeModal={vi.fn()} />);

        await user.click(await screen.findByText('Cambia sprite'));

        expect(container.querySelector('[data-modal-slot="sprite"]')).toHaveAttribute('src', '/new-sprite.webp');
    });
});
