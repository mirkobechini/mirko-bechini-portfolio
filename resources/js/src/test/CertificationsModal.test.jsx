import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CertificationsModal from '../features/modals/certifications/CertificationsModal';

const mockOpenModal = vi.fn();

// I dati arrivano dalla API: qui gli stessi dati statici, con un attestato senza corso in più
vi.mock('../hooks/useCertifications', async () => {
    const { default: certificationData } = await import('../features/modals/certifications/certificationData');
    return {
        default: () => ({
            certifications: [
                ...certificationData,
                { id: 99, courseId: null, title: 'Senza corso', preview: '/x.webp', organization: 'Altro', organizationUrl: '', skills: [] },
                { id: 100, courseId: 1, title: 'Voce senza immagine', preview: '', organization: 'Altro', organizationUrl: '', skills: [] },
            ],
        }),
    };
});

describe('CertificationsModal', () => {
    beforeEach(() => {
        mockOpenModal.mockClear();
    });

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

    it('un attestato senza corso collegato non apre nulla', async () => {
        const user = userEvent.setup();
        render(<CertificationsModal openModal={mockOpenModal} />);

        const frames = screen.getAllByRole('button');
        await user.click(frames[frames.length - 1]);

        expect(mockOpenModal).not.toHaveBeenCalled();
    });

    it('una voce senza immagine non compare', () => {
        render(<CertificationsModal openModal={mockOpenModal} />);

        // Il mock aggiunge "Senza corso" con un'immagine; qui si controlla che il titolo di una voce vuota non esista
        expect(screen.queryByText(/Voce senza immagine/)).not.toBeInTheDocument();
    });

    it("un'immagine che non si carica toglie la sua tessera e lascia le altre", () => {
        render(<CertificationsModal openModal={mockOpenModal} />);
        const before = screen.getAllByRole('img').length;

        fireEvent.error(screen.getByAltText('Senza corso'));

        expect(screen.queryByAltText('Senza corso')).not.toBeInTheDocument();
        expect(screen.queryByText(/Senza corso @/)).not.toBeInTheDocument();
        expect(screen.getAllByRole('img').length).toBe(before - 1);
    });

    it('se tutte le immagini falliscono la galleria resta vuota senza errori', () => {
        render(<CertificationsModal openModal={mockOpenModal} />);

        for (const img of screen.getAllByRole('img')) fireEvent.error(img);

        expect(screen.queryAllByRole('img')).toHaveLength(0);
        expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('Invio e Spazio sul riquadro aprono la formazione, gli altri tasti no', async () => {
        const user = userEvent.setup();
        render(<CertificationsModal openModal={mockOpenModal} />);
        const frame = screen.getAllByRole('button')[0];

        frame.focus();
        await user.keyboard('a');
        expect(mockOpenModal).not.toHaveBeenCalled();

        await user.keyboard('{Enter}');
        await user.keyboard(' ');
        expect(mockOpenModal).toHaveBeenCalledTimes(2);
        expect(mockOpenModal).toHaveBeenCalledWith(2, { preselectEducation: 1 });
    });

    it('i link alle organizzazioni si aprono in una nuova scheda in sicurezza', () => {
        render(<CertificationsModal openModal={mockOpenModal} />);
        const link = screen.getByText('Boolean').closest('a');

        expect(link).toHaveAttribute('href', 'https://boolean.careers');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
