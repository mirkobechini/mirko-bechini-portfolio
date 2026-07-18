import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SkillDetailView from '../features/modals/library/SkillDetailView';

const mockSkill = {
    id: 1,
    skill: 'React',
    color: '#61DAFB',
    functions: ['Creazione di componenti', 'Gestione dello stato'],
    relatedProjects: ['Portfolio', 'Gods Guest Site'],
};

describe('SkillDetailView', () => {
    it('renders empty state when no skill selected', () => {
        render(<SkillDetailView currentSkill={null} detailsTitle="Dettagli skill" />);
        expect(screen.getByText(/Seleziona una skill per visualizzare dettagli/)).toBeInTheDocument();
        expect(screen.getByText(/Utilizza ← ↑ → ↓/)).toBeInTheDocument();
    });

    it('renders custom title in empty state', () => {
        render(<SkillDetailView currentSkill={null} detailsTitle="Custom Title" />);
        expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders skill name when selected', () => {
        render(<SkillDetailView currentSkill={mockSkill} />);
        expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('renders skill functions', () => {
        render(<SkillDetailView currentSkill={mockSkill} />);
        expect(screen.getByText('Creazione di componenti')).toBeInTheDocument();
        expect(screen.getByText('Gestione dello stato')).toBeInTheDocument();
    });

    it('renders related projects', () => {
        render(<SkillDetailView currentSkill={mockSkill} />);
        expect(screen.getByText('Portfolio')).toBeInTheDocument();
        expect(screen.getByText('Gods Guest Site')).toBeInTheDocument();
    });

    it('renders section headings', () => {
        render(<SkillDetailView currentSkill={mockSkill} />);
        expect(screen.getByText('Funzionalita conosciute:')).toBeInTheDocument();
        expect(screen.getByText('Progetti correlati:')).toBeInTheDocument();
    });

    it('shows fallback text when functions is missing', () => {
        render(<SkillDetailView currentSkill={{ ...mockSkill, functions: undefined }} />);
        expect(screen.getByText('Funzionalità da inserire')).toBeInTheDocument();
    });

    it('shows fallback text when relatedProjects is missing', () => {
        render(<SkillDetailView currentSkill={{ ...mockSkill, relatedProjects: undefined }} />);
        expect(screen.getByText('Progetti da inserire')).toBeInTheDocument();
    });
});