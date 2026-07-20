import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactsModal from '../features/modals/contacts/ContactsModal';

// Mock useKeyboardNavigation per evitare event listener
vi.mock('../hooks/useKeyboardNavigation', () => ({
    useKeyboardNavigation: vi.fn(),
}));

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
});