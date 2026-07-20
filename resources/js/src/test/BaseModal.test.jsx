import { describe, it, expect, vi, beforeEach } from 'vitest';
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
    default: function MockModal() { return <div data-testid="modal-content">Contacts Content</div>; },
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