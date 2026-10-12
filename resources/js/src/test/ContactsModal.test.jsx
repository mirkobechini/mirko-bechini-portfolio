import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import ContactsModal from '../features/modals/contacts/ContactsModal';

// Mock useKeyboardNavigation per evitare event listener
vi.mock('../hooks/useKeyboardNavigation', () => ({
    useKeyboardNavigation: vi.fn(),
}));

// I dati arrivano dalla API: qui gli stessi dati statici
vi.mock('../hooks/useContacts', async () => {
    const { default: contactsData } = await import('../features/modals/contacts/contactsData');
    return { default: () => ({ contacts: contactsData }) };
});

describe('ContactsModal', () => {
    it('renders intro text', () => {
        render(<ContactsModal />);
        expect(screen.getByText(/pappagallo è pronto a volare/i)).toBeInTheDocument();
    });

    it('renders all contact links', () => {
        render(<ContactsModal />);
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('LinkedIn')).toBeInTheDocument();
        expect(screen.getByText('GitHub')).toBeInTheDocument();
    });

    it('renders contact icons', () => {
        render(<ContactsModal />);
        expect(screen.getByText('✉️')).toBeInTheDocument();
        expect(screen.getByText('🔗')).toBeInTheDocument();
        expect(screen.getByText('💻')).toBeInTheDocument();
    });

    it('email link uses mailto:', () => {
        render(<ContactsModal />);
        const emailLink = screen.getByText('Email').closest('a');
        expect(emailLink).toHaveAttribute('href', 'mailto:mirkobechini@gmail.com');
    });

    it('external links open in new tab', () => {
        render(<ContactsModal />);
        const linkedinLink = screen.getByText('LinkedIn').closest('a');
        expect(linkedinLink).toHaveAttribute('target', '_blank');
        expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('all links have aria-labels', () => {
        render(<ContactsModal />);
        expect(screen.getByLabelText('Contatta via email')).toBeInTheDocument();
        expect(screen.getByLabelText('Apri profilo LinkedIn')).toBeInTheDocument();
        expect(screen.getByLabelText('Apri profilo GitHub')).toBeInTheDocument();
    });

    it('renders 3 contact items', () => {
        render(<ContactsModal />);
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(3);
    });

    it('la navigazione da tastiera sposta il focus sul contatto indicato', () => {
        render(<ContactsModal />);
        const { onNavigate, totalItems } = useKeyboardNavigation.mock.calls.at(-1)[0];

        expect(totalItems).toBe(3);

        act(() => onNavigate(1));

        expect(screen.getByText('LinkedIn').closest('a')).toHaveFocus();
    });

    it('il contatto selezionato con la tastiera riceve la classe selected-contact', () => {
        render(<ContactsModal />);
        const { onNavigate } = useKeyboardNavigation.mock.calls.at(-1)[0];

        act(() => onNavigate(2));

        expect(screen.getByText('GitHub').closest('a')).toHaveClass('selected-contact');
        expect(screen.getByText('Email').closest('a')).not.toHaveClass('selected-contact');
    });
});
