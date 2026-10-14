import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    it("mostra l'anteprima solo se è stata caricata", () => {
        const { rerender } = render(<ProjectCard project={{ ...baseProject, preview: '/p.png', hasCustomPreview: false }} />);
        expect(screen.queryByAltText('Anteprima di Test Project')).not.toBeInTheDocument();

        rerender(<ProjectCard project={{ ...baseProject, preview: '/storage/p.png', hasCustomPreview: true }} />);
        expect(screen.getByAltText('Anteprima di Test Project')).toHaveAttribute('src', '/storage/p.png');
    });

    it('renders tech stack with hashtags', () => {
        render(<ProjectCard project={baseProject} />);
        expect(screen.getByText('#React #CSS')).toBeInTheDocument();
    });

    it('la card non mostra più link né corso: stanno nel dettaglio', () => {
        render(<ProjectCard project={{ ...baseProject, course: 'Master Laravel' }} onSelect={() => { }} />);

        expect(screen.queryByText('Apri Documentazione')).not.toBeInTheDocument();
        expect(screen.queryByText('Vai al sito')).not.toBeInTheDocument();
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByText(/Master Laravel/)).not.toBeInTheDocument();
    });

    it('con onSelect è un pulsante con nome accessibile e suggerimento', () => {
        render(<ProjectCard project={baseProject} onSelect={() => { }} />);

        const card = screen.getByRole('button', { name: 'Apri i dettagli di Test Project' });
        expect(card).toHaveAttribute('tabindex', '0');
        expect(screen.getByText(/Apri dettagli/)).toBeInTheDocument();
    });

    it('cliccando la card chiama onSelect con il progetto', async () => {
        const onSelect = vi.fn();
        render(<ProjectCard project={baseProject} onSelect={onSelect} />);

        await userEvent.click(screen.getByRole('button', { name: /Apri i dettagli/ }));

        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(baseProject);
    });

    it('Invio e Spazio aprono il dettaglio, gli altri tasti no', async () => {
        const onSelect = vi.fn();
        const user = userEvent.setup();
        render(<ProjectCard project={baseProject} onSelect={onSelect} />);

        screen.getByRole('button').focus();
        await user.keyboard('a');
        expect(onSelect).not.toHaveBeenCalled();

        await user.keyboard('{Enter}');
        await user.keyboard(' ');
        expect(onSelect).toHaveBeenCalledTimes(2);
    });

    it('senza onSelect resta una card semplice, non cliccabile', () => {
        render(<ProjectCard project={baseProject} />);

        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.queryByText(/Apri dettagli/)).not.toBeInTheDocument();
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