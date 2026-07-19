import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock playBookFlip per evitare errori Audio in jsdom
vi.mock('../utils/playBookFlip', () => ({ default: vi.fn() }));

const mockProfile = {
    title: 'Formazione',
    detailsTitle: 'Percorso e prossimi step',
};

const mockEducationData = [
    {
        id: 1,
        course: 'Web Development',
        organization: 'Boolean',
        period: '05/2025 - 02/2026',
        description: 'Corso full-stack.',
        skills: ['HTML', 'CSS'],
        highlights: ['Oltre 350 ore'],
        modules: [],
        organizationUrl: 'https://boolean.careers',
        certificate: null,
    },
];

const mockFocus = [
    { title: 'Multistack AI', description: 'Corso avanzato', status: 'inProgress', badge: 'New Skills' },
];

const mockRoadmap = [
    { title: 'Backend Portfolio', description: 'Progetto backend', status: 'next', badge: 'Portfolio' },
];

describe('FormationView', () => {
    let FormationView;

    beforeEach(async () => {
        // Reset modules per ogni test
        vi.resetModules();
        const mod = await import('../features/modals/library/FormationView');
        FormationView = mod.default;
    });

    it('renders profile title in overview', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );
        expect(screen.getByText('Formazione')).toBeInTheDocument();
    });

    it('renders education cards', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );
        expect(screen.getByText(/Web Development - Boolean/)).toBeInTheDocument();
        expect(screen.getByText('Corso full-stack.')).toBeInTheDocument();
    });

    it('renders skill tags in education card', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );
        expect(screen.getByText('HTML')).toBeInTheDocument();
        expect(screen.getByText('CSS')).toBeInTheDocument();
    });

    it('renders formation focus section', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );
        expect(screen.getByText('Focus attuale')).toBeInTheDocument();
        expect(screen.getByText('Multistack AI')).toBeInTheDocument();
    });

    it('renders roadmap section', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );
        expect(screen.getByText('Roadmap')).toBeInTheDocument();
        expect(screen.getByText('Backend Portfolio')).toBeInTheDocument();
    });

    it('renders badge for focus items', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );
        expect(screen.getByText('New Skills')).toBeInTheDocument();
    });

    it('shows detail view when clicking an education card', async () => {
        const user = userEvent.setup();
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );

        await user.click(screen.getByText(/Web Development - Boolean/));
        expect(screen.getByText('Oltre 350 ore')).toBeInTheDocument();
    });

    it('shows back button in detail view and returns to overview', async () => {
        const user = userEvent.setup();
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );

        // Click education
        await user.click(screen.getByText(/Web Development - Boolean/));
        expect(screen.getByText('Oltre 350 ore')).toBeInTheDocument();

        // Click back
        const backBtn = screen.getByLabelText('Torna alla visione d\'insieme');
        await user.click(backBtn);

        // Dovrebbe tornare alla overview
        expect(screen.getByText('Focus attuale')).toBeInTheDocument();
    });

    it('auto-selects education when returnToEducation is provided', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
                returnToEducation={mockEducationData[0]}
            />
        );
        expect(screen.getByText('Oltre 350 ore')).toBeInTheDocument();
    });

    it('renders period in education card', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );
        expect(screen.getByText('05/2025 - 02/2026')).toBeInTheDocument();
    });

    it('renders detailsTitle in overview', () => {
        render(
            <FormationView
                currentProfile={mockProfile}
                educationData={mockEducationData}
                formationFocus={mockFocus}
                formationRoadmap={mockRoadmap}
            />
        );
        expect(screen.getByText('Percorso e prossimi step')).toBeInTheDocument();
    });
});