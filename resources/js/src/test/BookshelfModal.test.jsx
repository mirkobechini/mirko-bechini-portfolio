import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookshelfModal from '../features/modals/library/BookshelfModal';

// Mock utilities
vi.mock('../utils/playBookFlip', () => ({ default: vi.fn() }));
vi.mock('../utils/assets', () => ({
    getAssetPath: (path) => `/assets${path}`,
}));

// Mock SkillsModal (lazy loaded)
vi.mock('../features/modals/library/SkillsModal', () => ({
    default: function MockSkillsModal({ profile, onBackToBookshelf, onSwitchToSkill, onBackToFormation }) {
        return (
            <div data-testid="skills-modal">
                <p>SkillsModal: {profile?.id}</p>
                <button data-testid="back-to-bookshelf" onClick={onBackToBookshelf}>Home</button>
                {onBackToFormation && (
                    <button data-testid="back-to-formation" onClick={onBackToFormation}>‹ Formazione</button>
                )}
                {onSwitchToSkill && (
                    <button data-testid="switch-to-skill" onClick={() => onSwitchToSkill('React', { id: 1 })}>Skill</button>
                )}
            </div>
        );
    },
}));

// Mock data modules
vi.mock('../features/modals/library/bookshelfProfiles', () => ({
    BOOKSHELF_PROFILES: {
        skills: { id: 'skills', title: 'Competenze', modalSprite: '/skills-sprite.webp' },
        formation: { id: 'formation', title: 'Formazione', modalSprite: '/formation-sprite.webp' },
    },
}));

vi.mock('../features/modals/library/educationData', () => ({
    default: [
        { id: 1, course: 'Web Dev', organization: 'Boolean', period: '2025', description: 'Corso', skills: [], highlights: [], modules: [] },
    ],
}));

describe('BookshelfModal', () => {
    const defaultProps = {
        setModalSprite: vi.fn(),
        defaultModalSprite: '/default-sprite.webp',
        modalParams: {},
    };

    it('renders bookshelf view with two buttons', () => {
        render(<BookshelfModal {...defaultProps} />);
        expect(screen.getByText('Formazione')).toBeInTheDocument();
        expect(screen.getByText('Competenze')).toBeInTheDocument();
    });

    it('opens formation profile when clicking Formazione button', async () => {
        const user = userEvent.setup();
        render(<BookshelfModal {...defaultProps} />);

        await user.click(screen.getByText('Formazione'));

        await waitFor(() => {
            expect(screen.getByTestId('skills-modal')).toBeInTheDocument();
            expect(screen.getByText('SkillsModal: formation')).toBeInTheDocument();
        });
    });

    it('opens skills profile when clicking Competenze button', async () => {
        const user = userEvent.setup();
        render(<BookshelfModal {...defaultProps} />);

        await user.click(screen.getByText('Competenze'));

        await waitFor(() => {
            expect(screen.getByTestId('skills-modal')).toBeInTheDocument();
            expect(screen.getByText('SkillsModal: skills')).toBeInTheDocument();
        });
    });

    it('returns to bookshelf via back button', async () => {
        const user = userEvent.setup();
        render(<BookshelfModal {...defaultProps} />);

        // Open formation
        await user.click(screen.getByText('Formazione'));
        await waitFor(() => {
            expect(screen.getByTestId('skills-modal')).toBeInTheDocument();
        });

        // Click back
        await user.click(screen.getByTestId('back-to-bookshelf'));

        await waitFor(() => {
            expect(screen.getByText('Formazione')).toBeInTheDocument();
            expect(screen.getByText('Competenze')).toBeInTheDocument();
        });
    });

    it('auto-opens formation when preselectEducation is in modalParams', async () => {
        render(<BookshelfModal {...defaultProps} modalParams={{ preselectEducation: 1 }} />);

        await waitFor(() => {
            expect(screen.getByTestId('skills-modal')).toBeInTheDocument();
            expect(screen.getByText('SkillsModal: formation')).toBeInTheDocument();
        });
    });

    it('calls setModalSprite with default sprite in bookshelf view', () => {
        const setModalSprite = vi.fn();
        render(<BookshelfModal {...defaultProps} setModalSprite={setModalSprite} />);

        expect(setModalSprite).toHaveBeenCalledWith('/default-sprite.webp');
    });

    it('calls setModalSprite with profile sprite when profile selected', async () => {
        const user = userEvent.setup();
        const setModalSprite = vi.fn();
        render(<BookshelfModal {...defaultProps} setModalSprite={setModalSprite} />);

        await user.click(screen.getByText('Formazione'));

        await waitFor(() => {
            expect(setModalSprite).toHaveBeenCalledWith('/formation-sprite.webp');
        });
    });

    it('switches to skills view from formation', async () => {
        const user = userEvent.setup();
        render(<BookshelfModal {...defaultProps} />);

        // Open formation
        await user.click(screen.getByText('Formazione'));
        await waitFor(() => {
            expect(screen.getByTestId('skills-modal')).toBeInTheDocument();
        });

        // Click switch to skill
        await user.click(screen.getByTestId('switch-to-skill'));
        await waitFor(() => {
            expect(screen.getByText('SkillsModal: skills')).toBeInTheDocument();
        });
    });
});