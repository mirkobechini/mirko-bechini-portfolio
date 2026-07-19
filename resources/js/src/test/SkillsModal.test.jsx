import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../utils/playBookFlip', () => ({ default: vi.fn() }));

// Mock child components
vi.mock('../features/modals/library/SkillsGridView', () => ({
    default: function MockSkillsGridView({ skillsData, onSkillClick, title, onBackToFormation, returnToEducation }) {
        return (
            <div data-testid="skills-grid">
                <h3>{title}</h3>
                {skillsData.map(s => (
                    <button key={s.id} data-testid={`skill-${s.id}`} onClick={() => onSkillClick(s)}>
                        {s.skill}
                    </button>
                ))}
                {returnToEducation && onBackToFormation && (
                    <button data-testid="back-to-formation" onClick={onBackToFormation}>‹ Formazione</button>
                )}
            </div>
        );
    },
}));

vi.mock('../features/modals/library/SkillDetailView', () => ({
    default: function MockSkillDetailView({ currentSkill }) {
        return (
            <div data-testid="skill-detail">
                {currentSkill ? <p>Detail: {currentSkill.skill}</p> : <p>Nessuna skill selezionata</p>}
            </div>
        );
    },
}));

vi.mock('../features/modals/library/FormationView', () => ({
    default: function MockFormationView({ currentProfile, onSwitchToSkill, returnToEducation }) {
        return (
            <div data-testid="formation-view">
                <p>Formation: {currentProfile.title}</p>
                {onSwitchToSkill && <button data-testid="switch-to-skill" onClick={() => onSwitchToSkill('React', { id: 1 })}>Switch</button>}
            </div>
        );
    },
}));

const skillsProfile = {
    id: 'skills',
    title: 'Competenze',
    detailsTitle: 'Dettagli skill',
    enableKeyboardNavigation: true,
    skillsData: [
        { id: 1, skill: 'HTML', color: '#E34F26', icon: '/html.webp' },
        { id: 2, skill: 'CSS', color: '#1572B6', icon: '/css.webp' },
    ],
};

const formationProfile = {
    id: 'formation',
    title: 'Formazione',
    detailsTitle: 'Percorso',
    enableKeyboardNavigation: false,
    educationData: [{ id: 1, course: 'Web Dev', organization: 'Boolean', period: '2025', description: 'Corso', skills: [], highlights: [], modules: [] }],
    formationFocus: [],
    formationRoadmap: [],
};

describe('SkillsModal', () => {
    let SkillsModal;

    beforeEach(async () => {
        vi.resetModules();
        const mod = await import('../features/modals/library/SkillsModal');
        SkillsModal = mod.default;
    });

    it('renders skills grid for skills profile', () => {
        render(<SkillsModal profile={skillsProfile} />);
        expect(screen.getByTestId('skills-grid')).toBeInTheDocument();
        expect(screen.getByText('Competenze')).toBeInTheDocument();
    });

    it('renders skill buttons from skillsData', () => {
        render(<SkillsModal profile={skillsProfile} />);
        expect(screen.getByText('HTML')).toBeInTheDocument();
        expect(screen.getByText('CSS')).toBeInTheDocument();
    });

    it('renders skill detail view for skills profile', () => {
        render(<SkillsModal profile={skillsProfile} />);
        expect(screen.getByTestId('skill-detail')).toBeInTheDocument();
    });

    it('shows empty detail initially', () => {
        render(<SkillsModal profile={skillsProfile} />);
        expect(screen.getByText('Nessuna skill selezionata')).toBeInTheDocument();
    });

    it('updates skill detail when clicking a skill', async () => {
        const user = userEvent.setup();
        render(<SkillsModal profile={skillsProfile} />);

        await user.click(screen.getByText('HTML'));

        await waitFor(() => {
            expect(screen.getByText('Detail: HTML')).toBeInTheDocument();
        });
    });

    it('renders Home button when onBackToBookshelf is provided', () => {
        render(<SkillsModal profile={skillsProfile} onBackToBookshelf={vi.fn()} />);
        expect(screen.getByLabelText('Torna alla libreria')).toBeInTheDocument();
    });

    it('renders formation view for formation profile', () => {
        render(<SkillsModal profile={formationProfile} />);
        expect(screen.getByTestId('formation-view')).toBeInTheDocument();
        expect(screen.getByText('Formation: Formazione')).toBeInTheDocument();
    });

    it('renders fallback for unknown profile', () => {
        render(<SkillsModal profile={{ id: 'unknown', title: 'Unknown' }} />);
        expect(screen.getByText('Profilo non disponibile')).toBeInTheDocument();
    });

    it('auto-selects skill when preselectSkill is provided', async () => {
        render(<SkillsModal profile={skillsProfile} preselectSkill="CSS" />);

        await waitFor(() => {
            expect(screen.getByText('Detail: CSS')).toBeInTheDocument();
        });
    });

    it('uses default profile when none provided', () => {
        render(<SkillsModal />);
        expect(screen.getByTestId('skills-grid')).toBeInTheDocument();
        expect(screen.getByText('Competenze')).toBeInTheDocument();
    });
});