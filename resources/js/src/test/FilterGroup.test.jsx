import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterGroup from '../features/modals/projects/components/FilterGroup';
import FilterPanel from '../features/modals/projects/components/FilterPanel';

const options = [
    { id: 'all', value: 'all', content: 'Tutti' },
    { id: 'frontend', value: 'frontend', content: 'Frontend' },
];

describe('FilterGroup', () => {
    it('renders all options', () => {
        render(<FilterGroup options={options} name="test" selectedValue="all" onChange={vi.fn()} />);
        expect(screen.getByText('Tutti')).toBeInTheDocument();
        expect(screen.getByText('Frontend')).toBeInTheDocument();
    });

    it('checks the selected option', () => {
        render(<FilterGroup options={options} name="test" selectedValue="frontend" onChange={vi.fn()} />);
        const frontendInput = screen.getByDisplayValue('frontend');
        expect(frontendInput).toBeChecked();
    });

    it('calls onChange when clicking a label', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(<FilterGroup options={options} name="test" selectedValue="all" onChange={onChange} />);

        await user.click(screen.getByText('Frontend'));
        expect(onChange).toHaveBeenCalledWith('frontend');
    });
});

describe('FilterPanel', () => {
    it('renders back button when onBack provided', () => {
        render(<FilterPanel onBack={vi.fn()} backLabel="Indietro" showLabel="Filtri" hideLabel="Nascondi" />);
        expect(screen.getByText('Indietro')).toBeInTheDocument();
    });

    it('renders toggle button with show label when closed', () => {
        render(<FilterPanel onShow={vi.fn()} onHide={vi.fn()} showLabel="Filtri" hideLabel="Nascondi" isOpen={false} mobileIcon="/icon.webp" />);
        expect(screen.getByText('Filtri')).toBeInTheDocument();
    });

    it('renders toggle button with hide label when open', () => {
        render(<FilterPanel onShow={vi.fn()} onHide={vi.fn()} showLabel="Filtri" hideLabel="Nascondi" isOpen={true} mobileIcon="/icon.webp" />);
        expect(screen.getByText('Nascondi')).toBeInTheDocument();
    });

    it('renders reset button when onReset provided', () => {
        render(<FilterPanel onReset={vi.fn()} resetLabel="Reset" resetIcon="/reset.webp" showLabel="Filtri" hideLabel="Nascondi" />);
        expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('renders children', () => {
        render(
            <FilterPanel showLabel="Filtri" hideLabel="Nascondi">
                <p>Child content</p>
            </FilterPanel>
        );
        expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('calls onHide when toggle clicked while open', async () => {
        const user = userEvent.setup();
        const onHide = vi.fn();
        render(<FilterPanel onShow={vi.fn()} onHide={onHide} showLabel="Filtri" hideLabel="Nascondi" isOpen={true} mobileIcon="/icon.webp" />);

        await user.click(screen.getByText('Nascondi'));
        expect(onHide).toHaveBeenCalled();
    });

    it('calls onShow when toggle clicked while closed', async () => {
        const user = userEvent.setup();
        const onShow = vi.fn();
        render(<FilterPanel onShow={onShow} onHide={vi.fn()} showLabel="Filtri" hideLabel="Nascondi" isOpen={false} mobileIcon="/icon.webp" />);

        await user.click(screen.getByText('Filtri'));
        expect(onShow).toHaveBeenCalled();
    });
});

describe('ProjectsGrid', () => {
    // Import dinamico per evitare conflitti CSS module
    it('renders projects', async () => {
        const { default: ProjectsGrid } = await import('../features/modals/projects/components/ProjectsGrid');
        const projects = [
            { id: 1, title: 'P1', description: 'D1', technologies: ['React'], repo: 'https://r.com', live: '#' },
            { id: 2, title: 'P2', description: 'D2', technologies: ['Vue'], repo: '#', live: 'https://l.com' },
        ];
        render(<ProjectsGrid projects={projects} />);
        expect(screen.getByText('P1')).toBeInTheDocument();
        expect(screen.getByText('P2')).toBeInTheDocument();
    });

    it('shows empty message when no projects', async () => {
        const { default: ProjectsGrid } = await import('../features/modals/projects/components/ProjectsGrid');
        render(<ProjectsGrid projects={[]} />);
        expect(screen.getByText(/Nessun progetto trovato/i)).toBeInTheDocument();
    });
});