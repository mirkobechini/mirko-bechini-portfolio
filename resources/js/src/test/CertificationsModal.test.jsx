import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CertificationsModal from '../features/modals/certifications/CertificationsModal';

const mockOpenModal = vi.fn();

describe('CertificationsModal', () => {
    it('renders certification items', () => {
        render(<CertificationsModal openModal={mockOpenModal} />);
        // Viene dal certificationData
        expect(screen.getByText(/Master web development/i)).toBeInTheDocument();
        expect(screen.getByText(/CERTIFICATO DI COMPLETAMENTO/i)).toBeInTheDocument();
    });

    it('renders organization names', () => {
        render(<CertificationsModal openModal={mockOpenModal} />);
        expect(screen.getByText('Boolean')).toBeInTheDocument();
        expect(screen.getByText('Scrimba')).toBeInTheDocument();
    });

    it('renders preview images', () => {
        render(<CertificationsModal openModal={mockOpenModal} />);
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(2);
    });

    it('calls openModal when clicking a certificate', async () => {
        const user = userEvent.setup();
        render(<CertificationsModal openModal={mockOpenModal} />);

        // Clicca sul primo frame certificazione
        const frames = screen.getAllByRole('button');
        await user.click(frames[0]);

        expect(mockOpenModal).toHaveBeenCalledWith(2, { preselectEducation: 1 });
    });
});