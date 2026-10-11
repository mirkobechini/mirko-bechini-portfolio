import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormationDetailView from '../features/modals/library/FormationDetailView';

const mockEducation = {
    id: 1,
    course: 'Web Development',
    description: 'Corso di sviluppo web full-stack.',
    organization: 'Boolean',
    organizationUrl: 'https://boolean.careers',
    period: '05/2025 - 02/2026',
    highlights: ['Oltre 350 ore', 'Progetto finale'],
    modules: [
        { title: 'Frontend', description: 'React e CSS', skillsModules: ['React', 'CSS'] },
        { title: 'Backend', description: 'PHP e Laravel', skillsModules: ['PHP', 'Laravel'] },
    ],
    skills: ['HTML', 'CSS', 'JavaScript'],
    certificate: 'https://cert.example.com/cert.pdf',
};

describe('FormationDetailView', () => {
    it('renders page 1 with organization and period', () => {
        render(<FormationDetailView education={mockEducation} page={1} />);
        expect(screen.getByText('Boolean')).toBeInTheDocument();
        expect(screen.getByText('05/2025 - 02/2026')).toBeInTheDocument();
    });

    it('renders page 1 with description', () => {
        render(<FormationDetailView education={mockEducation} page={1} />);
        expect(screen.getByText('Corso di sviluppo web full-stack.')).toBeInTheDocument();
    });

    it('renders page 1 highlights', () => {
        render(<FormationDetailView education={mockEducation} page={1} />);
        expect(screen.getByText('Oltre 350 ore')).toBeInTheDocument();
        expect(screen.getByText('Progetto finale')).toBeInTheDocument();
    });

    it('renders page 2 with module titles', () => {
        render(<FormationDetailView education={mockEducation} page={2} />);
        expect(screen.getByText('Frontend')).toBeInTheDocument();
        expect(screen.getByText('Backend')).toBeInTheDocument();
    });

    it('renders page 2 module skills as clickable tags', () => {
        const onSkillTagClick = vi.fn();
        render(<FormationDetailView education={mockEducation} page={2} onSkillTagClick={onSkillTagClick} />);
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('PHP')).toBeInTheDocument();
    });

    it('calls onSkillTagClick when clicking a module skill tag', async () => {
        const user = userEvent.setup();
        const onSkillTagClick = vi.fn();
        render(<FormationDetailView education={mockEducation} page={2} onSkillTagClick={onSkillTagClick} />);

        await user.click(screen.getByText('React'));
        expect(onSkillTagClick).toHaveBeenCalledWith('React', mockEducation);
    });

    it('renders page 2 acquired skills', () => {
        render(<FormationDetailView education={mockEducation} page={2} />);
        expect(screen.getByText('HTML')).toBeInTheDocument();
        expect(screen.getAllByText('CSS').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    it('renders certificate link on page 2', () => {
        render(<FormationDetailView education={mockEducation} page={2} />);
        const link = screen.getByText('Vedi certificato');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://cert.example.com/cert.pdf');
    });

    it('renders org link with target _blank', () => {
        render(<FormationDetailView education={mockEducation} page={1} />);
        const link = screen.getByText('Boolean');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('handles education without highlights', () => {
        const { container } = render(<FormationDetailView education={{ ...mockEducation, highlights: [] }} page={1} />);
        expect(container.querySelector('.highlights-list')).toBeNull();
    });

    it('handles education without modules', () => {
        const { container } = render(<FormationDetailView education={{ ...mockEducation, modules: [] }} page={2} />);
        expect(container.querySelector('.modules-list')).toBeNull();
    });

    describe('tag delle competenze', () => {
        it.each([
            ['React', '{Enter}'],
            ['React', ' '],
            ['HTML', '{Enter}'],
            ['HTML', ' '],
        ])('"%s" con il tasto %j chiama onSkillTagClick', async (skill, key) => {
            const user = userEvent.setup();
            const onSkillTagClick = vi.fn();
            render(<FormationDetailView education={mockEducation} page={2} onSkillTagClick={onSkillTagClick} />);

            screen.getByText(skill).focus();
            await user.keyboard(key);

            expect(onSkillTagClick).toHaveBeenCalledTimes(1);
            expect(onSkillTagClick).toHaveBeenCalledWith(skill, mockEducation);
        });

        it('gli altri tasti non fanno nulla', async () => {
            const user = userEvent.setup();
            const onSkillTagClick = vi.fn();
            render(<FormationDetailView education={mockEducation} page={2} onSkillTagClick={onSkillTagClick} />);

            screen.getByText('HTML').focus();
            await user.keyboard('a');

            expect(onSkillTagClick).not.toHaveBeenCalled();
        });

        it('senza onSkillTagClick i tag non sono pulsanti', () => {
            render(<FormationDetailView education={mockEducation} page={2} />);

            expect(screen.getByText('HTML')).not.toHaveAttribute('role');
            expect(screen.getByText('React')).not.toHaveAttribute('tabindex');
        });
    });

    describe('contenuti opzionali', () => {
        it('mostra il link al certificato in una nuova scheda', () => {
            render(<FormationDetailView education={mockEducation} page={2} />);

            const link = screen.getByText('Vedi certificato');
            expect(link).toHaveAttribute('href', 'https://cert.example.com/cert.pdf');
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });

        it('senza certificato non mostra il link', () => {
            render(<FormationDetailView education={{ ...mockEducation, certificate: null }} page={2} />);

            expect(screen.queryByText('Vedi certificato')).not.toBeInTheDocument();
        });

        it('senza organizationUrl non mostra il link al certificato', () => {
            render(<FormationDetailView education={{ ...mockEducation, organizationUrl: undefined }} page={2} />);

            expect(screen.queryByText('Vedi certificato')).not.toBeInTheDocument();
        });

        it('senza punti salienti la pagina 1 non mostra la sezione', () => {
            render(<FormationDetailView education={{ ...mockEducation, highlights: [] }} page={1} />);

            expect(screen.queryByText('Punti salienti')).not.toBeInTheDocument();
        });

        it('senza moduli e competenze la pagina 2 non mostra le sezioni', () => {
            render(<FormationDetailView education={{ ...mockEducation, modules: [], skills: [], certificate: null }} page={2} />);

            expect(screen.queryByText('Moduli del corso')).not.toBeInTheDocument();
            expect(screen.queryByText('Competenze acquisite')).not.toBeInTheDocument();
        });
    });
});
