import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../utils/assets', () => ({ getAssetPath: (path) => `/assets${path}` }));
vi.mock('../utils/playBookFlip', () => ({ default: vi.fn() }));

// Mock ProjectsModal
vi.mock('../features/modals/projects/ProjectsModal', () => ({
    default: function MockProjectsModal({ onBackToProjectsHome }) {
        return (
            <div data-testid="projects-modal">
                <p>Projects View</p>
                <button data-testid="back-projects" onClick={onBackToProjectsHome}>Torna indietro</button>
            </div>
        );
    },
}));

describe('ProjectExperienceModal', () => {
    let ProjectExperienceModal;

    beforeEach(async () => {
        vi.resetModules();
        const mod = await import('../features/modals/projects/ProjectExperienceModal');
        ProjectExperienceModal = mod.default;
    });

    it('renders home view with two buttons', () => {
        render(<ProjectExperienceModal />);
        expect(screen.getByText('Progetti')).toBeInTheDocument();
        expect(screen.getByText('Esperienze')).toBeInTheDocument();
    });

    it('opens projects view when clicking Progetti', async () => {
        const user = userEvent.setup();
        render(<ProjectExperienceModal />);

        await user.click(screen.getByText('Progetti'));

        await waitFor(() => {
            expect(screen.getByTestId('projects-modal')).toBeInTheDocument();
        });
    });

    it('opens experience placeholder when clicking Esperienze', async () => {
        const user = userEvent.setup();
        render(<ProjectExperienceModal />);

        await user.click(screen.getByText('Esperienze'));

        await waitFor(() => {
            expect(screen.getByText('Sezione in arrivo')).toBeInTheDocument();
            expect(screen.getByText('Work in progress')).toBeInTheDocument();
        });
    });

    it('returns to home from projects via back button', async () => {
        const user = userEvent.setup();
        render(<ProjectExperienceModal />);

        await user.click(screen.getByText('Progetti'));
        await waitFor(() => {
            expect(screen.getByTestId('projects-modal')).toBeInTheDocument();
        });

        await user.click(screen.getByTestId('back-projects'));
        await waitFor(() => {
            expect(screen.getByText('Progetti')).toBeInTheDocument();
            expect(screen.getByText('Esperienze')).toBeInTheDocument();
        });
    });

    it('returns to home from experiences via back button', async () => {
        const user = userEvent.setup();
        render(<ProjectExperienceModal />);

        await user.click(screen.getByText('Esperienze'));
        await waitFor(() => {
            expect(screen.getByText('Sezione in arrivo')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Torna indietro'));
        await waitFor(() => {
            expect(screen.getByText('Progetti')).toBeInTheDocument();
        });
    });

    it('calls setModalSprite with default on mount', () => {
        const setModalSprite = vi.fn();
        render(<ProjectExperienceModal setModalSprite={setModalSprite} defaultModalSprite="/desk.webp" />);

        expect(setModalSprite).toHaveBeenCalledWith('/desk.webp');
    });
});