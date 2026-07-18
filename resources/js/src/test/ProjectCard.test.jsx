import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProjectCard from '../features/modals/projects/components/ProjectCard';

const baseProject = {
    id: 1,
    title: 'Test Project',
    description: 'A test project description',
    technologies: ['React', 'CSS'],
    repo: 'https://github.com/test/repo',
    live: 'https://test.example.com',
};

describe('ProjectCard', () => {
    it('renders project title', () => {
        render(<ProjectCard project={baseProject} />);
        expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('renders project description', () => {
        render(<ProjectCard project={baseProject} />);
        expect(screen.getByText('A test project description')).toBeInTheDocument();
    });

    it('renders tech stack with hashtags', () => {
        render(<ProjectCard project={baseProject} />);
        expect(screen.getByText('#React #CSS')).toBeInTheDocument();
    });

    it('renders repo link when valid', () => {
        render(<ProjectCard project={baseProject} />);
        const link = screen.getByText('Apri Documentazione');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://github.com/test/repo');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders live link when valid', () => {
        render(<ProjectCard project={baseProject} />);
        const link = screen.getByText('Vai al sito');
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', 'https://test.example.com');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('hides repo link when href is "#"', () => {
        render(<ProjectCard project={{ ...baseProject, repo: '#' }} />);
        expect(screen.queryByText('Apri Documentazione')).not.toBeInTheDocument();
    });

    it('hides live link when href is "#"', () => {
        render(<ProjectCard project={{ ...baseProject, live: '#' }} />);
        expect(screen.queryByText('Vai al sito')).not.toBeInTheDocument();
    });

    it('hides both links when hrefs are invalid', () => {
        render(<ProjectCard project={{ ...baseProject, repo: '#', live: '' }} />);
        expect(screen.queryByText('Apri Documentazione')).not.toBeInTheDocument();
        expect(screen.queryByText('Vai al sito')).not.toBeInTheDocument();
    });

    it('applies alternate class when isAlternate is true', () => {
        const { container } = render(<ProjectCard project={baseProject} isAlternate={true} />);
        expect(container.querySelector('div')?.className).toContain('alternate');
    });

    it('shows empty tech stack when technologies is empty', () => {
        render(<ProjectCard project={{ ...baseProject, technologies: [] }} />);
        expect(screen.queryByText('#')).not.toBeInTheDocument();
    });
});